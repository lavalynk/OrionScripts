//------------------------------------------------------------------------------------------------------------------------------------------
// Seed Farmer — v1.00
// Author: LavaLynk
// Description: Route-based seed farming with a compact GUI (weapon select + start), target scan/steal/kill loop,
//              and junk-drop/auto-safety helpers. Designed for quick start via Autostart() → GUISeedFarmer().
// Core Vars:  targetGraphics | targetFlags | targetRange | targetNoto
// UI:         GUISeedFarmer() with buttons: [Weapon ID] [Start Farming]
// Key Flows:  StartFarmer() → Scan() → UseStealing() → Kill() → Drop()  (+ itemCheck watchdog)
// Utilities:  SetWep() | GetWep() | UpdateGUIStatus() | GumpAction() | CalculateCenteredX()
// Notes:      Adjust coords[] in StartFarmer() for your route. Ensure Dress/Weapon aliases are set.
// Last Updated: 2025-10-05
//------------------------------------------------------------------------------------------------------------------------------------------

//#include Modules//ItemMover.oajs

var targetGraphics = '0x00A5'
var targetFlags = 'ignoreself|ignorefriends|live|inlos|near';
var targetRange = 10;
var targetNoto = 'gray|criminal|red|enemy|orange';

//------------------------------------------------------------------------------------------------------------------------------------------
// AUTOSTART
//------------------------------------------------------------------------------------------------------------------------------------------
function Autostart(){
	GUISeedFarmer()
}
//------------------------------------------------------------------------------------------------------------------------------------------
// GUI SETUP
//------------------------------------------------------------------------------------------------------------------------------------------
const buttonConfigs = [
    { text: 'Weapon ID: ', id: 2001, varName: 'WeaponID' },
    { text: 'Start Farming ', id: 2002, varName: 'StartFarmer', isCheckbox: true }
];

function GUISeedFarmer() {
    Orion.Wait(100);
    var g = Orion.CreateCustomGump(102099);
    g.Clear();
    g.SetCallback('OnClick');
    var width = 8;
    var cellSize = 35;

    // Calculate height based on the number of buttons
    var height = buttonConfigs.length + 3; // +2 for top and bottom borders

    // Set up the background
    for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            if (y === 0 && x === 0) {
                g.AddGumpPic(x * cellSize, y * cellSize, 0x9C40);
            } else if (x === 0 && y === height - 1) {
                g.AddGumpPic(x * cellSize, y * cellSize, 0x9C46);
            } else if (x === 0 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * cellSize, y * cellSize, 0x9C43);
            } else if (x === width - 1 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * cellSize, y * cellSize, 0x9C45);
            } else if (y === height - 1 && x === width - 1) {
                g.AddGumpPic(x * cellSize, y * cellSize, 0x9C48);
            } else if (y === 0 && x === width - 1) {
                g.AddGumpPic(x * cellSize, y * cellSize, 0x9C42);
            } else if (y === 0 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * cellSize, y * cellSize, 0x9C41);
            } else if (y === height - 1 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * cellSize, y * cellSize, 0x9C47);
            } else {
                g.AddGumpPic(x * cellSize, y * cellSize, 0x9C44);
            }
        }
    }

    g.AddCheckerTrans(0, 0, width * cellSize, height * cellSize);

    var prompt = 40;

    // Function to create a button
function addButton(config) {
    var colorStatus = 1152; // Example color, replace with actual color status if needed
    if (config.isCheckbox) {
        prompt += 15; // Increase prompt for spacing before checkbox
        g.AddLine(53.5, prompt - 8, 233.5, prompt - 8, 'white', 2); // Add white line before checkbox
        g.AddText(60, prompt + 4, colorStatus, config.text);
        var checkboxStatus = Shared.GetVar(config.varName) ? '0x25C9' : '0x25CA'; // Checkbox checked/unchecked graphics
        g.AddButton(config.id, 20, prompt, GetCheckboxStatus(config.varName), GetCheckboxStatus(config.varName), GetCheckboxStatus(config.varName), '');
    } else {
        var statusText;
        switch (config.varName) {
            case 'WeaponID':
                statusText = Shared.GetVar('Wep');
                break;
            default:
                statusText = 'not selected';
        }
        g.AddText(60, prompt, colorStatus, config.text + statusText);
        g.AddButton(config.id, 25, prompt, '0x15A4', '0x15A4', '0x15A4', '');
    }
    prompt += 25;
}

    // Add all buttons based on the configurations
    buttonConfigs.forEach(addButton);

    g.AddText(25, (height * 35) - 35, '72', 'Status: ');
    g.AddText(75, (height * 35) - 35, '55', Orion.GetGlobal('gui_status'));

    var guiWidth = width * cellSize;
    var text = "Seed Farmer v1.0";
    var averageCharWidth = 7; // Adjust this value based on your font and size
    var centeredX = (guiWidth - (text.length * averageCharWidth)) / 2;
    g.AddText(centeredX, 10, 1152, text, 0);

    g.Update();
}

//------------------------------------------------------------------------------------------------------------------------------------------
// CASES
//------------------------------------------------------------------------------------------------------------------------------------------
function OnClick(buttonId) {
	var buttonID = CustomGumpResponse.ReturnCode();

    switch (buttonID) {
        case 2001:
            // Runic Atlas button clicked
            SetWep();
            GUISeedFarmer()
            break;
        case 2002:
            // Start Mining checkbox clicked
            Orion.ToggleScript('StartFarmer')
            GUISeedFarmer()
            break;
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------
// UTILITY FUNCTIONS
//------------------------------------------------------------------------------------------------------------------------------------------
function GUIRefresh(){
	Orion.Wait(2000)
	GUIArrows()
}

function GetColorStatus(scriptName) {
  const scriptRunning = Orion.ScriptRunning(scriptName) > 0;
  return scriptRunning ? 1152 : 33;
}

function CalculateCenteredX(guiWidth, text, averageCharWidth) {
    var textWidth = text.length * averageCharWidth;
    return (guiWidth - textWidth) / 2;
}

function GetCheckboxStatus(scriptName) {
  const scriptRunning = Orion.ScriptRunning(scriptName) > 0;
  if (scriptRunning == true){
	  return 0x2602;
  }
  if (scriptRunning == false){
    return 0x2603;
  }
}

function UpdateGUIStatus(msg) {
  var currentMessage = Orion.GetGlobal('gui_status');
  if (currentMessage == msg) {
    return;
  }
  Orion.SetGlobal('gui_status', msg);
	GUISeedFarmer()
}

function GumpAction(gumpID, hookID, waitTime, closeGump)
{
    if (Orion.WaitForGump(1000))
    {
        var gump = Orion.GetGump('last');
        if ((gump !== null) && (!gump.Replayed()) && (gump.ID() === gumpID))
        {
            gump.Select(Orion.CreateGumpHook(hookID));
            Orion.Wait(waitTime);
            
            if (closeGump)
            {
                gump.Select(Orion.CreateGumpHook(0)); //Close Gump
                Orion.Wait(300);
                Orion.CancelTarget();
            }
        }
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------
// MAIN FUNCTION
//------------------------------------------------------------------------------------------------------------------------------------------

function StartFarmer() {
	Orion.Exec('itemCheck')
    var coords = [
        1641, 1108, 1623, 1108, 1612, 1108, 1597, 1108,
        1597, 1093, 1607, 1083, 1620, 1080, 1629, 1066,
        1642, 1066, 1653, 1074, 1661, 1079, 1651, 1093,
        1664, 1109, 1664, 1124, 1653, 1138, 1663, 1148,
        1691, 1114, 1675, 1114, 1655, 1110, 1643, 1108
    ];

    while (!Player.Dead()) {
        Orion.IgnoreReset(); // new run, new ignore list

        for (var i = 0; i < coords.length; i += 2) {
            Orion.WalkTo(coords[i], coords[i + 1], 0, 3, 255, 1, 2);

            while (Scan(15).length > 0 && !Player.Dead()) {
                var target = Scan(15)[0];
                UseStealing(target); // Attempt to steal from the target first
                Kill(target); // Then proceed to kill the target
                Drop();
                Orion.Wait(10);
            }
        }
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------
// UTILITIES
//------------------------------------------------------------------------------------------------------------------------------------------

function SetWep() {
	UpdateGUIStatus('Select Weapon...')
    Orion.WaitForAddObject('Wep');
    
    var weapon = Orion.FindObject('Wep');
    if (weapon) {
        Shared.AddVar('Wep', weapon.Serial());
        UpdateGUIStatus('Weapon selected and stored...');
    } else {
		UpdateGUIStatus('No weapon selected...')
    }
    
    GUISeedFarmer();
}

function GetWep() {
    var f = Orion.FindObject('Wep');
    if (f) {
        return f.Serial();
    }
    return 0;
}

function UseStealing(e) {
    Shared.AddVar('steal', 0);
    UpdateGUIStatus('Stealing...');
    Orion.Unequip(1);
    Orion.Wait(1250);
    while (e.Exists() && Shared.GetVar('steal') < 5) {  // Check if attempts are less than 5
        Orion.AddHighlightCharacter(e.Serial(), '0x0117', true);
        Orion.CharPrint(e.Serial(), '0x0117', 'TARGET');
        Orion.Attack(e.Serial())
        Orion.WalkTo(e.X(), e.Y());
        Orion.UseSkill('Stealing');
        Orion.WaitForTarget(2500);        
        Orion.TargetObject(e.Serial());
        Orion.Wait(4000);

        if (Orion.InJournal('successfully steal | been stolen | heavy')) {
            UpdateGUIStatus('Stealing - Success!');
            Orion.ClearJournal();
            break;
        }
        if (Orion.InJournal('could not carry | must be standing | must wait | reach into | concentration')) {
            Orion.ClearJournal();
            var stealing = Shared.GetVar('steal');
            stealing++;
            Shared.AddVar('steal', stealing);
            UpdateGUIStatus('Stealing - Failed ' + stealing + ' of 5');
            Orion.Wait(7000);
        }

        if (Shared.GetVar('steal') >= 5) {  // Additional check to break the loop if it reaches 5 attempts
            UpdateGUIStatus('Maximum attempts reached');
            break;
        }
    }
}

function Scan(_range) {
    var f = Orion.FindTypeEx(targetGraphics, -1, ground, 'mobile|ignoreself|inlos|notblockedontile', _range, 'red|criminal|gray');
    return f;
}

function Kill(e) {
    if (!Orion.ObjectExists(e.Serial())) {
		UpdateGUIStatus("Target does not exist.");
        return;
    }

    Orion.AddDisplayTimer('1', 30000, "AboveChar", "Circle|Bar", "Attack", 0, 0, '95', 0xFF, '0xFFFFFF');
    Orion.Wait(1200);

    while (Orion.ObjectExists(e.Serial()) && Orion.DisplayTimerExists('1')) {
        UpdateGUIStatus('Attacking: ' + e.Name());
        var weapon = GetWep();
        if (weapon) {
            Orion.Equip(weapon);
        } else {
            UpdateGUIStatus("No weapon found to equip.");
        }
        
        Orion.WalkTo(e.X(), e.Y(), e.Z());
        Orion.Attack(e.Serial());
        Orion.Wait(1750);

        if (Player.Dead()) {
            Orion.Print("Player is dead. Stopping attack.");
            break;
        }
    }
    Orion.RemoveDisplayTimer('1');
}

function Drop() {
    UpdateGUIStatus('Dropping Junk...');
    var drop_list = [
        0x1C18, 0x0EFD, 0x0EFB, 0x1847, 0x1EB6, 0x1848, 0x0A18, 0x0E21, 0x0F10, 0x0EFC, 0x0F0B,
        0x0F06, 0x0F0D, 0x0F18, 0x0F16, 0x0F15, 0x0F13, 0x0F13, 0x0F26, 0x0F0A, 0x0F11, 0x0F25,
        0x0F0F, 0x0EED, 0x09B9, 0x09F1
    ];

    for (var i in drop_list) {
        var f = Orion.FindType(drop_list[i], -1, backpack);
        if (f.length <= 0) { continue; }
        f.forEach(function(x) {
            var distance = 1;
            var x = Player.X() + (Orion.Random(distance + 1) - distance);
            var y = Player.Y() + (Orion.Random(distance + 1) - distance);
            Orion.Drop(f, 0, x, y, Player.Z());
            Orion.Wait(1500);
        });
    }
}

function itemCheck(){
Orion.Print('Items:' + Orion.Count('any', 'any', 'backpack') )
	while (true){
		if (Orion.Count('any', 'any', 'backpack') == 125){
			UpdateGUIStatus('Full Inventory')
			Orion.WalkTo(1527,1341,0,1,255,1)
			Orion.Wait(1500)
			Orion.CloseUO()
		}
		Orion.Wait(1000)
	}
}