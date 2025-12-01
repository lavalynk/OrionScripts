// ==================================================================
// Function: RepairGear
// Purpose:  Scan equipped layers, check durability, auto repair
//           using the correct craft bench based on item graphic
// ==================================================================

// ==================================================================
// CONFIG
// ==================================================================

var RepairConfig = {
    MinDurability: 240,
    BenchGraphics: '0xA278|0xA277|0xA27F|0xA27E',
    BenchSearchRange: 12,
    RepairGumpId: '0x00002415',
    RepairButtons: {
        tinker:     2001,
        blacksmith: 2002,
        carpenter:  2003,
        tailor:     2006,
        masonry: 2010
        
    }
};

// Layers list for printout only
var RepairLayers = [
    0,
    "RightHand",
    "LeftHand",
    "Shoes",
    "Pants",
    "Shirt",
    "Helmet",
    "Gloves",
    "Ring",
    "Talisman",
    "Necklace",
    "Hair",
    "Waist",
    "InnerTorso",
    "Bracelet",
    "Face",
    "Beard",
    "MidTorso",
    "Earrings",
    "Arms",
    "Cloak",
    "Backpack",
    "Robe",
    "Eggs",
    "Legs"
];

// built from itemArr on first use
var itemRepairLookup = null;

// ==================================================================
// Function: BuildItemRepairLookup
// Purpose:  Build { graphic: repairType } from itemArr
// ==================================================================
function BuildItemRepairLookup() {
    if (itemRepairLookup !== null) {
        return;
    }

    itemRepairLookup = {};

    for (var i = 0; i < itemArr.length; i += 3) {
        var gfx = itemArr[i];
        var crafterType = itemArr[i + 2];

        if (!gfx || !crafterType) {
            Orion.Print("RepairGear: bad itemArr entry at index " + i);
            continue;
        }

        // last definition for a graphic wins
        itemRepairLookup[gfx] = crafterType;
    }

    var keyCount = 0;
    for (var k in itemRepairLookup) {
        if (itemRepairLookup.hasOwnProperty(k)) {
            keyCount++;
        }
    }

    Orion.Print("Item repair lookup built. Keys: " + keyCount);
}

// ==================================================================
// Function: GetRepairButton
// Purpose:  Map repair type string to gump button id
// ==================================================================
function GetRepairButton(repairType) {
    var btn = RepairConfig.RepairButtons[repairType];
    if (!btn) {
        Orion.Print("RepairGear: unknown repair type [" + repairType + "]");
        return null;
    }
    return btn;
}

// ==================================================================
// Function: GetDurability
// Purpose:  Parse "Durability X / Y" from item properties
// Returns:  { cur: number, max: number } or null
// ==================================================================
function GetDurability(props) {
    if (!props || !Orion.Contains(props, 'Durability')) {
        return null;
    }

    // handle lines like "Durability 34 / 255"
    var match = props.match(/Durability\s+(\d+)\s*\/\s*(\d+)/i);
    if (!match || match.length < 3) {
        return null;
    }

    var cur = Number(match[1]);
    var max = Number(match[2]);

    if (isNaN(cur) || isNaN(max)) {
        return null;
    }

    return {
        cur: cur,
        max: max
    };
}

// ==================================================================
// Function: GetDistanceTo
// Purpose:  Tile distance from player to given coordinates
// ==================================================================
function GetDistanceTo(x, y) {
    var px = Player.X();
    var py = Player.Y();

    var dx = Math.abs(px - x);
    var dy = Math.abs(py - y);

    // UO style distance
    return Math.max(dx, dy);
}

// ==================================================================
// Function: FindRepairBench
// Purpose:  Find closest repair bench, walk closer if needed
// Returns:  bench serial or null
// ==================================================================
function FindRepairBench() {
    var benches = Orion.FindType(
        RepairConfig.BenchGraphics,
        any,
        ground,
        '',
        RepairConfig.BenchSearchRange
    );

    if (!benches || benches.length === 0) {
        Orion.Print("RepairGear: no repair bench found within " + RepairConfig.BenchSearchRange + " tiles");
        return null;
    }

    var bestBench = null;
    var bestDist = 999;

    // pick closest bench
    for (var i = 0; i < benches.length; i++) {
        var obj = Orion.FindObject(benches[i]);
        if (!obj) {
            continue;
        }

        var dist = GetDistanceTo(obj.X(), obj.Y());
        if (dist < bestDist) {
            bestDist = dist;
            bestBench = obj;
        }
    }

    if (!bestBench) {
        Orion.Print("RepairGear: could not resolve any bench objects");
        return null;
    }

    Orion.Print(
        "RepairGear: closest bench at " +
        bestBench.X() + ", " + bestBench.Y() +
        " (dist " + bestDist + ")"
    );

    // walk toward bench if not already close
    if (bestDist > 2) {
        Orion.Print("RepairGear: walking to bench");
        Orion.WalkTo(bestBench.X(), bestBench.Y());
        Orion.Wait(500);
    }

    // return serial, because UseObject expects a serial
    return bestBench.Serial();
}

// ==================================================================
// Function: OpenRepairGumpIfNeeded
// Purpose:  Open repair gump on bench if not already open
// ==================================================================
function OpenRepairGumpIfNeeded(benchSerial) {
    if (!benchSerial) {
        return false;
    }

    if (!Orion.GumpExists('generic', any, RepairConfig.RepairGumpId)) {
        Orion.UseObject(benchSerial);
    }

    if (!Orion.WaitForGump(1000)) {
        Orion.Print("RepairGear: WaitForGump timeout");
        return false;
    }

    var gump = Orion.GetGump(any, RepairConfig.RepairGumpId);
    if (!gump) {
        Orion.Print("RepairGear: repair gump not found after WaitForGump");
        return false;
    }

    return true;
}

// ==================================================================
// Function: RepairItem
// Purpose:  Run one repair action on a single equipped item
// ==================================================================
function RepairItem(layerObj, benchSerial) {
    if (!layerObj) {
        return;
    }

    var props = layerObj.Properties();
    var dura = GetDurability(props);

    if (!dura) {
        return;
    }

    // skip if above threshold or already at max
    if (dura.cur >= RepairConfig.MinDurability || dura.cur >= dura.max) {
        return;
    }

    // resolve layer name for printout
    var layerIndex = layerObj.Layer();
    var layerName = RepairLayers[layerIndex] || ("Layer " + layerIndex);

    Orion.Print(
        layerObj.Name() + " | " +
        dura.cur + "/" + dura.max + " | " +
        layerName
    );

    // find repair type from lookup
    var gfx = layerObj.Graphic();
    var repairType = itemRepairLookup[gfx];

    if (!repairType) {
        Orion.Print("RepairGear: no repair mapping for graphic " + gfx);
        return;
    }

    var buttonId = GetRepairButton(repairType);
    if (!buttonId) {
        return;
    }

    if (!OpenRepairGumpIfNeeded(benchSerial)) {
        return;
    }

    var gump = Orion.GetGump(any, RepairConfig.RepairGumpId);
    if (!gump) {
        Orion.Print("RepairGear: repair gump vanished");
        return;
    }

    // press correct craft button
    gump.Select(Orion.CreateGumpHook(buttonId));

    // wait for target and target the item
    if (Orion.WaitForTarget(2000)) {
        Orion.TargetObject(layerObj.Serial());
        Orion.Wait(200);
    } else {
        Orion.Print("RepairGear: target timeout on " + layerObj.Name());
    }
}

// ==================================================================
// Function: RepairGear
// Purpose:  Main entry - scan equipped items and repair as needed
// ==================================================================
function RepairGear() {
    BuildItemRepairLookup();

    Orion.Print("Repair threshold set at: " + RepairConfig.MinDurability);

    var bench = FindRepairBench();
    if (!bench) {
        Orion.Print("RepairGear: no bench found - aborting");
        return;
    }

    // start at 1 to match your original pattern
    for (var i = 1; i < RepairLayers.length; i++) {
        var layerObj = Orion.ObjAtLayer(i);
        if (!layerObj) {
            continue;
        }

        RepairItem(layerObj, bench);
    }
}


// Monitor All Gear Durability & Print Fast Warning if Below 50
function checkDurability() {
    while (true) {
        if (!Player.Dead()) {
            for (var i = 1; i < 24; i++) { 
                var item = Orion.ObjAtLayer(i);
                if (item) {
                    var properties = item.Properties();
                    var matched = properties.match(/Durability (\d+)\s\/\s(\d+)/);
                    if (matched) {
                        var itemDurability = Number(matched[1]);
                        if (itemDurability < 50) {
                            Orion.CharPrint(self, "0x0021", "WARNING: " + item.Name() + " is LOW! (" + itemDurability + ")");							                                                    
                        }
                    }
                }
            }
        }
        Orion.Wait(10000); // 10-second delay before next check
    }
}

var itemArr = 
	[
	'0x2D2D',				'Assassin Spike(left)',							'blacksmith',
	'0x2D21',				'Assassin Spike(right)',						'blacksmith',
	'0x0F4A',				'Axe(left)',											'blacksmith',
	'0x0F49',					'Axe(right)',										'blacksmith',
	'0x0F4E',					'Bardiche(left)',									'blacksmith',
	'0x0F4D',				'Bardiche(right)',									'blacksmith',
	'0x0F48',					'Battle Axe(left)',									'blacksmith',
	'0x0F47',					'Battle Axe(right)',								'blacksmith',
	'0x0DF0',				'Black Staff(left)',								'carpenter',
	'0x0DF1',				'Black Staff(right)',								'carpenter',
	'0x26BD',				'Bladed Staff(left)',								'blacksmith',
	'0x26C7',				'Bladed Staff(right)',							'blacksmith',
	'0x27A8',				'Bokuto(mono)',									'carpenter',
	'0x26BB',				'Bone Harvester(left)',							'blacksmith',
	'0x26C5',				'Bone Harvester(right)',						'blacksmith',
	'0x13B1',				'Bow(left)',											'fletcher',
	'0x13B2',				'Bow(right)',										'fletcher',
	'0x0F5F',					'Broadsword(left)',								'blacksmith',
	'0x0F5E',					'Broadsword(right)',							'blacksmith',
	'0x1B72',				'Bronze Shield(mono)',						'blacksmith',
	'0x1B73',				'Buckler (mono)',								'blacksmith',
	'0x13F7',					'Butcher Knife(left)',							'tinker',
	'0x13F6',					'Butcher Knife(right)',							'tinker',
	'0x1BC3',				'Chaos Shield(mono)',							'blacksmith',
	'0x0EC2',				'Cleaver(left)',									'tinker',
	'0x0EC3',				'Cleaver(right)',									'tinker',
	'0x13B3',				'Club(left)',											'carpenter',
	'0x13B4',				'Club(right)',										'carpenter',
	'0x26C2',				'Composite Bow(left)',							'fletcher',
	'0x26CC',				'Composite Bow(right)',						'fletcher',
	'0x26C1',				'Crescent Blade(left)',							'blacksmith',
	'0x26CB',				'Crescent Blade(right)',						'blacksmith',
	'0x13F4',					'Crook(left)',										'carpenter',
	'0x13F5',					'Crook(right)',										'carpenter',
	'0x0F50',					'Crossbow(left)',									'fletcher',
	'0x0F4F',					'Crossbow(right)',								'fletcher',
	'0x1440',					'Cutlass(left)',										'blacksmith',
	'0x1441',					'Cutlass(right)',									'blacksmith',
	'0x0F52',					'Dagger(left)',										'blacksmith',
	'0x0F51',					'Dagger(right)',									'blacksmith',
	'0x27A9',				'Daisho(mono)',									'blacksmith',
	'0x2D30',				'Diamond Mace(left)',							'blacksmith',
	'0x2D24',				'Diamond Mace(right)',						'blacksmith',
	'0x0F4C',				'Double Axe(left)',								'blacksmith',
	'0x0F4B',				'Double Axe(right)',								'blacksmith',
	'0x26BF',				'Double Bladed Staff(left)',					'blacksmith',
	'0x26C9',				'Double Bladed Staff(right)',					'blacksmith',
	'0x2D2A',				'Elven Composite Longbow(left)',			'fletcher',
	'0x2D1E',				'Elven Composite Longbow(right)',		'fletcher',
	'0x2D35',				'Elven Machete(left)',							'blacksmith',
	'0x2D29',				'Elven Machete(right)',						'blacksmith',
	'0x2D2C',				'Elven Spellblade(left)',						'blacksmith',
	'0x2D20',				'Elven Spellblade(right)',						'blacksmith',
	'0x0F46',					"Executioner's Axe(left)",						'blacksmith',
	'0x0F45',					"Executioner's Axe(right)",					'blacksmith',
	'0x13F9',					'Gnarled Staff(left)',							'carpenter',
	'0x13F8',					'Gnarled Staff(right)',							'carpenter',
	'0x143E',					'Halberd(left)',									'blacksmith',
	'0x143F',					'Halberd(right)',									'blacksmith',
	'0x143C',				'Hammer Pick(left)',							'blacksmith',
	'0x143D',				'Hammer Pick(right)',							'blacksmith',
	'0x0F44',					'Hatchet(left)',									'tinker',
	'0x0F43',					'Hatchet(right)',									'tinker',
	'0x1B77',				'Heater Shield(left)',							'blacksmith',
	'0x1B76',				'Heater Shield(right)',							'blacksmith',
	'0x13FC',				'Heavy Crossbow(left)',						'fletcher',
	'0x13FD',				'Heavy Crossbow(right)',						'fletcher',
	'0x27AD',				'Kama(mono)',									'blacksmith',
	'0x13FE',					'Katana(left)',										'blacksmith',
	'0x13FF',					'Katana(right)',									'blacksmith',
	'0x1400',					'Kryss(left)',										'blacksmith',
	'0x1401',					'Kryss(right)',										'blacksmith',
	'0x27A7',				'Lajatang(mono)',								'blacksmith',
	'0x26C0',				'Lance(left)',										'blacksmith',
	'0x26CA',				'Lance(right)',										'blacksmith',
	'0x13FA',				'Large Battle Axe(left)',						'blacksmith',
	'0x13FB',				'Large Battle Axe(right)',						'blacksmith',
	'0x2D2E',				'Leafblade(left)',									'blacksmith',
	'0x2D22',				'Leafblade(right)',								'blacksmith',
	'0x0F60',					'Longsword(left)',								'blacksmith',
	'0x0F61',					'Longsword(right)',								'blacksmith',
	'0x0F5D',				'Mace(left)',										'blacksmith',
	'0x0F5C',				'Mace(right)',										'blacksmith',
	'0x2D2B',				'Magical Shortbow(left)',						'fletcher',
	'0x2D1F',				'Magical Shortbow(right)',					'fletcher',
	'0x143A',				'Maul(left)',										'blacksmith',
	'0x143B',				'Maul(right)',										'blacksmith',
	'0x1B75',				'Metal Kite Shield(left)',						'blacksmith',
	'0x1B74',				'Metal Kite Shield(right)',						'blacksmith',
	'0x1B7B',				'Metal Shield(mono)',							'blacksmith',
	'0x27A2',				'No-dachi(mono)',								'blacksmith',
	'0x27AE',				'Nunchaku(mono)',								'tinker',
	'0x1BC5',				'Order Shield(left)',								'blacksmith',
	'0x1BC4',				'Order Shield(right)',							'blacksmith',
	'0x2D34',				'Ornate Axe(left)',								'blacksmith',
	'0x2D28',				'Ornate Axe(right)',								'blacksmith',
	'0x0E85',					'Pickaxe(left)',									'tinker',
	'0x0E86',					'Pickaxe(right)',									'tinker',
	'0x26BE',				'Pike(left)',											'blacksmith',
	'0x26C8',				'Pike(right)',										'blacksmith',
	'0x0E88',					'Pitchfork(left)',									'tinker',
	'0x0E87',					'Pitchfork(right)',									'tinker',
	'0x0E8A',				'Quarter Staff(left)',							'carpenter',
	'0x0E89',					'Quarter Staff(right)',							'carpenter',
	'0x2D33',				'Radiant Scimitar(left)',						'blacksmith',
	'0x2D27',				'Radiant Scimitar(right)',						'blacksmith',
	'0x26C3',				'Repeating Crossbow(left)',					'fletcher',
	'0x26CD',				'Repeating Crossbow(right)',				'fletcher',
	'0x2D32',				'Rune Blade(left)',								'blacksmith',
	'0x2D26',				'Rune Blade(right)',								'blacksmith',
	'0x27AF',				'Sai(mono)',										'blacksmith',
	'0x26BC',				'Scepter(left)',									'blacksmith',
	'0x26C6',				'Scepter(right)',									'blacksmith',
	'0x13B5',				'Scimitar(left)',									'blacksmith',
	'0x13B6',				'Scimitar(right)',									'blacksmith',
	'0x26BA',				'Scythe(left)',										'blacksmith',
	'0x26C4',				'Scythe(right)',									'blacksmith',
	'0x1402',					'Short Spear(left)',								'blacksmith',
	'0x1403',					'Short Spear(right)',							'blacksmith',
	'0x0EC5',				'Skinning Knife(left)',							'tinker',
	'0x0EC4',				'Skinning Knife(right)',							'tinker',
	'0x0FB4',				'Sledge Hammer(left)',						'tinker',
	'0x0FB5',				'Sledge Hammer(right)',						'tinker',
	'0x13E3',					"Smith's Hammer(left)",						'tinker',
	'0x13E4',					"Smith's Hammer(right)",					'tinker',
	'0x0F63',					'Spear(left)',										'blacksmith',
	'0x0F62',					'Spear(right)',									'blacksmith',
	'0x1B79',				'Tear Kite Shield(left)',						'blacksmith',
	'0x1B78',				'Tear Kite Shield(right)',						'blacksmith',
	'0x27AB',				'Tekagi(mono)',									'blacksmith',
	'0x27A3',				'Tessen(mono)',									'blacksmith',
	'0x27A6',				'Tetsubo(mono)',								'carpenter',
	'0x1442',					'Two Handed Axe(left)',						'blacksmith',
	'0x1443',					'Two Handed Axe(right)',						'blacksmith',
	'0x13BA',				'Viking Sword(left)',							'blacksmith',
	'0x13B9',				'Viking Sword(right)',							'blacksmith',
	'0x27A4',				'Wakizashi(mono)',								'blacksmith',
	'0x13AF',				'War Axe(left)',									'blacksmith',
	'0x13B0',				'War Axe(right)',									'blacksmith',
	'0x2D2F',				'War Cleaver(left)',								'blacksmith',
	'0x2D23',				'War Cleaver(right)',							'blacksmith',
	'0x1404',	'War Fork(left)',									'blacksmith',
	'0x1405',	'War Fork(right)',								'blacksmith',
	'0x1438',	'War Hammer(left)',							'blacksmith',
	'0x1439',	'War Hammer(right)',							'blacksmith',
	'0x1406',	'War Mace(left)',								'blacksmith',
	'0x1407',	'War Mace(right)',								'blacksmith',
	'0x2D31',	'Wild Staff(left)',									'carpenter',
	'0x2D25',	'Wild Staff(right)',								'carpenter',
	'0x1B7A',	'Wooden Shield(mono)',						'carpenter',
	'0x27A5',	'Yumi(mono)',									'fletcher',
	'0x153F',	'Bandana(mono)',								'tailor',
	'0x140D',	'Bascinet(left)',									'blacksmith',
	'0x140C',	'Bascinet(right)',									'blacksmith',
	'0x1545',	'Bear Mask(mono)',								'tailor',
	'0x1454',	'Bone Armor(left)',								'tailor',
	'0x144F',	'Bone Armor(right)',							'tailor',
	'0x144E',	'Bone Arms(left)',								'tailor',
	'0x1453',	'Bone Arms(right)',								'tailor',
	'0x1450',	'Bone Gloves(left)',								'tailor',
	'0x1455',	'Bone Gloves(right)',							'tailor',
	'0x1451',	'Bone Helmet(left)',								'tailor',
	'0x1456',	'Bone Helmet(right)',							'tailor',
	'0x1457',	'Bone Leggings(left)',							'tailor',
	'0x1452',	'Bone Leggings(right)',						'tailor',
	'0x1F06',	'Bracelet(mono)',								'tinker',
	'0x1086',	'Bracelet(mono)',								'tinker',
	'0x13BB',	'Chainmail Coif(left)',							'blacksmith',
	'0x13C0',	'Chainmail Coif(right)',						'blacksmith',
	'0x2774',	'Chainmail Hatsuburi(mono)',				'blacksmith',
	'0x13C3',	'Chainmail Leggings(mono)',				'blacksmith',
	'0x13C4',	'Chainmail Tunic(mono)',						'blacksmith',
	'0x1409',	'Close Helm(left)',								'blacksmith',
	'0x1408',	'Close Helmet(right)',							'blacksmith',
	'0x2778',	'Decorative Platemail Kabuto(mono)',	'blacksmith',
	'0x1547',	'Deer Mask(mono)',							'tailor',
	'0x171A',	'Feathered Hat(mono)',						'tailor',
	'0x1C07',	'Female Leather Armor(left)',				'tailor',
	'0x1C06',	'Female Leather Armor(right)',				'tailor',
	'0x1C05',	'Female Plate(left)',							'blacksmith',
	'0x1C04',	'Female Plate(right)',							'blacksmith',
	'0x1713',	'Floppy Hat(mono)',							'tailor',
	'0x2777',	'Heavy Platemail Jingasa(mono)',			'blacksmith',
	'0x140B',	'Helmet(left)',										'blacksmith',
	'0x140A',	'Helmet(right)',									'blacksmith',
	'0x2B75',	'Hide Gloves(mono)',							'tailor',
	'0x2B76',	'Hide Gorget(mono)',							'tailor',
	'0x2B78',	'Hide Pants(mono)',							'tailor',
	'0x2B77',	'Hide Pauldrons(mono)',						'tailor',
	'0x2B74',	'Hide Tunic(mono)',							'tailor',
	'0x171C',	'Jester Hat(mono)',								'tailor',
	'0x2798',	'Kasa(mono)',										'tailor',
	'0x2FC8',	'Leaf Arms(mono)',								'tailor',
	'0x2FC6',	'Leaf Gloves(mono)',							'tailor',
	'0x2FC7',	'Leaf Gorget(mono)',							'tailor',
	'0x2FC9',	'Leaf Leggings(mono)',						'tailor',
	'0x2FCA',	'Leaf Tonlet(mono)',							'tailor',
	'0x2FC5',	'Leaf Tunic(mono)',								'tailor',
	'0x1C0B',	'Leather Bustier(left)',							'tailor',
	'0x1C0A',	'Leather Bustier(right)',						'tailor',
	'0x1DB9',	'Leather Cap(left)',								'tailor',
	'0x1DBA',	'Leather Cap(right)',							'tailor',
	'0x277B',	'Leather Do(mono)',							'tailor',
	'0x13C6',	'Leather Gloves(left)',							'tailor',
	'0x13CE',	'Leather Gloves(right)',						'tailor',
	'0x13C7',	'Leather Gorget(mono)',						'tailor',
	'0x278A',	'Leather Haidate(mono)','					tailor',
	'0x277E',	'Leather Hiro Sode(mono)',					'tailor',
	'0x2776',	'Leather Jingasa(mono)',						'tailor',
	'0x13D2',	'Leather Leggings(left)',						'tailor',
	'0x13CB',	'Leather Leggings(right)',						'tailor',
	'0x277A',	'Leather Mempo(mono)',						'tailor',
	'0x278E',	'Leather Ninja Hood(mono)',				'tailor',
	'0x2793',	'Leather Ninja Jacket(mono)',				'tailor',
	'0x2792',	'Leather Ninja Mitts(mono)',					'tailor',
	'0x2791',	'Leather Ninja Pants(mono)'	,				'tailor',
	'0x1C01',	'Leather Shorts(left)',							'tailor',
	'0x1C00',	'Leather Shorts(right)',						'tailor',
	'0x1C09',	'Leather Skirt(left)',								'tailor',
	'0x1C08',	'Leather Skirt(right)',							'tailor',
	'0x13C5',	'Leather Sleeves(left)',						'tailor',
	'0x13CD',	'Leather Sleeves(right)',						'tailor',
	'0x2786',	'Leather Suneate(mono)',					'tailor',
	'0x13D3',	'Leather Tunic(left)',							'tailor',
	'0x13CC',	'Leather Tunic(right)',							'tailor',
	'0x2781',	'Light Platemail Jingasa(mono)',			'blacksmith',
	'0x140F',	'Norse Helm(left)',								'blacksmith',
	'0x140E',	'Norse Helm(right)',							'blacksmith',
	'0x1F0B',	'Orc Helm(left)',									'tailor',
	'0x1F0C',	'Orc Helm(right)',								'tailor',
	'0x141B',	'Orc Mask(mono)',								'tailor',
	'0x1412',	'Plate Helm(left)',								'blacksmith',
	'0x1419',	'Plate Helm(right)',								'blacksmith',
	'0x1410',	'Platemail Arms(left)',							'blacksmith',
	'0x1417',	'Platemail Arms(right)',						'blacksmith',
	'0x2785',	'Platemail Battle Kabuto(mono)',			'blacksmith',
	'0x277D',	'Platemail Do(mono)',							'blacksmith',
	'0x1414',	'Platemail Gloves(left)',						'blacksmith',
	'0x1418',	'Platemail Gloves(right)',						'blacksmith',
	'0x1413',	'Platemail Gorget(mono)',					'blacksmith',
	'0x278D',	'Platemail Haidate(mono)',					'blacksmith',
	'0x2775',	'Platemail Hatsuburi(mono)',				'blacksmith',
	'0x2780',	'Platemail Hiro Sode(mono)',				'blacksmith',
	'0x141A',	'Platemail Legs(left)',							'blacksmith',
	'0x1411',	'Platemail Legs(right)',						'blacksmith',
	'0x2779',	'Platemail Mempo(mono)',					'blacksmith',
	'0x2788',	'Platemail Suneate(mono)',					'blacksmith',
	'0x1416',	'Platemail Tunic(left)',							'blacksmith',
	'0x1415',	'Platemail Tunic(right)',						'blacksmith',
	'0x2B71',	'Raven Helm(mono)',							'carpenter',
	'0x1F09',	'Ring(mono)',										'tinker',
	'0x108A',	'Ring(mono)',										'tinker',
	'0x13EB',	'Ringmail Gloves(left)',						'blacksmith',
	'0x13F2',	'Ringmail Gloves(right)',						'blacksmith',
	'0x13F1',	'Ringmail Leggings(left)',						'blacksmith',
	'0x13F0',	'Ringmail Leggings(right)',					'blacksmith',
	'0x13EF',	'Ringmail Sleeves(left)',						'blacksmith',
	'0x13EE',	'Ringmail Sleeves(right)',						'blacksmith',
	'0x13ED',	'Ringmail Tunic(left)',							'blacksmith',
	'0x13EC',	'Ringmail Tunic(right)',						'blacksmith',
	'0x1543',	'Skullcap(mono)',								'tailor',
	'0x2784',	'Small Platemail Jingasa(mono)',			'blacksmith',
	'0x2789',	'Standard Platemail Kabuto(mono)',		'blacksmith',
	'0x1717',	'Straw Hat(mono)',								'tailor',
	'0x1C03',	'Studded Armor(mono)',						'tailor',
	'0x1C0D',	'Studded Bustier(left)',						'tailor',
	'0x1C0C',	'Studded Bustier(right)',						'tailor',
	'0x277C',	'Studded Do(mono)',							'tailor',
	'0x13D5',	'Studded Gloves(left)',							'tailor',
	'0x13DD',	'Studded Gloves(right)',						'tailor',
	'0x13D6',	'Studded Gorget(mono)',						'tailor',
	'0x278B',	'Studded Haidate(mono)',					'tailor',
	'0x277F',	'Studded Hiro Sode(mono)',					'tailor',
	'0x13E1',	'Studded Leggings(left)',						'tailor',
	'0x13DA',	'Studded Leggings(right)',					'tailor',
	'0x279D',	'Studded Mempo(mono)',					'tailor',
	'0x13D4',	'Studded Sleeves(left)',						'tailor',
	'0x13DC',	'Studded Sleeves(right)',						'tailor',
	'0x2787',	'Studded Suneate(mono)',					'tailor',
	'0x13E2',	'Studded Tunic(left)',							'tailor',
	'0x13DB',	'Studded Tunic(right)',						'tailor',
	'0x1716',	'Tall Straw Hat(mono)',						'tailor',
	'0x1549',	'Tribal Mask A(mono)',						'tailor',
	'0x154B',	'Tribal Mask B(mono)',						'tailor',
	'0x171B',	'Tricorne Hat(mono)',							'tailor',
	'0x2B72',	'Vulture Helm(mono)',							'carpenter',
	'0x1714',	'Wide-brim Hat(mono)',						'tailor',
	'0x2B73',	'Winged Helm(mono)',						'carpenter',
	'0x1718',	"Wizard's Hat(mono)",						'tailor',
	'0x2B6C',	'Woodland Arms(mono)',						'carpenter',
	'0x2B67',	'Woodland Chest(mono)',					'carpenter',
	'0x2B6A',	'Woodland Gauntlets(mono)',				'carpenter',
	'0x2B69',	'Woodland Gorget(mono)',					'carpenter',
	'0x2B6B',	'Woodland Leggings(mono)',				'carpenter',
	'0x153B',	'Apron',												'tailor',
	'0x1541',		'Lieutenant of the Britannian Royal Guard',	'tailor', 	
	'0x406B',	'Soul Glaive',		'blacksmith',
	'0x405E',		'Stone Leggings (Gargoyle)',	'masonry',
	'0x405C',	'Stone Kilt (Gargoyle)',	'masonry',
	'0x4644',		'Gargish Glasses (Gargoyle)', 'tinker',
	'0x4050',		'Platemail Arms (Gargoyle)',	'blacksmith',
	'0x4D0A',	'Stone Necklace (Gargoyle)',	'masonry',
	'0x405A',	'Stone Armor (Gargoyle)', 'masonry',
	]
