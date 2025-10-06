//*************************************
//Trapped Box Creator
//Created By:  LavaLynk
//Version 1.0
//
//You will want to have GM Carpentry and 
//about 33 tinkering with a tinkering bonus
//talisman.
//*************************************

function Autostart() {
    GUI();
}

function GUI() {
    Orion.Wait(100);
    var g = Orion.CreateCustomGump(101099);
    g.Clear();
    g.SetCallback('OnClick');
    var width = 8;
    var height = 10;
    var tileSize = 35;
    var prompt = 40;
    var arrow = 235;
    var cornerGumps = {
        topLeft: 0x9C40,
        bottomLeft: 0x9C46,
        leftEdge: 0x9C43,
        rightEdge: 0x9C45,
        bottomRight: 0x9C48,
        topRight: 0x9C42,
        topEdge: 0x9C41,
        bottomEdge: 0x9C47,
        center: 0x9C44
    };

    function addGumpPic(g, x, y, gumpId) {
        g.AddGumpPic(x * tileSize, y * tileSize, gumpId);
    }

    for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            if (y === 0 && x === 0) {
                addGumpPic(g, x, y, cornerGumps.topLeft);
            } else if (x === 0 && y === height - 1) {
                addGumpPic(g, x, y, cornerGumps.bottomLeft);
            } else if (x === 0 && y > 0 && y < height - 1) {
                addGumpPic(g, x, y, cornerGumps.leftEdge);
            } else if (x === width - 1 && y > 0 && y < height - 1) {
                addGumpPic(g, x, y, cornerGumps.rightEdge);
            } else if (y === height - 1 && x === width - 1) {
                addGumpPic(g, x, y, cornerGumps.bottomRight);
            } else if (y === 0 && x === width - 1) {
                addGumpPic(g, x, y, cornerGumps.topRight);
            } else if (y === 0 && x > 0 && x < width - 1) {
                addGumpPic(g, x, y, cornerGumps.topEdge);
            } else if (y === height - 1 && x > 0 && x < width - 1) {
                addGumpPic(g, x, y, cornerGumps.bottomEdge);
            } else {
                addGumpPic(g, x, y, cornerGumps.center);
            }
        }
    }
    g.AddCheckerTrans(0, 0, x * 35, y * 35);

    function addTextButton(g, text, buttonId) {
        g.AddText(25, prompt, '60', text);
        g.AddButton(buttonId, arrow, prompt, 0x603, 0x603, 0x604, "");
        prompt += 30;
    }

    addTextButton(g, 'Resource Container: ' + GetResource(), 1001);
    addTextButton(g, 'Finished Container: ' + GetFinished(), 1002);
    addTextButton(g, 'Furniture Dye Tub: ' + GetFurn(), 1003);

    g.AddText(25, prompt, '60', 'Completed        : ' + FinishedCount() + ' / 125');
    prompt += 30;

    g.AddLine(53.5, prompt, 233.5, prompt, 'white', 2);
    prompt += 10;
	arrow = 25
	arrow2 = 55
	
function addToolStatus(g, pic, charges, lowChargeThreshold) {
    g.AddTilePic(arrow, prompt, pic, 0);
    var chargeColor = charges < lowChargeThreshold ? '33' : '60';
    g.AddText(arrow + 30, prompt, chargeColor, ' - ' + charges);
    if (arrow === 25) {
        arrow = 140; // Move to the next column
    } else {
        arrow = 25; // Move back to the first column
        prompt += 30; // Move to the next row after two items
    }
}

addToolStatus(g, 0x1034, SawCharges(), 10);
addToolStatus(g, 0x1EB9, TinkerCharges(), 10);
addToolStatus(g, 0x1BD7, Orion.Count('0x1BD7', -1, backpack), 10);
addToolStatus(g, 0x1BF2, Orion.Count('0x1BF2', -1, backpack), 10);
addToolStatus(g, 0x1BFB, Orion.Count('0x1BFB', -1, backpack), 10);
prompt += 30
    g.AddLine(53.5, prompt, 233.5, prompt, 'white', 2);
    prompt += 10;

    g.AddText(60, prompt + 5, GetColorStatus('CraftTBOX'), "Execute CraftTBOX");
    g.AddButton(1005, 25, prompt, GetCheckboxStatus("CraftTBOX"), GetCheckboxStatus("CraftTBOX"), GetCheckboxStatus("CraftTBOX"), '');
    prompt += 30;

    g.AddText(25, prompt + 10, '72', 'Status: ');
    g.AddText(75, prompt + 10, '55', Orion.GetGlobal('gui_status'));

    g.AddText(25, 10, 89, "Trap Box Crafter", 0);

    g.Update();
}

function OnClick() {
    switch (CustomGumpResponse.ReturnCode()) {
        case 1001:
            SetResource();
            break;
        case 1002:
            SetFinished();
            break;
        case 1003:
            SetFurn();
            break;
        case 1005:
            Orion.ToggleScript('CraftTBOX');
            break;
    }
    GUI();
}

function CloseGump() {
    if (Orion.WaitForGump(3000)) {
        var gump0 = Orion.GetGump('last');
        if (gump0 && !gump0.Replayed() && gump0.ID() === '0x0000029C') {
            gump0.Select(Orion.CreateGumpHook(0));
            Orion.Wait(100);
        }
    }
}

function GetColorStatus(scriptName) {
    var scriptRunning = Orion.ScriptRunning(scriptName) > 0;
    return scriptRunning ? 70 : 33;
}

function UpdateGUIStatus(msg) {
    var currentMessage = Orion.GetGlobal('gui_status');
    if (currentMessage == msg) {
        return;
    }
    Orion.SetGlobal('gui_status', msg);
    GUI();
}

function GetCheckboxStatus(scriptName) {
    var scriptRunning = Orion.ScriptRunning(scriptName) > 0;
    return scriptRunning ? 0x2602 : 0x2603;
}

function SetResource() {
    Orion.Print(55, 'Set Resource Container!');
    Orion.WaitForAddObject('ac_resource', 25000);
}

function SetFinished() {
    Orion.Print(55, 'Set Finished Container!');
    Orion.WaitForAddObject('ac_finished', 25000);
}

function SetFurn() {
    Orion.Print(55, 'Set the Furniture Dye Tub!');
    Orion.WaitForAddObject('ac_furn', 25000);
}

function GetResource() {
    var bb = Orion.FindObject('ac_resource');
    return bb ? bb.Serial() : 'not selected';
}

function GetFurn() {
    var bb = Orion.FindObject('ac_furn');
    return bb ? bb.Serial() : 'not selected';
}

function GetSmallCrate() {
    var bb = Orion.FindObject('smallbox');
    return bb ? bb.Serial() : 'null';
}

function GetFinished() {
    var bbe = Orion.FindObject('ac_finished');
    return bbe ? bbe.Serial() : 'not selected';
}

function FinishedCount() {
    var finished = Orion.FindObject('ac_finished');
    return finished ? parseInt((finished.Properties().match(/Contents:\s(\d*)/i) || [])[1]) || 0 : 0;
}

function CraftSaw() {
    var ingot = Orion.Count('0x1BF2', -1, backpack);
    while (Orion.Count('0x1034', -1, backpack) == 0) {
        UpdateGUIStatus('Crafting Saw...');
        var tinkertools = Orion.FindType('0x1EB9', -1, backpack);
        Orion.UseObject(tinkertools);
        GumpAction('0x000001CC', 9003, 1500, true);
        GumpAction('0x000001CC', 15, 1500, true);
        Orion.Wait(1250);
    }
}

function SawCharges() {
    var saw = Orion.FindTypeEx('0x1034', -1, backpack);
    if (saw.length > 0) {
        var saw1 = saw[0].Properties().split(" ");
        var charges = saw1[2].replace("Weight:", " ");
        Orion.AddObject('sawtools', saw[0].Serial());
        return charges;
    } else {
        return '0 ';
    }
}

function GumpAction(gumpID, hookID, waitTime, closeGump) {
    if (Orion.WaitForGump(1000)) {
        var gump = Orion.GetGump('last');
        if (gump && !gump.Replayed() && gump.ID() === gumpID) {
            gump.Select(Orion.CreateGumpHook(hookID));
            Orion.Wait(waitTime);
            if (closeGump) {
                gump.Select(Orion.CreateGumpHook(0)); // Close Gump
                Orion.Wait(300);
                Orion.CancelTarget();
            }
        }
    }
}

function FindBin() {
    var bin = Orion.FindTypeEx('0x0E77|0x2A9A', -1, ground, 'items', 2);
    if (bin.length > 0) {
        UpdateGUIStatus('Trash Barrel Found!');
        GUI();
        return bin[0].Serial();
    } else {
        UpdateGUIStatus('No Trash Barrel Found!');
        return;
    }
}

function TrashDump() {
    // This function seems to be incomplete. Adding functionality if needed.
}

function GetWood() {
    var resource = GetResource();
    if (Orion.Count('0x1BD7', -1, backpack) < 20) {
        UpdateGUIStatus('Moving boards to backpack...');
        var wood = Orion.FindType('0x1BD7', -1, resource);
        Orion.MoveItem(wood, 80, backpack);
    }
    if (Orion.Count('0x1BD7', -1, resource) < 80) {
        UpdateGUIStatus('Not Enough Wood...');
        Orion.Terminate('CraftTBOX');
        return;
    }
    Orion.Wait(1250);
    GUI();
}

function GetIngots() {
    var resource = GetResource();
    if (Orion.Count('0x1BF2', -1, backpack) < 50) {
        UpdateGUIStatus('Moving ingots to backpack...');
        var ingot = Orion.FindType('0x1BF2', -1, resource);
        Orion.MoveItem(ingot, 20, backpack);
        Orion.Wait(1250);
    }
    if (Orion.Count('0x1BF2', -1, resource) < 50) {
        UpdateGUIStatus('Not Enough Ingots...');
        Orion.Terminate('CraftTBOX');
        return;
    }
    GUI();
}

function GetBolts() {
    var resource = GetResource();
    if (Orion.Count('0x1BFB', -1, backpack) < 20) {
        UpdateGUIStatus('Moving bolts to backpack...');
        var bolts = Orion.FindType('0x1BFB', -1, resource);
        Orion.MoveItem(bolts, 20, backpack);
        Orion.Wait(1250);
    }
    if (Orion.Count('0x1BFB', -1, resource) < 20) {
        UpdateGUIStatus('Not Enough Bolts...');
        Orion.Terminate('CraftTBOX');
        return;
    }
    GUI();
}

function TinkerTools() {
	while (Orion.Count('0x1EB9', -1, backpack) < 2) {
        UpdateGUIStatus("Crafting Tinker's Tools...");
        GetIngots();
        Orion.UseObject(Orion.FindType('0x1EB9', -1, backpack));
        Orion.Wait(1250);
        GumpAction('0x000001CC', 9003, 1500, true);
        GumpAction('0x000001CC', 11, 1500, true);
        TinkerCharges();
        Orion.Wait(1250);
    }
}

function TinkerCharges() {
    var tinker = Orion.FindTypeEx('0x1EB9', -1, backpack);
    if (tinker.length > 0) {
        var tinker1 = tinker[0].Properties().split(" ");
        var charges = tinker1[3].replace("Weight:", " ");
        Orion.AddObject('tinkertools', tinker[0].Serial());
        return charges;
    } else {
        return '0 ';
    }
}

function CraftSmallCrate() {
    while (Orion.Count('0x0E7E', -1, backpack) == 0) {
        UpdateGUIStatus("Crafting Small Crate...");
        var saw = Orion.FindObject('sawtools').Serial();
        Orion.UseObject(saw);
        Orion.Wait(1250);
        Orion.WaitForGump(2000);
        GumpAction('0x000001CC', 9003, 1500, true);
        GumpAction('0x000001CC', 98, 1500, true);
        Orion.Wait(500);
        var box = Orion.FindTypeEx('0x0E7E', -1, backpack);
        if (box.length != 0) {
            Orion.AddObject('smallbox', box[0].Serial());
        }
    }
}

function TrapCrate() {
    var failed = 'xmfhtmlgumpcolor  170 295 350 40 1044043 0 0 32767';
    var success = 'xmfhtmlgumpcolor  170 295 350 40 1005640 0 0 32767';
    var trapped = 'xmfhtmlgumpcolor  170 295 350 40 502945 0 0 32767';

    TinkerTools();
    UpdateGUIStatus("Trapping Small Crate...");
    var tinktool = Orion.FindObject('tinkertools').Serial();
    var smallbox = GetSmallCrate();
    if (smallbox === 'null') {
        smallbox = Orion.FindTypeEx('0x0E7E', -1, backpack)[0].Serial();
    }
    Orion.UseObject(smallbox);
    Orion.Wait(1250);
    while (true) {
        TinkerTools();
        GetBolts();
        GetIngots();
        Orion.UseObject(tinktool);
        Orion.WaitForGump(1250);
        GumpAction('0x000001CC', 9008, 1500, true);
        GumpAction('0x000001CC', 400, 3000, false);
        Orion.WaitForTarget(1000);
        Orion.TargetObject(smallbox);
        Orion.WaitForGump(3000);

        var gump = Orion.GetLastGump();
        var text = gump.CommandList().join();
        Orion.Wait(2000);
        if (Orion.Contains(text, '1005638')) {
            UpdateGUIStatus('Invalid Crate - Garbage.');
            var bin = FindBin();
            Orion.MoveItem(smallbox, 0, bin);
            break;
        }
        if (Orion.Contains(text, failed)) {
            UpdateGUIStatus("Failed to Trap...");
        }
        if (Orion.Contains(text, success)) {
            handleSuccessfulTrap(smallbox);
            break;
        }
        if (Orion.Contains(text, trapped)) {
            handleAlreadyTrapped(smallbox);
            break;
        }
    }
}

function handleSuccessfulTrap(smallbox) {
    UpdateGUIStatus("Successfully Trapped...");
    var key = Orion.FindTypeEx('0x100E', -1, smallbox)[0].Serial();
    var bin = FindBin();
    Orion.UseObject(key);
    Orion.WaitForTarget(1000);
    Orion.TargetObject(smallbox);
    Orion.Wait(1250);
    Orion.Cast('Unlock');
    Orion.Wait(1500);
    Orion.TargetObject(smallbox);
    Orion.Wait(1250);

    moveKeysToBin(key, smallbox, bin);

    Orion.UseObject(GetFurn());
    Orion.WaitForTarget(1500);
    Orion.TargetObject(smallbox);
    Orion.Wait(1250);
    Orion.MoveItem(smallbox, 0, GetFinished());
    UpdateGUIStatus("Successful Trap Box!");
    Orion.Wait(1250);
}

function handleAlreadyTrapped(smallbox) {
    UpdateGUIStatus("Already Trapped...");
    var key = Orion.FindTypeEx('0x100E', -1, smallbox)[0].Serial();
    var bin = FindBin();
    Orion.UseObject(key);
    Orion.WaitForTarget(1000);
    Orion.TargetObject(smallbox);
    Orion.Wait(1250);
    Orion.Cast('Unlock');
    Orion.Wait(1500);
    Orion.TargetObject(smallbox);
    Orion.Wait(1250);

    moveKeysToBin(key, smallbox, bin);

    Orion.UseObject(GetFurn());
    Orion.WaitForTarget(3000);
    Orion.TargetObject(smallbox);
    Orion.Wait(1250);
    Orion.MoveItem(smallbox, 0, GetFinished());
    UpdateGUIStatus("Successful Trap Box!");
    Orion.Wait(1250);
}

function moveKeysToBin(key, smallbox, bin) {
    while (Orion.Count('0x100E', -1, smallbox) !== 0) {
        Orion.MoveItem(key, 0, bin);
        UpdateGUIStatus("Moving Key To Bin...");
        if (Orion.Count('0x100E', -1, smallbox) !== 0) {
            UpdateGUIStatus("Failed to Unlock...");
            Orion.Cast('Unlock');
            Orion.Wait(1500);
            Orion.TargetObject(smallbox);
            Orion.ClearJournal();
            Orion.Wait(1500);
            Orion.CancelTarget();
        }
        Orion.Wait(1500);
    }
}

function CraftTBOX() {
    var delay = 1250;
    Orion.UseObject(GetResource());
    Orion.Wait(delay);
    while (FinishedCount() !== 125) {
        GetWood();
        GetIngots();
        GetBolts();
        TinkerTools();
        CraftSaw();
        CraftSmallCrate();
        TrapCrate();
        Orion.Wait(delay);
    }
    Clear();
    UpdateGUIStatus("Script Completed!");
    GUI();
}

function Clear() {
    var resource = GetResource();
    moveAllToResource('0x1BD7', resource);
    moveAllToResource('0x1BFB', resource);
    moveAllToResource('0x1BF2', resource);
}

function moveAllToResource(itemType, resource) {
    var items = Orion.FindType(itemType, -1, backpack);
    while (items.length !== 0) {
        Orion.MoveItem(items[0], 0, resource);
        Orion.Wait(1250);
        items = Orion.FindType(itemType, -1, backpack);
    }
}
