////////////////////////////////////////////////////////////////////////////////////
// BOD Filler
// Version: 2.0
// By Lava
//
// Summary:
//   Bulk Order Deed helper for blacksmith BODs.
//   Uses a small GUI to point the script at your containers and BOD books,
//   then loops: pulls a deed, reads the requirements, crafts the items,
//   adds them to the deed, moves the finished deed, and cleans up ingots.
//
// What the GUI lets you set:
//   - Resource Container: where all ingots live.
//   - Salvage Bag: where tools and crafted items go, and where salvaging happens.
//   - Source BOD Book: book that holds BODs that still need to be filled.
//   - Finished BOD Book: book that receives completed BODs.
//   - Start BOD Filler: toggle to start or stop the main BODFiller loop.
//
// Requirements in game:
//   - A container with ingots for all supported metal types.
//   - A salvage bag near the player that can hold tools and crafted items.
//   - Smith and tinker tools in the salvage bag, or enough ingots to make them.
//   - Classic smith BOD books that use graphic 0x2258.
//   - BODs that match the items listed in BlackSmithItemMap.
//
// How it behaves:
//   - Uses GetSourceBODBook and GetDoneBODBook to find the right books.
//   - Reads BOD properties to find item type, metal, and required quantity.
//   - Switches the smith gump to the correct page and metal type.
//   - Crafts until the count matches, then adds items to the BOD and salvages extras.
//   - Tracks progress in the GUI status line so it is clear what it is doing.
//
// Notes:
//   - Only blacksmith items defined in BlackSmithItemMap are supported.
//   - Metal type gump buttons and ingot colors are configured in
//     BlackSmithMetalMap and IngotTypeMap.
//   - Timings are tuned for a typical shard and may need adjusting per shard lag.
//
////////////////////////////////////////////////////////////////////////////////////

// ======================================
// GUI - builds and displays the main BOD Filler interface
// ======================================
function GUI() {
    Orion.Wait(100);

    var g = Orion.CreateCustomGump(101099);
    g.Clear();
    g.SetCallback('OnClick');

    const width = 8;
    const height = 10;

    // ======================================
    // Background frame tiles
    // ======================================
    for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            if (y == 0 && x == 0) {
                g.AddGumpPic(x * 35, y * 35, 0x9C40);
            } else if (x == 0 && y == height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9C46);
            } else if (x == 0 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9C43);
            } else if (x == width - 1 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9C45);
            } else if (y == height - 1 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9C48);
            } else if (y == 0 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9C42);
            } else if (y == 0 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9C41);
            } else if (y == height - 1 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9C47);
            } else {
                g.AddGumpPic(x * 35, y * 35, 0x9C44);
            }
        }
    } // End of Background Setup

    var prompt = 50;
    var tprompt = prompt + 2;
    var arrow = 235; // not used but left as original

    // Checker transparency over full gump area
    g.AddCheckerTrans(0, 0, x * 35, y * 35);

    // ======================================
    // Resource container line
    // ======================================
    g.AddText(60, tprompt, 52, 'Resource Container: ' + GetResource());
    g.AddButton(1001, 25, prompt, SetRecCheck(), SetRecCheck(), SetRecCheck(), '');
    prompt += 30;
    tprompt = prompt + 2;

    // ======================================
    // Salvage bag line
    // ======================================
    g.AddText(60, prompt, 52, 'Salvage Bag: ' + GetSalvage());
    g.AddButton(1002, 25, prompt, SetSalvCheck(), SetSalvCheck(), SetSalvCheck(), '');
    prompt += 30;
    tprompt = prompt + 2;

    // ======================================
    // Source BOD book line
    // ======================================
    g.AddText(60, prompt, 52, 'Source BOD Book: ' + GetSourceBODBook());
    g.AddButton(1003, 25, prompt, SetSourBOD(), SetSourBOD(), SetSourBOD(), '');
    prompt += 30;
    tprompt = prompt + 2;

    // ======================================
    // Finished BOD book line
    // ======================================
    g.AddText(60, prompt, 52, 'Finished BOD Book: ' + GetDoneBODBook());
    g.AddButton(1004, 25, prompt, SetFinBOD(), SetFinBOD(), SetFinBOD(), '');
    prompt += 30;
    tprompt = prompt + 2;

    // Divider line
    g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2);
    prompt += 20;

    // ======================================
    // Tongs charges display
    // ======================================
    g.AddTilePic(25, prompt, 0x0FBC, 0);
    g.AddText(55, prompt, '60', ' - ' + TongCharges());
    if (TongCharges() < 10) {
        g.AddText(55, prompt, '33', ' - ' + TongCharges());
    }
    prompt += 30;
    tprompt = prompt + 2;

    // ======================================
    // Tinker tool charges display
    // ======================================
    g.AddTilePic(25, prompt, 0x1EB9, 0);
    g.AddText(55, prompt, '60', ' - ' + TinkerCharges());
    if (TinkerCharges() < 10) {
        g.AddText(55, prompt, '33', ' - ' + TinkerCharges());
    }
    prompt += 30;
    tprompt = prompt + 2;

    // Divider line
    g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2);
    prompt += 10;
    tprompt = prompt + 2;

    // ======================================
    // Start or stop BOD Filler toggle
    // ======================================
    g.AddText(60, tprompt + 2, GetColorStatus('BODFiller'), 'Start BOD Filler');
    g.AddButton(1005, 25, prompt, GetCheckboxStatus('BODFiller'), GetCheckboxStatus('BODFiller'), GetCheckboxStatus('BODFiller'), '');
    prompt += 30;
    tprompt = prompt + 2;

    // Status text
    g.AddText(25, prompt + 10, '72', 'Status: ');
    g.AddText(75, prompt + 10, '55', Orion.GetGlobal('gui_status'));

    // Title
    g.AddText(25, 10, 89, 'BOD Filler', 0);

    g.Update();
}

// ======================================
// OnClick - handles button clicks from the GUI
// ======================================
function OnClick() {
    var buttonID = CustomGumpResponse.ReturnCode();

    switch (buttonID) {
        case 1001:
            SetResource();
            GUI();
            break;

        case 1002:
            SetSalvage();
            GUI();
            break;

        case 1003:
            SetSourceBODBook();
            GUI();
            break;

        case 1004:
            SetDoneBOD();
            GUI();
            break;

        case 1005:
            Orion.ToggleScript('BODFiller');
            Orion.Wait(200);
            GUI();
            break;
    }
}

// ======================================
// UpdateGUIStatus - sets status text and refreshes GUI
// ======================================
function UpdateGUIStatus(msg) {
    var currentMessage = Orion.GetGlobal('gui_status');
    if (currentMessage == msg) {
        return;
    }
    Orion.SetGlobal('gui_status', msg);
    GUI();
}

// ======================================
// GetCheckboxStatus - returns checked or unchecked gump ID based on script running
// ======================================
function GetCheckboxStatus(scriptName) {
    const scriptRunning = Orion.ScriptRunning(scriptName) > 0;
    return scriptRunning ? 0x2602 : 0x2603;
}

// ======================================
// GetColorStatus - returns color for text based on script running
// ======================================
function GetColorStatus(scriptName) {
    const scriptRunning = Orion.ScriptRunning(scriptName) > 0;
    return scriptRunning ? 70 : 33;
}

// ======================================
// SetRecCheck - resource container checkmark graphic
// ======================================
function SetRecCheck() {
    if (GetResource() != 0) {
        return 0x26B0;
    } else {
        return 0x26AF;
    }
}

// ======================================
// SetSalvCheck - salvage bag checkmark graphic
// ======================================
function SetSalvCheck() {
    if (GetSalvage() != 0) {
        return 0x26B0;
    } else {
        return 0x26AF;
    }
}

// ======================================
// SetSourBOD - source BOD book checkmark graphic
// ======================================
function SetSourBOD() {
    if (GetSourceBODBook() != 0) {
        return 0x26B0;
    } else {
        return 0x26AF;
    }
}

// ======================================
// SetFinBOD - finished BOD book checkmark graphic
// ======================================
function SetFinBOD() {
    if (GetSourceBODBook() != 0) {
        return 0x26B0;
    } else {
        return 0x26AF;
    }
}

// ======================================
// Global constants
// ======================================
const INGOTS_GRAPHIC = '0x1BF2';
const long_delay = '1500';
const short_delay = '1100';
const shortest_delay = '600';
const msg = 'Target your Resource Container with igs';

// ======================================
// Legacy SetSourceBODBook - original target method (kept as is)
// ======================================
function SetSourceBODBook() {
    const msg = "Target your BOD's to Fill book";
    Orion.AddObject('sourceBook');
    Orion.Print('-1', msg);
    Orion.PrintFast(Player.Serial(), 75, 0, msg);
    Orion.WaitWhileTargeting();
}

// ======================================
// Legacy SetDoneBODBook - original target method (kept as is)
// ======================================
function SetDoneBODBook() {
    const msg = 'Target your BOD Done book';
    Orion.AddObject('doneBook');
    Orion.Print('-1', msg);
    Orion.PrintFast(Player.Serial(), 75, 0, msg);
    Orion.WaitWhileTargeting();
}

// ======================================
// New SetSourceBODBook - auto config source BOD book (active version)
// ======================================
function SetSourceBODBook() {
    UpdateGUIStatus('Set Source BOD Book...');
    Orion.WaitForAddObject('ac_sourcebod', 25000);
    Orion.Wait(500);
    GUI();
}

// ======================================
// GetSourceBODBook - returns serial of configured source BOD book
// ======================================
function GetSourceBODBook() {
    var secure = Orion.FindObject('ac_sourcebod');
    if (secure) {
        return secure.Serial();
    }
    return '0';
}

// ======================================
// SetDoneBOD - config finished BOD book
// ======================================
function SetDoneBOD() {
    UpdateGUIStatus('Set Finished BOD Book...');
    Orion.WaitForAddObject('ac_donebod', 25000);
    Orion.Wait(500);
    GUI();
}

// ======================================
// GetDoneBODBook - returns serial of configured finished BOD book
// ======================================
function GetDoneBODBook() {
    var secure = Orion.FindObject('ac_donebod');
    if (secure) {
        return secure.Serial();
    }
    return '0';
}

// ======================================
// SetResource - config resource container
// ======================================
function SetResource() {
    UpdateGUIStatus('Set Resource Container...');
    Orion.WaitForAddObject('ac_resource', 25000);
    Orion.Wait(500);
    GUI();
}

// ======================================
// GetResource - returns serial of configured resource container
// ======================================
function GetResource() {
    var secure = Orion.FindObject('ac_resource');
    if (secure) {
        return secure.Serial();
    }
    return '0';
}

// ======================================
// SetSalvage - config salvage bag
// ======================================
function SetSalvage() {
    UpdateGUIStatus('Set Salvage Bag...');
    Orion.WaitForAddObject('ac_salvage', 25000);
    Orion.Wait(500);
    GUI();
}

// ======================================
// GetSalvage - returns serial of configured salvage bag
// ======================================
function GetSalvage() {
    var secure = Orion.FindObject('ac_salvage');
    if (secure) {
        return secure.Serial();
    }
    return '0';
}

// ======================================
// BOD configuration object
// ======================================
const config = {
    bodGraphic: '0x2258',
    bodColors: {
        smithing: '0x044E',
        tailoring: '0x0483',
        carpenty: '0x05E8'
    },
    container: {
        ingots: GetResource()
    }
};

// ======================================
// BODFiller - main loop for filling BODs
// ======================================
function BODFiller() {
    Orion.UseObject(GetResource());
    Orion.Wait(long_delay);

    while (!Player.Dead()) {
        FillBODs();
    }
}

// ======================================
// Init - quick setup helper (kept as original)
// ======================================
function Init() {
    SetSourceBODBook();
    Orion.Wait(short_delay);

    SetDoneBODBook();
    Orion.Wait(short_delay);

    SetSalvageBag();
    Orion.Wait(short_delay);

    SetSmithTool();
    Orion.Wait(short_delay);
}

// ======================================
// GetBOD - opens source book and pulls a deed into backpack
// ======================================
function GetBOD() {
    Orion.UseObject(GetSourceBODBook());
    Orion.WaitForGump();
    var gump = Orion.GetGump(0);
    var hook = Orion.CreateGumpHook(4);
    Orion.Wait(short_delay);
    gump.Select(hook);
    Orion.Wait(short_delay);
    gump = Orion.GetGump(0);
    Orion.Wait(short_delay);
    if (gump) {
        hook = Orion.CreateGumpHook(0);
        Orion.Wait(short_delay);
        gump.Select(hook);
    }
}

// ======================================
// SetCurrentBOD - tracks the active BOD in an object variable
// ======================================
function SetCurrentBOD() {
    var bod = Orion.FindType(config.bodGraphic);

    if (bod == '') {
        while (bod == '') {
            GetBOD();
            bod = Orion.FindType(config.bodGraphic);
        }
    }

    Orion.AddObject('currentBOD', bod[0]);
}

// ======================================
// FillBODs - full workflow for one BOD from start to finish
// ======================================
function FillBODs() {
    UpdateGUIStatus('Getting BOD from Source...');
    GetBOD();
    Orion.Wait('1000');

    UpdateGUIStatus('Setting Current BOD...');
    SetCurrentBOD();
    Orion.AddDisplayTimer('id', short_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(short_delay);

    const itemInfo = GetMaterials();
    Orion.AddDisplayTimer('id', short_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(short_delay);

    UpdateGUIStatus('Setting Material Type...');
    SetMaterialType(itemInfo.metalType);
    Orion.AddDisplayTimer('id', short_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(short_delay);

    UpdateGUIStatus('Crafting Item!');
    CraftItem(itemInfo.itemType, itemInfo.makeCount);
    Orion.AddDisplayTimer('id', short_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(short_delay);

    MoveCompleteBOD();
    Orion.Wait(short_delay);

    BackstockIngots();
    Orion.Wait(short_delay);
}

// ======================================
// MoveCompleteBOD - moves completed BOD into finished book
// ======================================
function MoveCompleteBOD() {
    const completedBOD = Orion.FindType('0x2258', -1, backpack);
    const doneBook = GetDoneBODBook();

    Orion.MoveItem(completedBOD, 1, doneBook);

    Orion.WaitForGump();
    const gump = Orion.GetGump(0);

    // close BOD book
    var hook = Orion.CreateGumpHook(0);
    Orion.Wait(short_delay);
    gump.Select(hook);
    Orion.Wait(short_delay);
}

// ======================================
// GetMaterials - parses BOD for item and metal, pulls ingots, returns info
// ======================================
function GetMaterials() {
    const bod = Orion.FindObject('currentBOD');
    const props = bod.Properties();

    const makeCount = GetMakeCount(props);
    const itemType = GetItemType(props).trim();
    const metalType = GetMetalType(props);

    GetIngots(metalType, 1000);
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);

    return { itemType: itemType, makeCount: makeCount, metalType: metalType };
}

// ======================================
// GetIngots - pulls ingots of the correct type from container into salvage bag
// ======================================
function GetIngots(metalType, count) {
    const ingotType = IngotTypeMap[metalType];

    Orion.UseObject(config.container.ingots);
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);

    const ingots = Orion.FindType(INGOTS_GRAPHIC, ingotType, config.container.ingots);

    if (ingots != '') {
        Orion.DragItemType(INGOTS_GRAPHIC, ingotType, config.container.ingots, count);
        Orion.AddDisplayTimer('id', 2500, 'UnderChar', 'Circle|Bar');
        Orion.Wait('2500');

        // drop into salvage bag
        Orion.DropDraggedItem(GetSalvage());
        Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
        Orion.Wait(long_delay);
    }
}

// ======================================
// GetTailoringResources - placeholder for tailoring logic
// ======================================
function GetTailoringResources(resourceType, count) {

}

// ======================================
// BackstockIngots - moves ingots from salvage bag back to resource container
// ======================================
function BackstockIngots() {
    const salvageBag = GetSalvage();

    while (Orion.FindType(INGOTS_GRAPHIC, any, salvageBag).toString() !== '') {
        Orion.DragItemType(INGOTS_GRAPHIC);
        Orion.DropDraggedItem(config.container.ingots);
        Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
        Orion.Wait(long_delay);
    }
    return;
}

// ======================================
// SalvageItems - smelts forged items into ingots using salvage bag context menu
// ======================================
function SalvageItems() {
    const salvageBag = GetSalvage();

    Orion.RequestContextMenu(salvageBag);
    Orion.WaitContextMenuID(salvageBag, 910);

    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);

    while (Orion.FindType(INGOTS_GRAPHIC, any, 'backpack').toString() !== '') {
        Orion.DragItemType(INGOTS_GRAPHIC);
        Orion.DropDraggedItem(salvageBag);
        Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
        Orion.Wait(long_delay);
    }
    return;
}

// ======================================
// AddItemsToBOD - uses gump to add all items from salvage bag to current BOD
// ======================================
function AddItemsToBOD() {
    const salvageBag = GetSalvage();

    Orion.UseObject('currentBOD');
    Orion.WaitForGump();
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);

    const gump = Orion.GetGump(0);
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);

    // Add all items from container to BOD
    var hook = Orion.CreateGumpHook(11);
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);
    gump.Select(hook);
    Orion.WaitForTarget();
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);
    Orion.TargetObject(GetSalvage());
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);

    // close BOD gump
    gump.Select(Orion.CreateGumpHook(0));
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);
}

// ======================================
// CraftItem - crafts item until BOD is filled, then adds and salvages
// ======================================
function CraftItem(item, count, hook) {
    Orion.Print('Item: ' + item); // Platemail legs
    const itemType = BlackSmithItemMap[item];
    var amountMade = 0;

    Orion.Print('itemType: ' + itemType);
    const PAGE = GetItemClassification(itemType);

    Orion.UseObject(Orion.FindType('0x0FBC', -1, GetSalvage()));
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);
    Orion.WaitForGump();
    Orion.AddDisplayTimer('id', short_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(short_delay);

    var gump = Orion.GetLastGump();
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);

    if (hook === undefined) {
        Orion.Print('PAGE : ' + PAGE);
        var pageHook = Orion.CreateGumpHook(PAGE);
        Orion.AddDisplayTimer('id', 1100, 'UnderChar', 'Circle|Bar');
        Orion.Wait('1100');
        gump.Select(pageHook);
        Orion.AddDisplayTimer('id', 1500, 'UnderChar', 'Circle|Bar');
        Orion.Wait('1500');
    } else {
        Orion.Print('I should already be on the page');
    }

    while (amountMade != count && amountMade <= count) {
        Orion.PrintFast(Player.Serial(), 35, 1, 'Crafting... ' + item + ': ' + amountMade + ' of ' + count);
        UpdateGUIStatus(amountMade + ' of ' + count);
        gump = Orion.GetLastGump();
        Orion.AddDisplayTimer('id', short_delay, 'UnderChar', 'Circle|Bar');
        Orion.Wait(short_delay);

        var itemTypeHook = Orion.CreateGumpHook(itemType);
        Orion.AddDisplayTimer('id', short_delay, 'UnderChar', 'Circle|Bar');
        Orion.Wait(short_delay);
        gump.Select(itemTypeHook);
        Orion.AddDisplayTimer('id', 1500, 'UnderChar', 'Circle|Bar');
        Orion.Wait('1500');

        amountMade = GetBackpackItemCount(item);
        Orion.AddDisplayTimer('id', short_delay, 'UnderChar', 'Circle|Bar');
        Orion.Wait(short_delay);

        if (MessageInJournal('You have worn out your tool!')) {
            SetSmithTool();
            Orion.UseObject('smithTool');
            Orion.WaitForGump();
            ClearJournalMessage('You have worn out your tool!');
        }
    }

    UpdateGUIStatus('Out of crafting loop.');
    gump = Orion.GetLastGump();
    Orion.Wait(short_delay);

    // close the tool gump
    gump.Select(Orion.CreateGumpHook(0));
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);

    AddItemsToBOD();
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);

    SalvageItems();
    Orion.AddDisplayTimer('id', long_delay, 'UnderChar', 'Circle|Bar');
    Orion.Wait(long_delay);

    const remainingCount = GetRemainingCount(item, count);
    if (remainingCount != 0 && remainingCount > 0) {
        CraftItem(item, remainingCount);
        UpdateGUIStatus(remainingCount + ' remaining...');
    }
}

// ======================================
// GetItemClassification - maps item index to smithing page
// ======================================
function GetItemClassification(item) {
    if (item < 20) {
        return BlackSmithClassificationMap.METAL_ARMOR;
    }

    if (item >= 20 && item < 33) {
        return BlackSmithClassificationMap.HELMETS;
    }

    if (item >= 33 && item < 42) {
        return BlackSmithClassificationMap.SHIELDS;
    }

    if (item >= 42 && item < 59) {
        return BlackSmithClassificationMap.BLADED;
    }

    if (item >= 59 && item < 66) {
        return BlackSmithClassificationMap.AXES;
    }

    if (item >= 66 && item < 76) {
        return BlackSmithClassificationMap.POLEARMS;
    }

    if (item >= 76) {
        return BlackSmithClassificationMap.BASHING;
    }
}

// ======================================
// GetRemainingCount - parses BOD for remaining amount and returns how many left
// ======================================
function GetRemainingCount(item, count) {
    const bod = Orion.FindObject('currentBOD');
    const props = bod.Properties();

    const startIndex = props.indexOf(item) + item.length + 1;
    const endIndex = props.length;

    const remainingStr = props.slice(startIndex, endIndex).trim();

    return count - parseInt(remainingStr);
}

// ======================================
// GetBackpackItemCount - counts crafted items in salvage bag that match name
// ======================================
function GetBackpackItemCount(itemName) {
    var salvageBag = GetSalvage();
    var backpackContents = Orion.FindType(any, any, GetSalvage());
    var itemCount = 0;

    for (var i = 0; i < backpackContents.length; i++) {
        var item = Orion.FindObject(backpackContents[i]);

        if (item != null) {
            var itemProperties = item.Properties();

            if (Orion.Contains(itemProperties, itemName)) {
                itemCount++;
            }
        }
    }

    return itemCount;
}

// ======================================
// GetMakeCount - parses BOD properties to get required quantity
// ======================================
function GetMakeCount(props) {
    const makeStr = 'Amount To Make: ';
    const startIndex = props.indexOf(makeStr);
    const endIndex = startIndex + 19;

    const countStr = props.slice(startIndex, endIndex).replace(makeStr, '');
    return parseInt(countStr);
}

// ======================================
// GetItemType - parses BOD properties to get item name
// ======================================
function GetItemType(props) {
    const makeStr = 'Amount To Make: ';
    const startIndex = props.indexOf(makeStr);
    const startChop = startIndex + 19;

    const itemTypeString = props.slice(startChop, props.length);
    const itemType = itemTypeString.slice(0, itemTypeString.indexOf(':'));
    return itemType;
}

// ======================================
// GetMetalType - parses BOD properties for metal type
// ======================================
function GetMetalType(props) {
    const startIndex = props.indexOf('Made With');
    const endIndex = props.indexOf('Ingots');

    if (startIndex == -1) {
        return 'Iron';
    }

    const metalType = props.slice(startIndex + 10, endIndex).trim();

    TextWindow.Print('METAL TYPE: ' + metalType);

    return metalType;

    /// OLD CODE BELOW

    if (props.indexOf('Iron') > 0 && props.indexOf('Shadow') == -1) {
        return 'Iron';
    }

    if (props.indexOf('Dull Copper') > 0) {
        return 'Dull Copper';
    }

    if (props.indexOf('Shadow') > 0) {
        return 'Shadow Iron';
    }

    if (props.indexOf('Copper') > 0) {
        return 'Copper';
    }

    if (props.indexOf('Bronze') > 0) {
        return 'Bronze';
    }

    if (props.indexOf('Gold') > 0) {
        return 'Gold';
    }

    if (props.indexOf('Agapite') > 0) {
        return 'Agapite';
    }

    if (props.indexOf('Verite') > 0) {
        return 'Verite';
    }

    if (props.indexOf('Valorite') > 0) {
        return 'Valorite';
    }

    throw new Error('No Metal Type Found');
}

// ======================================
// MakeTongs - crafts a new smithing tool via tinkering
// ======================================
function MakeTongs() {
    const TONGS = 20;
    const TOOLS_PAGE = 9003;
    const tinkerToolsGraphic = '0x1EB9';
    const salvageBag = GetSalvage();

    GetIngots('Iron', 25);
    Orion.Wait('1000');

    const found = Orion.FindType(tinkerToolsGraphic, any, salvageBag);

    if (found != '') {
        const tinkerTool = Orion.FindObject(found);
        const toolProps = tinkerTool.Properties();

        const usesRemaining = toolProps.slice(toolProps.indexOf('Uses Remaining:') + 16, toolProps.indexOf('Weight'));
        if (parseInt(usesRemaining) != 1) {
            Orion.UseObject(tinkerTool.Serial());
            Orion.WaitForGump(2000);
            Orion.Wait(1000);
            var gump = Orion.GetGump(0);
            Orion.Print(gump);
            var hook = Orion.CreateGumpHook(9003);
            Orion.Wait('1000');
            gump.Select(hook);
            Orion.Wait('1000');
            gump = Orion.GetLastGump();
            hook = Orion.CreateGumpHook(TONGS);
            Orion.Wait('1000');
            gump.Select(hook);
            Orion.Wait('2000');
            gump = Orion.GetLastGump();

            // close the tool gump
            hook = Orion.CreateGumpHook(0);
            gump.Select(hook);
            Orion.Wait('500');
        } else {
            MakeTinkerTool(tinkerTool);
            ClearJournalMessage('You have worn our your tool!');
            MakeTongs();
        }
    }
}

// ======================================
// MakeTinkerTool - creates a new tinker tool using gump
// ======================================
function MakeTinkerTool(tool) {
    const TINKER_TOOL = 11;
    Orion.UseObject(tool.Serial());
    Orion.WaitForGump();

    var gump = Orion.GetGump(0);

    var gumpHook = Orion.CreateGumpHook(TINKER_TOOL);

    Orion.Wait('2000');

    gump.Select(gumpHook);

    Orion.Wait('2000');

    gump = Orion.GetLastGump();
    // close the tool gump
    gumpHook = Orion.CreateGumpHook(0);
    Orion.Wait(short_delay);
    gump.select(gumpHook);
    Orion.Wait(shortest_delay);
}

// ======================================
// SetSmithTool - finds or crafts smithing tongs and stores object
// ======================================
function SetSmithTool() {
    const salvageBag = GetSalvage();
    const smithTools = Orion.FindType('0x0FBC', any, GetSalvage());

    if (smithTools != '') {
        Orion.AddObject('smithTool', smithTools[0]);
        Orion.PrintFast(Player.Serial(), 75, 0, 'Finding Smith Tool');
    } else {
        Orion.PrintFast(Player.Serial(), 25, 0, 'Cannot Find Smith Tool, Making One');
        MakeTongs();
        SetSmithTool();
    }
}

// ======================================
// SetMaterialType - selects the metal type in the smithing gump
// ======================================
function SetMaterialType(type) {
    const metalType = BlackSmithMetalMap[type];
    Orion.UseObject(Orion.FindType('0x0FBC', -1, GetSalvage()));
    Orion.WaitForGump(15000);
    Orion.AddDisplayTimer('id', 3000, 'UnderChar', 'Circle|Bar');
    Orion.Wait('3000');
    const gump = Orion.GetLastGump();
    Orion.AddDisplayTimer('id', 3000, 'UnderChar', 'Circle|Bar');
    Orion.Wait('3000');
    var hook = Orion.CreateGumpHook(metalType);
    Orion.AddDisplayTimer('id', 2000, 'UnderChar', 'Circle|Bar');
    Orion.Wait('2000');
    gump.Select(hook);
    Orion.AddDisplayTimer('id', 2000, 'UnderChar', 'Circle|Bar');
    Orion.Wait('2000');
}

// ======================================
// ClearJournalMessage - clears matching journal lines
// ======================================
function ClearJournalMessage(message) {
    Orion.ClearJournal(message);
}

// ======================================
// MessageInJournal - true if message is present in journal
// ======================================
function MessageInJournal(message) {
    return Orion.InJournal(message) === null ? false : true;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Item Maps
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ======================================
// BlackSmithClassificationMap - pages for smithing menu
// ======================================
const BlackSmithClassificationMap = {
    METAL_ARMOR: 9001,
    HELMETS: 9002,
    SHIELDS: 9003,
    BLADED: 9004,
    AXES: 9005,
    POLEARMS: 9006,
    BASHING: 9007
};

// ======================================
// BlackSmithItemMap - item name to gump index
// ======================================
const BlackSmithItemMap = {
    'Ringmail Gloves': 1,
    'Ringmail Leggings': 2,
    'Ringmail Sleeves': 3,
    'Ringmail Tunic': 4,
    'Chainmail Coif': 5,
    'Chainmail Leggings': 6,
    'Chainmail Tunic': 7,
    'Platemail Arms': 8,
    'Platemail Gloves': 9,
    'Platemail Gorget': 10,
    // 'Platemail Leggings': 11,
    'Platemail Legs': 11,
    'Platemail Tunic': 12,
    'Female Plate': 13,
    'Bascinet': 20,
    'Close Helmet': 21,
    'Helmet': 22,
    'Norse Helm': 23,
    'Plate Helm': 24,
    'Buckler': 33,
    'Bronze Shield': 34,
    'Heater Shield': 35,
    'Metal Shield': 36,
    'Metal Kite Shield': 37,
    'Tear Kite Shield': 38,
    'Chaos Shield': 39,
    'Order Shield': 40,
    'Broadsword': 42,
    'Cutlass': 44,
    'Dagger': 45,
    'Katana': 46,
    'Kryss': 47,
    'Longsword': 48,
    'Scimitar': 49,
    'Viking Sword': 50,
    'Axe': 59,
    'Battle Axe': 60,
    'Double Axe': 61,
    "Executioner's Axe": 62,
    'Large Battle Axe': 63,
    'Two Handed Axe': 64,
    'War Axe': 65,
    'Bardiche': 66,
    'Bladed Staff': 67,
    'Double Bladed Staff': 68,
    'Halberd': 69,
    'Lance': 70,
    'Pike': 71,
    'Short Spear': 72,
    'Scythe': 73,
    'Spear': 74,
    'War Fork': 75,
    'Hammer Pick': 76,
    'Mace': 77,
    'Maul': 78,
    'Scepter': 79,
    'War Mace': 80,
    'War Hammer': 81
};

// ======================================
// BlackSmithMetalMap - metal type to smithing gump button
// ======================================
const BlackSmithMetalMap = {
    'Iron': 5000,
    'Dull Copper': 5001,
    'Shadow Iron': 5002,
    'Copper': 5003,
    'Bronze': 5004,
    'Gold': 5005,
    'Agapite': 5006,
    'Verite': 5007,
    'Valorite': 5008
};

// ======================================
// IngotTypeMap - metal type to ingot color
// ======================================
const IngotTypeMap = {
    'Iron': '0x0000',
    'Dull Copper': '0x0973',
    'Shadow Iron': '0x0966',
    'Copper': '0x096D',
    'Bronze': '0x0972',
    'Gold': '0x08A5',
    'Agapite': '0x0979',
    'Verite': '0x089F',
    'Valorite': '0x08AB'
};

// ======================================
// TinkerCharges - returns remaining uses on tinker tools in salvage bag
// ======================================
function TinkerCharges() {
    var item = Orion.FindTypeEx('0x1EB9', -1, GetSalvage());
    if (item.length != 0) {
        var match = item[0].Properties().match(/Uses Remaining: (\d+)/);
        var usesInt = match ? parseInt(match[1]) : null;
        return usesInt + ' charges.';
    }
    return 0 + ' charges.';
}

// ======================================
// checkUsesRemaining - generic helper for checking any targeted item
// ======================================
function checkUsesRemaining() {
    Orion.WaitForAddObject('usableObject');
    var item = Orion.FindObject('usableObject');

    var match = item.Properties().match(/Uses Remaining: (\d+)/);
    var usesInt = match ? parseInt(match[1]) : null;

    Orion.Print(match ? 'Remaining uses: ' + usesInt : 'Unusable Object');
}

// ======================================
// TongCharges - returns remaining uses on smith tongs in salvage bag
// ======================================
function TongCharges() {
    var item = Orion.FindTypeEx('0x0FBC', -1, GetSalvage());
    if (item.length != 0) {
        var match = item[0].Properties().match(/Uses Remaining: (\d+)/);
        var usesInt = match ? parseInt(match[1]) : null;
        return usesInt + ' charges.';
    }
    return 0 + ' charges.';
}
