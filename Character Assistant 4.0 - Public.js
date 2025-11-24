//--------------------------------------------------------------
// CHARACTER ASSISTANT
// Advanced Combat and Utility Automation Suite
// Created By: LavaLynk
// Version 4.02 – Shared Toggle Edition
//--------------------------------------------------------------

// This script provides a complete automation system for combat, healing,
// targeting, buffs, defensive abilities, bard actions, pet commands, 
// looting, consumables, movement helpers, and GUI controls.
//
// Every feature is controlled through Shared Variables using 0 (off) and 1 (on).
// Each automation function checks its Shared Variable on every cycle and stops
// immediately when switched off. This avoids stuck loops and improves performance.
//
// The system includes:
//   • Main Character Assistant GUI (Sampire, Thrower, Misc).
//   • Optional compact status-bar GUI.
//   • Full combat support (Sampire AI, Thrower range logic, GoToAndAttackTarget).
//   • Auto buffs (Consecrate, Enemy of One, Vampire Form, Wraith Form).
//   • Defensive ability automation (Counter Attack, Confidence, Evade).
//   • Auto bandage healing with weighted target selection.
//   • Bard automation (Peace, Provo, Disco, Masteries).
//   • Pet combat support (All Kill, follow logic).
//   • Potion automation (Heal, Cure, Strength, Dexterity, Apple, Mana Draught).
//   • Auto mount, corpse looting, death watching, form cleanup.
//   • Party creation / disbanding.
//   • Target scrolling and enemy highlighting.
//   • Inventory and container helpers.
//   • Shared variable reset function (runs during Autostart).
//
// Designed for modularity, stability, and fast toggle control.



//--------------------------------------------------------------
// INCLUDES
//--------------------------------------------------------------
//#include OA/Modules/Durability.oajs

//--------------------------------------------------------------
// GLOBAL CONFIG
//--------------------------------------------------------------

var color = 1900;                    // main frame hue
var HUE_FRAME = 1900;

var HUE_STATUS_LABEL = 902;          // dark gray Status:
var HUE_STATUS_TEXT  = 945;          // lighter gray Status text
var HUE_LABEL_OFF    = 902;          // darker gray when off
var HUE_LABEL_ON     = 945;          // lighter gray when on

var mountID = '0x2D9C|0x20F6';
var seedhits = 40;

var summonedNames = [
    "nature's fury",
    "energy vortex",
    "blade spirit",
    "revenant",
    "skeletal mage",
    "bone mage",
    "lich lord"
];

var targetGraphics = '!0x0136|!0x00A4|!0x033D|!0x023E|!0x02B4|!0x002F';
var targetFlags    = 'ignoreself|ignorefriends|live|inlos|near';
var targetRange    = 10;
var targetNoto     = 'gray|criminal|red|enemy|orange';

var playerGraphics = '0x0190|0x0191|0x0192|0x0193|0x00B7|0x00BA|0x025D|0x025E|0x025F|0x0260|0x029A|0x029B|0x02B6|0x02B7|0x03DB|0x03DF|0x03E2|0x02EB|0x02EC|0x02ED|0x02C1|0x011D';

var RUNIC_ATLAS_GRAPHIC = '0x9C16';
var RUNEBOOK_GRAPHIC    = '0x22C5';

var fontCode = 1;

//--------------------------------------------------------------
// SHARED TOGGLE UTILITIES
//--------------------------------------------------------------

// #flag: Helper to check if a Shared toggle is on (1)
function isToggleOn(key) {
    var v = Shared.GetVar(key);
    if (typeof v === 'undefined' || v === null) return true;
    return v == 1 || v == '1';
}

// #flag: Helper to set a Shared toggle to 0 or 1
function setToggle(key, on) {
    Shared.AddVar(key, on ? 1 : 0);
}

// #flag: Helper to flip a Shared toggle between 0 and 1 and return new state
function toggleToggle(key) {
    var nowOn = !isToggleOn(key);
    setToggle(key, nowOn);
    return nowOn;
}

// #flag: Central helper to toggle a looping script using Shared 0/1 and Orion.ToggleScript
function ToggleScriptShared(scriptName, toggleName) {
    if (!toggleName) toggleName = scriptName;

    var nowOn = toggleToggle(toggleName);

    if (nowOn) {
        if (!Orion.ScriptRunning(scriptName)) {
            Orion.ToggleScript(scriptName);
        }
    } else {
        if (Orion.ScriptRunning(scriptName)) {
            Orion.Terminate(scriptName);
        }
    }
}

// #flag: Helper to force a script OFF and clear its Shared toggle
function TurnOffScript(scriptName, toggleName) {
    if (!toggleName) toggleName = scriptName;
    setToggle(toggleName, 0);
    if (Orion.ScriptRunning(scriptName)) {
        Orion.Terminate(scriptName);
    }
}

// #flag: Clear all Shared variables used by Character Assistant and reset GUI state
function ClearCharacterAssistantShared() {
    var bitToggles = [
        'AutoConWeap',
        'AutoAttack',
        'AutoEoO',
        'AutoVamp',
        'AutoWraith',
        'AutoPrimary',
        'AutoSecondary',
        'AutoMomentumStrike',
        'AutoLightningStrike',
        'AutoCounterAttack',
        'HidePlayers',
        'auto_CrossHealBandage',
        'FollowMaster',
        'AutoSampire',
        'autoConfidence',
        'autoEvade',
        'deathCheck'
    ];

    for (var i = 0; i < bitToggles.length; i++) {
        setToggle(bitToggles[i], 0);
    }

    Shared.AddVar('selector', 0);
    Shared.AddVar('autoWalk', 'False');
    Shared.AddVar('useLootCorpses', 'False');
    Shared.AddVar('useMoveToCorpses', 'False');
    Shared.AddVar('masterSerial', '');
    Shared.AddVar('gui_status', '');
    Shared.AddVar('bardSkill', '');

    Orion.SetGlobal('gui_status', '');

    if (Orion.ScriptRunning('deathCheck')) {
        Orion.Terminate('deathCheck');
    }

    Orion.Print(1152, "[Character Assistant] Shared variables cleared");
}

//--------------------------------------------------------------
// AUTOSTART
//--------------------------------------------------------------

// #flag: Entry point to boot the GUI, clear shared, and start core scripts
function Autostart() {
    ClearCharacterAssistantShared();
    Orion.Wait(100);

    GUISelector();

    if (!Orion.ScriptRunning('checkDurability')) {
        Orion.ToggleScript('checkDurability');
    }
    if (!Orion.ScriptRunning('deathCheck')) {
        setToggle('deathCheck', 1);
        Orion.ToggleScript('deathCheck');
    }

    Shared.AddVar('selector', 0);
    Shared.AddVar('autoWalk', 'False');

    if (!Orion.ScriptRunning('InsureDrops')) {
        Orion.ToggleScript('InsureDrops');
    }

    Orion.Wait(1250);
    Orion.UseObject(backpack);
    Orion.Wait(1250);
}

//--------------------------------------------------------------
// GUI BUILDER HELPERS
//--------------------------------------------------------------

// #flag: Compute centered X for a title string
function CalculateCenteredX(guiWidth, text, averageCharWidth) {
    var textWidth = text.length * averageCharWidth;
    var centeredX = (guiWidth - textWidth) / 2;
    if (centeredX < 0) centeredX = 0;
    return centeredX;
}

// #flag: Return hue for label text based on toggle name
function GetColorStatus(toggleName) {
    return isToggleOn(toggleName) ? HUE_LABEL_ON : HUE_LABEL_OFF;
}

// #flag: Return checkbox gump id based on toggle name
function GetCheckboxStatus(toggleName) {
    if (isToggleOn(toggleName)) {
        return 0x2602; // checked
    }
    return 0x2603;     // unchecked
}

// #flag: Get race tile id for status tile in Misc menu
function GetRace() {
    var race = Player.Race();
    if (race == 1 || race == 2) {
        return 0x9F1F;
    } else if (race == 3) {
        return 0x9F21;
    }
    return 0;
}

// #flag: Get X coordinate for race tile so it looks centered
function GetRaceX() {
    var race = Player.Race();
    if (race == 1 || race == 2) {
        return 185;
    } else if (race == 3) {
        return 165;
    }
    return 0;
}

//--------------------------------------------------------------
// GUI CORE - SELECTOR
//--------------------------------------------------------------

// #flag: Main collapsed Character Assistant selector menu (3 buttons + status)
function GUISelector() {
    Orion.Wait(100);

    var g = Orion.CreateCustomGump(101099);
    g.Clear();
    g.SetCallback('OnClick');

    const width = 8;
    const height = 4;
    const cellSize = 35;
    const totalWidth = width * cellSize;
    const buttonWidth = 60;

    for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            if (y == 0 && x == 0) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF5, HUE_FRAME);
            } else if (x == 0 && y == height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFB, HUE_FRAME);
            } else if (x == 0 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF8, HUE_FRAME);
            } else if (x == width - 1 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFA, HUE_FRAME);
            } else if (y == height - 1 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFD, HUE_FRAME);
            } else if (y == 0 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF7, HUE_FRAME);
            } else if (y == 0 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF6, HUE_FRAME);
            } else if (y == height - 1 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFC, HUE_FRAME);
            } else {
                g.AddGumpPic(x * 35, y * 35, 0x9BF9, HUE_FRAME);
            }
        }
    }

    // Left: Sampire
    g.AddButton(1015, 25, 45, '0x15AB', '0x15AB', '0x15AB', '');
    g.AddTooltip('Sampire Menu');

    // Center: Thrower / Archer
    g.AddButton(1016, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15D5', '0x15D5', '0x15D5', '');
    g.AddTooltip('Thrower / Archer Menu');

    // Right: Misc
    g.AddButton(1018, totalWidth - buttonWidth - 25, 45, '0x15CD', '0x15CD', '0x15CD', '');
    g.AddTooltip('Miscellaneous Menu');

    var guiWidth = width * cellSize;
    var text = "Character Assistant";
    var centeredX = CalculateCenteredX(guiWidth, text, 6);
    g.AddButton(300001, centeredX + 40, 9, 0x637, 0x637, 0x637, "1900");    
    g.AddTooltip("Minimize");    
    g.AddButton(300000, centeredX - 50, 9, 0x637, 0x637, 0x637, "1900");
    g.AddTooltip("Minimize");     
    g.AddText(centeredX, 10, 1152, text, 0);    

    g.AddText(25, 110, HUE_STATUS_LABEL, 'Status: ');
    g.AddText(75, 110, HUE_STATUS_TEXT, Orion.GetGlobal('gui_status'));

    // Event / Bot menus
    g.AddButton(868687, 45, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.AddButton(868686, 225, 14, '0x2716', '0x2716', '0x2716', '1900');

    g.Update();
}

//--------------------------------------------------------------
// GUI - COMPACT BAR
//--------------------------------------------------------------

// #flag: Compact version of the GUI (title + status only)
function GUICompact() {
    Orion.Wait(100);
    Shared.AddVar('selector', 4);
    var g = Orion.CreateCustomGump(101099);
    g.Clear();
    g.SetCallback('OnClick');

    const width = 8;
    const height = 2;
    const cellSize = 35;
    const guiWidth = width * cellSize;

    for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            if (y == 0 && x == 0) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF5, HUE_FRAME);
            } else if (x == 0 && y == height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFB, HUE_FRAME);
            } else if (x == 0 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF8, HUE_FRAME);
            } else if (x == width - 1 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFA, HUE_FRAME);
            } else if (y == height - 1 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFD, HUE_FRAME);
            } else if (y == 0 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF7, HUE_FRAME);
            } else if (y == 0 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF6, HUE_FRAME);
            } else if (y == height - 1 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFC, HUE_FRAME);
            } else {
                g.AddGumpPic(x * 35, y * 35, 0x9BF9, HUE_FRAME);
            }
        }
    }

    var text = "Character Assistant";
    var centeredX = CalculateCenteredX(guiWidth, text, 6);
   
    g.AddButton(300001, centeredX + 40, 9, 0x637, 0x637, 0x637, "1900");    
    g.AddTooltip("Minimize");    
    g.AddButton(300000, centeredX - 50, 9, 0x637, 0x637, 0x637, "1900");
    g.AddTooltip("Minimize");     
    g.AddText(centeredX, 10, 1152, text, 0);    

    g.AddText(25, 40, HUE_STATUS_LABEL, 'Status: ');
    g.AddText(75, 40, HUE_STATUS_TEXT, Orion.GetGlobal('gui_status'));
    
    g.AddButton(868687, 45, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.AddButton(868686, 225, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.Update();
}

//--------------------------------------------------------------
// GUI - SAMPIRE
//--------------------------------------------------------------

// #flag: Sampire specific GUI with auto attacks and buffs
function GUISampire() {
    Shared.AddVar('selector', 2);
    Orion.Wait(100);

    var g = Orion.CreateCustomGump(101099);
    g.Clear();
    g.SetCallback('OnClick');

    const width = 8;
    const height = 12;
    const cellSize = 35;
    const totalWidth = width * cellSize;
    const buttonWidth = 60;

    for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            if (y == 0 && x == 0) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF5, HUE_FRAME);
            } else if (x == 0 && y == height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFB, HUE_FRAME);
            } else if (x == 0 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF8, HUE_FRAME);
            } else if (x == width - 1 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFA, HUE_FRAME);
            } else if (y == height - 1 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFD, HUE_FRAME);
            } else if (y == 0 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF7, HUE_FRAME);
            } else if (y == 0 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF6, HUE_FRAME);
            } else if (y == height - 1 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFC, HUE_FRAME);
            } else {
                g.AddGumpPic(x * 35, y * 35, 0x9BF9, HUE_FRAME);
            }
        }
    }

    g.AddButton(1017, 25, 45, '0x15AC', '0x15AC', '0x15AC', '1900');
    g.AddTooltip('Collapse Menu');

    g.AddButton(1016, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15D5', '0x15D5', '0x15D5', '');
    g.AddTooltip('Thrower / Archer Menu');

    g.AddButton(1018, totalWidth - buttonWidth - 25, 45, '0x15CD', '0x15CD', '0x15CD', '');
    g.AddTooltip('Miscellaneous Menu');

    var prompt = 120;
    g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2);
    prompt += 10;

    g.AddText(60, prompt + 5, GetColorStatus('AutoConWeap'), 'Consecrate Weapon');
    g.AddButton(1001, 25, prompt, GetCheckboxStatus("AutoConWeap"), GetCheckboxStatus("AutoConWeap"), GetCheckboxStatus("AutoConWeap"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoEoO'), 'Enemy of One');
    g.AddButton(1003, 25, prompt, GetCheckboxStatus("AutoEoO"), GetCheckboxStatus("AutoEoO"), GetCheckboxStatus("AutoEoO"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoVamp'), 'Vampiric Embrace');
    g.AddButton(1004, 25, prompt, GetCheckboxStatus("AutoVamp"), GetCheckboxStatus("AutoVamp"), GetCheckboxStatus("AutoVamp"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoPrimary'), 'Auto Primary Attack');
    g.AddButton(1010, 25, prompt, GetCheckboxStatus("AutoPrimary"), GetCheckboxStatus("AutoPrimary"), GetCheckboxStatus("AutoPrimary"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoSecondary'), 'Auto Secondary Attack');
    g.AddButton(1014, 25, prompt, GetCheckboxStatus("AutoSecondary"), GetCheckboxStatus("AutoSecondary"), GetCheckboxStatus("AutoSecondary"), '');
    prompt += 30;

    g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2);
    prompt += 10;

    g.AddText(60, prompt + 5, GetColorStatus('AutoSampire'), 'Auto Attack');
    g.AddButton(1099, 25, prompt, GetCheckboxStatus("AutoSampire"), GetCheckboxStatus("AutoSampire"), GetCheckboxStatus("AutoSampire"), '');

    var useLootCorpses = Shared.GetVar('useLootCorpses');
    if (useLootCorpses == 'True') {
        g.AddText(190, prompt + 5, HUE_LABEL_ON, "Auto Loot");
        g.AddButton(4999, 155, prompt, '0x2602', '0x2602', '0x2602', '');
    } else {
        g.AddText(190, prompt + 5, HUE_LABEL_OFF, "Auto Loot");
        g.AddButton(4999, 155, prompt, '0x2603', '0x2603', '0x2603', '');
    }
    prompt += 40;

    g.AddText(25, (height - 1) * 35, HUE_STATUS_LABEL, 'Status: ');
    g.AddText(75, (height - 1) * 35, HUE_STATUS_TEXT, Orion.GetGlobal('gui_status'));

    var guiWidth = width * cellSize;
    var text = "Character Assistant";
    var centeredX = CalculateCenteredX(guiWidth, text, 6);
    g.AddButton(300001, centeredX + 40, 9, 0x637, 0x637, 0x637, "1900");    
    g.AddTooltip("Minimize");    
    g.AddButton(300000, centeredX - 50, 9, 0x637, 0x637, 0x637, "1900");
    g.AddTooltip("Minimize");     
    g.AddButton(300001, centeredX + 40, 9, 0x637, 0x637, 0x637, "1900");    
    g.AddTooltip("Minimize");    
    g.AddButton(300000, centeredX - 50, 9, 0x637, 0x637, 0x637, "1900");
    g.AddTooltip("Minimize");     
    g.AddText(centeredX, 10, 1152, text, 0);      

    g.AddButton(868687, 45, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.AddButton(868686, 225, 14, '0x2716', '0x2716', '0x2716', '1900');

    g.Update();
}

//--------------------------------------------------------------
// GUI - THROWER
//--------------------------------------------------------------

// #flag: Thrower / Archer specific GUI with chivalry and auto attack
function GUIThrower() {
    Shared.AddVar('selector', 1);
    Orion.Wait(100);

    var g = Orion.CreateCustomGump(101099);
    g.Clear();
    g.SetCallback('OnClick');

    const width = 8;
    const height = 12;
    const cellSize = 35;
    const totalWidth = width * cellSize;
    const buttonWidth = 60;

    for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            if (y == 0 && x == 0) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF5, HUE_FRAME);
            } else if (x == 0 && y == height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFB, HUE_FRAME);
            } else if (x == 0 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF8, HUE_FRAME);
            } else if (x == width - 1 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFA, HUE_FRAME);
            } else if (y == height - 1 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFD, HUE_FRAME);
            } else if (y == 0 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF7, HUE_FRAME);
            } else if (y == 0 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF6, HUE_FRAME);
            } else if (y == height - 1 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFC, HUE_FRAME);
            } else {
                g.AddGumpPic(x * 35, y * 35, 0x9BF9, HUE_FRAME);
            }
        }
    }

    g.AddButton(1015, 25, 45, '0x15AB', '0x15AB', '0x15AB', '');
    g.AddTooltip('Sampire Menu');

    g.AddButton(1017, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15D6', '0x15D6', '0x15D6', '1900');
    g.AddTooltip('Collapse Menu');

    g.AddButton(1018, totalWidth - buttonWidth - 25, 45, '0x15CD', '0x15CD', '0x15CD', '');
    g.AddTooltip('Miscellaneous Menu');

    var prompt = 120;
    g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2);
    prompt += 10;

    g.AddText(60, prompt + 5, GetColorStatus('AutoConWeap'), 'Consecrate Weapon');
    g.AddButton(1001, 25, prompt, GetCheckboxStatus("AutoConWeap"), GetCheckboxStatus("AutoConWeap"), GetCheckboxStatus("AutoConWeap"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoEoO'), 'Enemy of One');
    g.AddButton(1003, 25, prompt, GetCheckboxStatus("AutoEoO"), GetCheckboxStatus("AutoEoO"), GetCheckboxStatus("AutoEoO"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoVamp'), 'Vampiric Embrace');
    g.AddButton(1004, 25, prompt, GetCheckboxStatus("AutoVamp"), GetCheckboxStatus("AutoVamp"), GetCheckboxStatus("AutoVamp"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoWraith'), 'Wraith Form');
    g.AddButton(1005, 25, prompt, GetCheckboxStatus("AutoWraith"), GetCheckboxStatus("AutoWraith"), GetCheckboxStatus("AutoWraith"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoPrimary'), 'Auto Primary Attack');
    g.AddButton(1010, 25, prompt, GetCheckboxStatus("AutoPrimary"), GetCheckboxStatus("AutoPrimary"), GetCheckboxStatus("AutoPrimary"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoSecondary'), 'Auto Secondary Attack');
    g.AddButton(1014, 25, prompt, GetCheckboxStatus("AutoSecondary"), GetCheckboxStatus("AutoSecondary"), GetCheckboxStatus("AutoSecondary"), '');
    prompt += 30;

    g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2);
    prompt += 10;

    g.AddText(60, prompt + 5, GetColorStatus('AutoAttack'), 'Auto Attack');
    g.AddButton(1002, 25, prompt, GetCheckboxStatus("AutoAttack"), GetCheckboxStatus("AutoAttack"), GetCheckboxStatus("AutoAttack"), '');

    var useLootCorpses = Shared.GetVar('useLootCorpses');
    if (useLootCorpses == 'True') {
        g.AddText(190, prompt + 5, HUE_LABEL_ON, "Auto Loot");
        g.AddButton(4999, 155, prompt, '0x2602', '0x2602', '0x2602', '');
    } else {
        g.AddText(190, prompt + 5, HUE_LABEL_OFF, "Auto Loot");
        g.AddButton(4999, 155, prompt, '0x2603', '0x2603', '0x2603', '');
    }
    prompt += 30;

    var autoWalk = Shared.GetVar('autoWalk');
    if (autoWalk == 'True') {
        g.AddText(190, prompt + 5, HUE_LABEL_ON, "AutoWalk");
        g.AddButton(5000, 155, prompt, '0x2602', '0x2602', '0x2602', '');
    } else {
        g.AddText(190, prompt + 5, HUE_LABEL_OFF, "AutoWalk");
        g.AddButton(5000, 155, prompt, '0x2603', '0x2603', '0x2603', '');
    }

    g.AddText(25, (height - 1) * 35, HUE_STATUS_LABEL, 'Status: ');
    g.AddText(75, (height - 1) * 35, HUE_STATUS_TEXT, Orion.GetGlobal('gui_status'));

    var guiWidth = width * cellSize;
    var text = "Character Assistant";
    var centeredX = CalculateCenteredX(guiWidth, text, 6);
    g.AddButton(300001, centeredX + 40, 9, 0x637, 0x637, 0x637, "1900");    
    g.AddTooltip("Minimize");    
    g.AddButton(300000, centeredX - 50, 9, 0x637, 0x637, 0x637, "1900");
    g.AddTooltip("Minimize");     
    g.AddText(centeredX, 10, 1152, text, 0);        

    g.AddButton(868687, 45, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.AddButton(868686, 225, 14, '0x2716', '0x2716', '0x2716', '1900');

    g.Update();
}

//--------------------------------------------------------------
// GUI - MISC
//--------------------------------------------------------------

// #flag: Miscellaneous combat and utility toggles
function GUIMisc() {
    Shared.AddVar('selector', 3);
    Orion.Wait(100);

    var g = Orion.CreateCustomGump(101099);
    g.Clear();
    g.SetCallback('OnClick');

    const width = 8;
    const height = 12;
    const cellSize = 35;
    const totalWidth = width * cellSize;
    const buttonWidth = 60;

    for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            if (y == 0 && x == 0) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF5, HUE_FRAME);
            } else if (x == 0 && y == height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFB, HUE_FRAME);
            } else if (x == 0 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF8, HUE_FRAME);
            } else if (x == width - 1 && y > 0 && y < height - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFA, HUE_FRAME);
            } else if (y == height - 1 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFD, HUE_FRAME);
            } else if (y == 0 && x == width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF7, HUE_FRAME);
            } else if (y == 0 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BF6, HUE_FRAME);
            } else if (y == height - 1 && x > 0 && x < width - 1) {
                g.AddGumpPic(x * 35, y * 35, 0x9BFC, HUE_FRAME);
            } else {
                g.AddGumpPic(x * 35, y * 35, 0x9BF9, HUE_FRAME);
            }
        }
    }

    g.AddButton(1015, 25, 45, '0x15AB', '0x15AB', '0x15AB', '');
    g.AddTooltip('Sampire Menu');

    g.AddButton(1016, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15D5', '0x15D5', '0x15D5', '');
    g.AddTooltip('Thrower / Archer Menu');

    g.AddButton(1017, totalWidth - buttonWidth - 25, 45, '0x15CE', '0x15CE', '0x15CE', '1900');
    g.AddTooltip('Collapse Menu');

    var prompt = 120;
    g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2);
    prompt += 10;

    g.AddText(60, prompt + 5, GetColorStatus('AutoMomentumStrike'), 'Momentum Strike');
    g.AddButton(1006, 25, prompt, GetCheckboxStatus("AutoMomentumStrike"), GetCheckboxStatus("AutoMomentumStrike"), GetCheckboxStatus("AutoMomentumStrike"), '');
    g.AddButton(2000, 170, prompt + 10, '0x8B0', '0x8B0', '0x8B0', '1900');
    g.AddTooltip("Party");
    g.AddText(195, prompt + 6, 1900, "Party");
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoLightningStrike'), 'Lightning Strike');
    g.AddButton(1007, 25, prompt, GetCheckboxStatus("AutoLightningStrike"), GetCheckboxStatus("AutoLightningStrike"), GetCheckboxStatus("AutoLightningStrike"), '');
    g.AddButton(2001, 170, prompt + 10, '0x8B0', '0x8B0', '0x8B0', '1900');
    g.AddTooltip("Disband");
    g.AddText(195, prompt + 6, 1900, "Disband");
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('AutoCounterAttack'), 'Counter Attack');
    g.AddButton(1008, 25, prompt, GetCheckboxStatus("AutoCounterAttack"), GetCheckboxStatus("AutoCounterAttack"), GetCheckboxStatus("AutoCounterAttack"), '');
    g.AddButton(2002, 170, prompt + 10, '0x8B0', '0x8B0', '0x8B0', '1900');
    g.AddTooltip("Repair");
    g.AddText(195, prompt + 6, 1900, "Repair");
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('autoConfidence'), 'Confidence');
    g.AddButton(1020, 25, prompt, GetCheckboxStatus("autoConfidence"), GetCheckboxStatus("autoConfidence"), GetCheckboxStatus("autoConfidence"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('autoEvade'), 'Evade');
    g.AddButton(1021, 25, prompt, GetCheckboxStatus("autoEvade"), GetCheckboxStatus("autoEvade"), GetCheckboxStatus("autoEvade"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('HidePlayers'), 'Hide Players');
    g.AddButton(1009, 25, prompt, GetCheckboxStatus("HidePlayers"), GetCheckboxStatus("HidePlayers"), GetCheckboxStatus("HidePlayers"), '');
    prompt += 30;

    g.AddText(60, prompt + 5, GetColorStatus('auto_CrossHealBandage'), 'Bandage Heals');
    g.AddButton(1011, 25, prompt, GetCheckboxStatus("auto_CrossHealBandage"), GetCheckboxStatus("auto_CrossHealBandage"), GetCheckboxStatus("auto_CrossHealBandage"), '');
    prompt += 30;

    g.AddButton(1013, 10, prompt + 9, '0x2716', '0x2716', '0x2716', '1900');
    g.AddTooltip('Reset Follower');

    g.AddText(60, prompt + 5, GetColorStatus('FollowMaster'), 'Following: ' + GetMasterName());
    g.AddButton(1012, 25, prompt, GetCheckboxStatus("FollowMaster"), GetCheckboxStatus("FollowMaster"), GetCheckboxStatus("FollowMaster"), '');
    prompt += 30;

    g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2);
    prompt += 10;

    g.AddText(25, (height - 1) * 35, HUE_STATUS_LABEL, 'Status: ');
    g.AddText(75, (height - 1) * 35, HUE_STATUS_TEXT, Orion.GetGlobal('gui_status'));

    var guiWidth = width * cellSize;
    var text = "Character Assistant";
    var centeredX = CalculateCenteredX(guiWidth, text, 6);
    g.AddButton(300001, centeredX + 40, 9, 0x637, 0x637, 0x637, "1900");    
    g.AddTooltip("Minimize");    
    g.AddButton(300000, centeredX - 50, 9, 0x637, 0x637, 0x637, "1900");
    g.AddTooltip("Minimize");     
    g.AddText(centeredX, 10, 1152, text, 0);    

    g.AddTilePic(GetRaceX(), 230, GetRace(), "0x0000", 5002, '1900');
    g.AddTooltip("Collect your corpses");

    g.AddButton(868687, 45, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.AddButton(868686, 225, 14, '0x2716', '0x2716', '0x2716', '1900');


    g.Update();
}

//--------------------------------------------------------------
// GUI CONTROL AND STATUS
//--------------------------------------------------------------

// #flag: Choose which GUI to show based on selector Shared var
function GUI() {
    var selector = Shared.GetVar('selector');
    if (selector == 0) {
        GUISelector();
    } else if (selector == 1) {
        GUIThrower();
    } else if (selector == 2) {
        GUISampire();
    } else if (selector == 3) {
        GUIMisc();
    } else if (selector == 4) {
        GUICompact();        
    } else {
        GUISelector();
    }
}

// #flag: Update status text and refresh GUI if changed
function UpdateGUIStatus(msg) {
    var currentMessage = Orion.GetGlobal('gui_status');
    if (currentMessage == msg) {
        return;
    }
    Orion.SetGlobal('gui_status', msg);
    GUI();
}

//--------------------------------------------------------------
// GUI CLICK HANDLER
//--------------------------------------------------------------

// #flag: Central click handler for all Character Assistant buttons
function OnClick() {
    var buttonID = CustomGumpResponse.ReturnCode();
    var bardBoxResponse = CustomGumpResponse.ComboBox(5005);

    if (bardBoxResponse !== null) {
        if (bardBoxResponse == 1) {
            Shared.AddVar('bardSkill', 'Peacemaking');
        } else if (bardBoxResponse == 2) {
            Shared.AddVar('bardSkill', 'Provocation');
        }
    }

    switch (buttonID) {
        // Chivalry and buffs
        case 1001:
            ToggleScriptShared('AutoConWeap');
            Orion.Wait(100);
            GUI();
            break;

        case 1002:
            ToggleScriptShared('AutoAttack');
            Orion.Wait(100);
            GUI();
            break;

        case 1003:
            ToggleScriptShared('AutoEoO');
            Orion.Wait(100);
            GUI();
            break;

        case 1004:
            TurnOffScript('AutoWraith');
            ToggleScriptShared('AutoVamp');
            Orion.Wait(100);
            GUI();
            break;

        case 1005:
            TurnOffScript('AutoVamp');
            ToggleScriptShared('AutoWraith');
            Orion.Wait(100);
            GUI();
            break;

        case 1006:
            TurnOffScript('AutoPrimary');
            TurnOffScript('AutoSecondary');
            TurnOffScript('AutoLightningStrike');
            ToggleScriptShared('AutoMomentumStrike');
            Orion.Wait(100);
            GUI();
            break;

        case 1007:
            TurnOffScript('AutoPrimary');
            TurnOffScript('AutoSecondary');
            TurnOffScript('AutoMomentumStrike');
            ToggleScriptShared('AutoLightningStrike');
            Orion.Wait(100);
            GUI();
            break;

        case 1008:
            ToggleScriptShared('AutoCounterAttack');
            Orion.Wait(100);
            GUI();
            break;

        case 1009:
            ToggleScriptShared('HidePlayers');
            Orion.Wait(100);
            GUI();
            break;

        case 1010:
            TurnOffScript('AutoMomentumStrike');
            TurnOffScript('AutoSecondary');
            TurnOffScript('AutoLightningStrike');
            ToggleScriptShared('AutoPrimary');
            Orion.Wait(100);
            GUI();
            break;

        case 1011:
            ToggleScriptShared('auto_CrossHealBandage');
            Orion.Wait(100);
            GUI();
            break;

        case 1012:
            if (GetMaster() == 'not selected') {
                SetMaster();
            }
            ToggleScriptShared('FollowMaster');
            Orion.Wait(100);
            GUI();
            break;

        case 1013:
            SetMaster();
            GUI();
            break;

        case 1014:
            TurnOffScript('AutoPrimary');
            TurnOffScript('AutoMomentumStrike');
            ToggleScriptShared('AutoSecondary');
            Orion.Wait(100);
            GUI();
            break;

        // GUI navigation
        case 1015:
            GUISampire();
            break;

        case 1016:
            GUIThrower();
            break;

        case 1017:
            Shared.AddVar('selector', 0);
            GUISelector();
            break;

        case 1018:
            GUIMisc();
            break;

        // Confidence / Evade
        case 1020:
            ToggleScriptShared('autoConfidence');
            Orion.Wait(50);
            if (!isToggleOn('autoConfidence')) {
                Orion.Print(1191, "[Auto Confidence] Script Stopped");
            }
            Orion.Wait(100);
            GUI();
            break;

        case 1021:
            ToggleScriptShared('autoEvade');
            Orion.Wait(50);
            if (!isToggleOn('autoEvade')) {
                Orion.Print(1191, "[Auto Evade] Script Stopped");
            }
            Orion.Wait(100);
            GUI();
            break;

        // Auto Sampire
        case 1099:
            ToggleScriptShared('AutoSampire');
            GUI();
            break;

        // Party helpers
        case 2000:
            Orion.ToggleScript("create_Party");
            GUI();
            break;

        case 2001:
            Orion.ToggleScript("disbandParty");
            GUI();
            break;

        case 2002:
            RepairGear();
            GUI();
            break;

        // Looting and walking
        case 4999:
            var useLootCorpses = Shared.GetVar('useLootCorpses');
            if (useLootCorpses == 'True') {
                Shared.AddVar('useMoveToCorpses', 'False');
                Shared.AddVar('useLootCorpses', 'False');
            } else {
                Shared.AddVar('useMoveToCorpses', 'True');
                Shared.AddVar('useLootCorpses', 'True');
            }
            GUI();
            break;

        case 5000:
            var autoWalk = Shared.GetVar('autoWalk');
            if (autoWalk == 'True') {
                Shared.AddVar('autoWalk', 'False');
            } else {
                Shared.AddVar('autoWalk', 'True');
            }
            GUI();
            break;

        case 5001:
            RepairGear();
            GUI();
            break;

        case 5002:
            LootMyCorpses();
            GUI();
            break;

        // Compact bar expand button
        case 7001:
            Shared.AddVar('selector', 0);
            GUISelector();
            break;
            
		case 300000:
			if (Shared.GetVar('selector') != 4) {
				GUICompact()		
			} else {
	            Shared.AddVar('selector', 0);		
				GUISelector()
			}

			break;
			
		case 300001:
			if (Shared.GetVar('selector') != 4) {
				GUICompact()		
			} else {
	            Shared.AddVar('selector', 0);		
				GUISelector()
			}

			break;

        case 868686:
            break;

        case 868687:
            break;
    }
}

//--------------------------------------------------------------
// FOLLOW MASTER UTILITIES
//--------------------------------------------------------------

// #flag: Store master serial in Shared var by targeting a player
function SetMaster() {
    Orion.Print(1152, "Target your master");
    var res = Orion.WaitForTargetObject(15000);
    if (!res) {
        Shared.AddVar('masterSerial', '');
        return;
    }
    Shared.AddVar('masterSerial', res);
}

// #flag: Read master serial from Shared
function GetMasterSerial() {
    var s = Shared.GetVar('masterSerial');
    if (!s) return '';
    return s;
}

// #flag: Get master object or string if not selected
function GetMaster() {
    var s = GetMasterSerial();
    if (!s) return 'not selected';

    var obj = Orion.FindObject(s);
    if (!obj) return 'not selected';
    return obj;
}

// #flag: Get master name string
function GetMasterName() {
    var m = GetMaster();
    if (typeof m === 'string') return 'not selected';
    return m.Name();
}

// #flag: Follow master script - exits when FollowMaster toggle is not 1
function FollowMaster() {
    while (isToggleOn('FollowMaster')) {
        var master = GetMaster();
        if (typeof master === 'string') {
            Orion.Wait(1000);
            continue;
        }

        var masterSerial;
        try {
            masterSerial = master.Serial();
        } catch (e) {
            Orion.Wait(1000);
            continue;
        }

        if (!Orion.ObjectExists(masterSerial)) {
            Orion.Wait(1000);
            continue;
        }

        var distance;
        try {
            distance = master.Distance();
        } catch (e) {
            Orion.Wait(1000);
            continue;
        }

        if (distance > 6) {
            Orion.Follow(masterSerial);
        }

        Orion.Wait(100);
    }
}

//--------------------------------------------------------------
// SUMMON DETECTION
//--------------------------------------------------------------

// #flag: Check if a mob is summoned by name or properties
function isSummoned(nameOrProps, serial) {
    if (!serial) return false;

    var obj = Orion.FindObject(serial);
    if (!obj) return false;

    var name = obj.Name() || '';
    var lower = name.toLowerCase();

    for (var i = 0; i < summonedNames.length; i++) {
        if (lower.indexOf(summonedNames[i]) !== -1) {
            return true;
        }
    }

    var props = obj.Properties();
    if (Array.isArray(props)) {
        for (var j = 0; j < props.length; j++) {
            var p = (props[j] || '').toLowerCase();
            if (p.indexOf('(summoned)') !== -1) {
                return true;
            }
        }
    }

    return false;
}

//--------------------------------------------------------------
// COMBAT AUTOMATIONS (SHARED TOGGLE AWARE)
//--------------------------------------------------------------

// #flag: Auto cast Enemy of One when enemies are nearby
function AutoEoO() {
    while (!Player.Dead() && isToggleOn('AutoEoO')) {
        var arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetRange, targetNoto);
        if (arr.length != 0 && Player.Mana() > 30) {
            if (!Orion.BuffExists('Enemy of One')) {
                Orion.Cast('Enemy Of One');
                Orion.Wait(5000);
            }
        }
        Orion.Wait(3000);
    }
}

// #flag: Auto cast Consecrate Weapon when enemies are nearby
function AutoConWeap() {
    while (!Player.Dead() && isToggleOn('AutoConWeap')) {
        var arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetRange, targetNoto);
        if (arr.length != 0 && Player.Mana() > 25) {
            if (!Orion.BuffExists('Consecrate Weapon')) {
                Orion.Cast('Consecrate Weapon');
                Orion.Wait(5000);
            }
        }
        Orion.Wait(3000);
    }
}

// #flag: Keep Primary special armed
function AutoPrimary() {
    while (!Player.Dead() && isToggleOn('AutoPrimary')) {
        if (!Orion.AbilityStatus('Primary') && Player.Mana() > 30) {
            Orion.UseAbility('Primary');
            Orion.Wait(500);
            UpdateGUIStatus('Primary Armed');
        }
        Orion.Wait(1000);
    }
}

// #flag: Keep Secondary special armed
function AutoSecondary() {
    while (!Player.Dead() && isToggleOn('AutoSecondary')) {
        if (!Orion.AbilityStatus('Secondary') && Player.Mana() > 30) {
            Orion.UseAbility('Secondary');
            Orion.Wait(500);
            UpdateGUIStatus('Secondary Armed');
        }
        Orion.Wait(1000);
    }
}

// #flag: Maintain Vampiric Embrace buff
function AutoVamp() {
    while (!Player.Dead() && Orion.SkillValue('Necromancy') > 999 && isToggleOn('AutoVamp')) {
        while (!Player.Dead() && !Orion.BuffExists('Vampiric Embrace') && isToggleOn('AutoVamp')) {
            UpdateGUIStatus('Casting Vampiric Embrace');
            Orion.Cast('Vampiric Embrace');
            Orion.Wait(3000);
            if (Orion.BuffExists('Vampiric Embrace')) {
                UpdateGUIStatus('Vampiric Embrace Active');
            }
        }
        Orion.Wait(5000);
    }
}

// #flag: Maintain Wraith Form buff
function AutoWraith() {
    while (!Player.Dead() && isToggleOn('AutoWraith')) {
        if (Player.Flying()) {
            Orion.ToggleGargoyleFlying();
            Orion.Wait(3000);
        }

        while (!Player.Dead() && !Orion.BuffExists('Wraith Form') && isToggleOn('AutoWraith')) {
            UpdateGUIStatus('Casting Wraith Form');
            Orion.Cast('Wraith Form');
            Orion.Wait(3000);
            if (Orion.BuffExists('Wraith Form')) {
                UpdateGUIStatus('Wraith Form Active');
            }
        }
        Orion.Wait(5000);
    }
}

// #flag: Auto attack for thrower style characters, optionally walking toward targets
function AutoAttack() {
    while (!Player.Dead() && isToggleOn('AutoAttack')) {
        var useLootCorpses = Shared.GetVar('useLootCorpses');
        var rawAutoWalk = Shared.GetVar('autoWalk');
        var autoWalk = (rawAutoWalk === 'True' || rawAutoWalk === true);
        var targetThrowerRange = autoWalk ? 20 : 10;

        var arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetThrowerRange, targetNoto);
        if (arr.length > 0) {
            arr.sort(function (a, b) { return a.Distance() - b.Distance(); });

            for (var i = 0; i < arr.length && isToggleOn('AutoAttack'); i++) {
                var target = arr[i];
                if (!target || typeof target.Serial !== 'function') continue;

                var serial = target.Serial();
                if (!serial) continue;

                var targetObject = Orion.FindObject(serial);
                if (!targetObject) continue;

                var name = targetObject.Name();
                var props = targetObject.Properties() || [];
                var propsText = Array.isArray(props) ? props.join(" ") : "";
                var combinedText = name + " " + propsText;

                if (Orion.Contains(props, "A Revenant") && Orion.SkillValue("Chivalry") > 800) {
                    Orion.Print("Detected Revenant - casting Dispel Evil");
                    Orion.Cast("Dispel Evil");
                    Orion.Wait(5000);
                    continue;
                }

                if (isSummoned(combinedText, serial)) {
                    UpdateGUIStatus("Ignoring summon: " + name);
                    Orion.Ignore(serial);
                    continue;
                }

                var closestTargetSerial = serial;
                Orion.AddHighlightCharacter(closestTargetSerial, 0x0AC3, true);
                Orion.ShowStatusbar(closestTargetSerial, 550, 100);
                Orion.CharPrint(closestTargetSerial, 52, '*Target*');

                while (Orion.ObjectExists(closestTargetSerial) && !Player.Dead() && isToggleOn('AutoAttack')) {
                    var currentTargetObject = Orion.FindObject(closestTargetSerial);
                    if (currentTargetObject) {
                        UpdateGUIStatus('Attacking: ' + currentTargetObject.Name());

                        if (autoWalk) {
                            Orion.WalkTo(currentTargetObject.X(), currentTargetObject.Y(), currentTargetObject.Z(), 7, 2, 1, 2, 5000);
                        }
                    } else {
                        UpdateGUIStatus('Target lost, searching for a new target');
                        break;
                    }

                    Orion.GetStatus(closestTargetSerial);
                    Orion.Attack(closestTargetSerial);
                    Orion.Wait(100);

                    arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetThrowerRange, targetNoto);
                    arr.sort(function (a, b) { return a.Distance() - b.Distance(); });

                    if (arr.length > 0 && arr[0].Serial() !== closestTargetSerial) {
                        Orion.Print('New closer target found, changing target');
                        break;
                    }
                }

                Orion.CloseStatusbar('all');
                if (useLootCorpses == 'True') {
                    LootCorpses();
                }
                Orion.Wait(100);
                break;
            }
        } else {
            UpdateGUIStatus('No target available');
            Orion.Wait(100);
        }
    }
}

// #flag: Sampire style auto attack using GoToAndAttackTarget
function AutoSampire() {
    while (!Player.Dead() && isToggleOn('AutoSampire')) {
        var arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', 'ignoreself|ignorefriends|live|near|inlos', 15, targetNoto, 1000);
        var useLootCorpses = Shared.GetVar('useLootCorpses');

        if (arr.length > 0) {
            arr.sort(function (a, b) { return a.Distance() - b.Distance(); });

            for (var i = 0; i < arr.length && isToggleOn('AutoSampire'); i++) {
                var target = arr[i];
                var targetObject = Orion.FindObject(target.Serial());
                if (!targetObject) continue;

                var props = targetObject.Properties();
                if (!isSummoned(props, target.Serial())) {
                    if (GoToAndAttackTarget(targetObject)) {
                        if (useLootCorpses === 'True') {
                            LootCorpses();
                        }
                        Orion.Wait(500);
                        break;
                    }
                }
            }
        } else {
            UpdateGUIStatus('No target available');
            Orion.Wait(100);
        }
    }
}

// #flag: Hide players and some summons from view
function HidePlayers() {
    while (!Player.Dead() && isToggleOn('HidePlayers')) {
        var peeps = Orion.FindType(playerGraphics, 'any', 'ground', 'live|ignoreself', 24, "blue");
        for (var i = 0; i < peeps.length; i++) {
            Orion.Hide(peeps[i]);
        }

        var summons = Orion.FindType('0x033D|0x00A4|0x004F', -1, 'ground', 'live|ignoreself', 24, 'red');
        for (var j = 0; j < summons.length; j++) {
            Orion.Hide(summons[j]);
        }

        Orion.Wait(100);
    }
}

// #flag: Auto cast Momentum Strike as long as toggle is on
function AutoMomentumStrike() {
    while (!Player.Dead() && isToggleOn('AutoMomentumStrike')) {
        if (!Orion.BuffExists('Momentum Strike') && Player.Mana() > 10) {
            Orion.Cast('Momentum Strike');
            Orion.Wait(500);
        }
        Orion.Wait(500);
    }
}

// #flag: Auto cast Lightning Strike as long as toggle is on
function AutoLightningStrike() {
    while (!Player.Dead() && isToggleOn('AutoLightningStrike')) {
        if (!Orion.BuffExists('Lightning Strike') && Player.Mana() > 10) {
            Orion.Cast('Lightning Strike');
            Orion.Wait(500);
        }
        Orion.Wait(500);
    }
}

// #flag: Auto cast Counter Attack when weapon is equipped and conditions are met
function AutoCounterAttack() {
    while (!Player.Dead() && isToggleOn('AutoCounterAttack')) {
        var hands = Orion.ObjAtLayer(1) || Orion.ObjAtLayer(2);

        if (!Player.Hidden() &&
            hands &&
            !Orion.BuffExists('0x75f7') &&
            !Orion.BuffExists('0x75F8') &&
            !Orion.BuffExists('0x75f9') &&
            !Orion.HaveTarget() &&
            !Player.Frozen() &&
            !Orion.AbilityStatus('Primary') &&
            !Orion.AbilityStatus('Secondary')) {
            Orion.Cast('Counter Attack');
            Orion.Wait(500);
        }
        Orion.Wait(100);
    }
}

// #flag: Auto Evade defensive script with timer display
function autoEvade() {
    Orion.Print(1191, "[Auto Evade] Script Started");

    while (!Player.Dead() && isToggleOn('autoEvade')) {
        if (!Orion.DisplayTimerExists('evade') &&
            Player.Mana() > 15 &&
            Player.MaxHits() > 80 &&
            !Player.Frozen() &&
            (Player.MaxHits() - Player.Hits() > 40)) {

            if (Orion.ObjAtLayer('RightHand') || Orion.ObjAtLayer('LeftHand')) {
                Orion.Cast('Evasion');
                Orion.AddDisplayTimer('evade', 30000, 'UnderChar', 'Circle|Bar', 'Evade', -80, 50, '51', fontCode, '0xFFA500FF');
                Orion.Wait(1000);
            }
        }
        Orion.Wait(1000);
    }

    Orion.Print(1191, "[Auto Evade] Script Stopped");
}

// #flag: Auto Confidence defensive script with timer display
function autoConfidence() {
    Orion.Print(1191, "[Auto Confidence] Script Started");

    while (!Player.Dead() && isToggleOn('autoConfidence')) {
        if (!Orion.DisplayTimerExists('confidence') &&
            Player.Mana() > 15 &&
            Player.MaxHits() > 70 &&
            !Player.Frozen() &&
            (Player.MaxHits() - Player.Hits() > 30)) {

            Orion.Cast('Confidence');
            Orion.AddDisplayTimer('confidence', 15000, 'UnderChar', 'Circle|Bar', 'Confidence', 80, 50, '51', fontCode, '0xFFA500FF');
            Orion.Wait(1000);
        }
        Orion.Wait(1000);
    }

    Orion.Print(1191, "[Auto Confidence] Script Stopped");
}

// #flag: Simple auto bandage healer for self and party (looped healer)
function auto_CrossHealBandage() {
    openContainer(backpack);
    Orion.Wait(1250);

    var firstAidBelt = Orion.FindTypeEx('0xA1F6', '0x0000', backpack);
    if (firstAidBelt.length > 0) {
        openContainer(firstAidBelt[0].Serial());
        Orion.Wait(1250);
    }

    Orion.Print(1191, "[Auto Bandage] Script Started");

    while (!Player.Dead() && isToggleOn('auto_CrossHealBandage')) {
        if (auto_PoisonBandage()) {
            continue;
        }

        var bandages = Orion.FindType('0x0E21', -1, backpack, 'item', ' ', ' ', true);
        if (bandages.length === 0) {
            Orion.PrintFast('self', 33, 4, 'No bandages found');
            Orion.Wait(1000);
            continue;
        }

        var potentialTargets = Orion.FindType(playerGraphics, "-1", 'ground', "ignoreself", 2, "green");
        potentialTargets.push(Player.Serial());

        var finalTarget = weightedRandomHealTarget(potentialTargets, 2);
        Orion.Wait(100);
        if (finalTarget) {
            if (finalTarget.Hits() < finalTarget.MaxHits() &&
                finalTarget.Distance() <= 2 &&
                !IsApplyingBandages()) {
                Orion.BandageTarget(finalTarget.Serial());
                Orion.Wait(500);
                Orion.AddDisplayTimer('bandageFriend', Orion.BuffTimeRemaining('0x7596'), 'UnderChar', 'Rectangle|Bar', 'Heal', 0, 0, 126, 4, '0xFF00FF00');
                Orion.DisplayTimerSetSize('bandageFriend', 200, 20);
                Orion.PrintFast('self', 1151, 4, 'Bandaging: ' + finalTarget.Name());
                Orion.Wait(750);
            }
        } else {
            Orion.Wait(200);
            if (Player.Hits() < Player.MaxHits() && !IsApplyingBandages()) {
                Orion.BandageSelf();
                Orion.Wait(500);
                Orion.AddDisplayTimer('bandageFriend', Orion.BuffTimeRemaining('0x7596'), 'UnderChar', 'Rectangle|Bar', 'Heal', 0, 0, 126, 4, '0xFF00FF00');
                Orion.DisplayTimerSetSize('bandageFriend', 200, 20);
                Orion.PrintFast('self', 1151, 4, 'Bandaging: Self');
                Orion.Wait(750);
            }
        }
    }

    Orion.Print(1191, "[Auto Bandage] Script Stopped");
}

//--------------------------------------------------------------
// DEATH CHECKER
//--------------------------------------------------------------

// #flag: Simple death watcher that updates GUI status when dead
function deathCheck() {
    while (isToggleOn('deathCheck')) {
        if (Player.Dead()) {
            GUI();
            UpdateGUIStatus('Character is dead');
        }
        Orion.Wait(4000);
    }
}

//--------------------------------------------------------------
// EVENT GATE AND GUMP HELPERS
//--------------------------------------------------------------

// #flag: Find an event gate near player and enter it, retrying on spirit failure
function eventGate() {
    var gate = Orion.FindTypeEx('0x4B8F|0x0DDB|0x0F6C|0x4BCB|0x0DDA', -1, ground, 'items', 5);
    var success = false;

    if (gate.length !== 0) {
        UpdateGUIStatus('Event Gate Found');

        var gateX = gate[0].X();
        var gateY = gate[0].Y();
        var gateZ = gate[0].Z();

        Orion.WalkTo(gateX, gateY, gateZ, 0, 255, 0, 1, 2000);
        Orion.Wait(2500);

        if (Player.X() === gateX && Player.Y() === gateY && Player.Z() === gateZ) {
            while (!success) {
                Orion.UseObject(gate[0].Serial());
                Orion.WaitForGump(1000);
                GumpAction('0x0000232D', 1, 1000, true);

                Orion.Wait(500);

                if (Orion.InJournal('Your spirit lacks')) {
                    UpdateGUIStatus('Retrying Gate');
                    Orion.ClearJournal();
                } else if (Player.X() !== gateX || Player.Y() !== gateY || Player.Z() !== gateZ) {
                    success = true;
                }
            }
        }
    }
}

// #flag: Generic gump action helper that selects a hook and optionally closes gump
function GumpAction(gumpID, hookID, waitTime, closeGump) {
    if (Orion.WaitForGump(1000)) {
        var gump = Orion.GetGump('last');
        if ((gump !== null) && (!gump.Replayed()) && (gump.ID() === gumpID)) {
            gump.Select(Orion.CreateGumpHook(hookID));
            Orion.Wait(waitTime);

            if (closeGump) {
                gump.Select(Orion.CreateGumpHook(0));
                Orion.Wait(300);
                Orion.CancelTarget();
            }
        }
    }
}

// #flag: Accept resurrection gump and auto rearm and restart core scripts
function AcceptRes() {
    while (true) {
        while (Player.Dead()) {
            if (Orion.WaitForGump(1000)) {
                var gump0 = Orion.GetGump('last');
                if ((gump0 !== null) && (!gump0.Replayed()) && (gump0.ID() === '0x000008AF')) {
                    gump0.Select(Orion.CreateGumpHook(2));
                    Orion.Wait(100);
                }
            }
            Orion.Wait(2500);
            Orion.Dress(Player.Name() + Orion.ShardName());
            if (!Orion.ScriptRunning("AutoAttack")) Orion.ToggleScript("AutoAttack");
            if (!Orion.ScriptRunning("AutoPrimary")) Orion.ToggleScript("AutoPrimary");
            if (!Orion.ScriptRunning("auto_CrossHealBandage")) Orion.ToggleScript("auto_CrossHealBandage");
            if (!Orion.ScriptRunning("AutoRearm")) Orion.ToggleScript("AutoRearm");
        }
        Orion.Wait(2500);
    }
}

//--------------------------------------------------------------
// GEAR AND FORM UTILITIES
//--------------------------------------------------------------

// #flag: Auto rearm previous weapon after disarm using timer guard
function AutoRearm() {
    var ondisarmonly = false;
    var doit = false;

    if (Player.Name() == "Neo-Terror") {
        ondisarmonly = true;
    }

    while (true) {
        var prevwep = null;

        if (Orion.BuffExists("disarm") && Orion.Timer("DisarmTimer") >= -1) {
            Orion.SetTimer("DisarmTimer", -4000);
            Orion.AddDisplayTimer("DisarmTimer", 4000, "AboveChar", "Circle|Bar", "Disarm", 0, 0, '55', 0xFF, '0xFFFFFF');
        }

        if ((Orion.BuffExists("disarm") || Orion.BuffExists("no rearm")) || !ondisarmonly) {
            doit = true;
        }

        if (!(Orion.ObjAtLayer('RightHand') || Orion.ObjAtLayer('LeftHand')) && doit) {
            var wep = Orion.FindObject('PrevWep');
            while (!(Orion.ObjAtLayer('RightHand') || Orion.ObjAtLayer('LeftHand')) && wep) {
                if (!Player.Frozen() && !(Orion.BuffExists("disarm") || Orion.BuffExists("no rearm"))) {
                    Orion.Equip(wep.Serial());
                    Orion.Wait(500);
                }
            }
            doit = false;
        }

        if (Orion.ObjAtLayer('RightHand')) {
            Orion.AddObject("PrevWep", Orion.ObjAtLayer('RightHand').Serial());
        } else if (Orion.ObjAtLayer('LeftHand')) {
            Orion.AddObject("PrevWep", Orion.ObjAtLayer('LeftHand').Serial());
        }

        Orion.Wait(400);
    }
}

// #flag: Clear any active polymorph / necro / mystic forms
function FormRevert() {
    if (Orion.BuffExists('Horrific Beast')) { while (Orion.BuffExists('Horrific Beast')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Horrific Beast'); Orion.Wait(3000); } }
    if (Orion.BuffExists('Wraith Form')) { while (Orion.BuffExists('Wraith Form')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Wraith Form'); Orion.Wait(3000); } }
    if (Orion.BuffExists('Lich Form')) { while (Orion.BuffExists('Lich Form')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Lich Form'); Orion.Wait(3000); } }
    if (Orion.BuffExists('Vampiric Embrace')) { while (Orion.BuffExists('Vampiric Embrace')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Vampiric Embrace'); Orion.Wait(3000); } }
    if (Orion.BuffExists('Animal Form')) { while (Orion.BuffExists('Animal Form')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Animal Form'); Orion.Wait(3000); } }
    if (Orion.BuffExists('Stone Form')) { while (Orion.BuffExists('Stone Form')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Stone Form'); Orion.Wait(3000); } }
}

// #flag: Mark no-walk bad locations and highlight them on the map
function SetBadLocations() {
    var id = 0;
    for (var i = 0; i < badLocations.length; i++) {
        var loc = badLocations[i];
        Orion.SetBadLocation(loc.x, loc.y, -1);
        Orion.AddHighlightArea(id, -1, 'pos', '0x0490', 0, 0, 'all', loc.x, loc.y);
        id++;
    }
}

// #flag: Periodically click backpack to keep client active
function keepActive() {
    while (true) {
        Orion.Click(backpack);
        Orion.Wait(30000);
    }
}

//--------------------------------------------------------------
// PARTY UTILITIES
//--------------------------------------------------------------

// #flag: Create party by auto inviting nearby blue/green players
function create_Party() {
    var targetFlags = 'ignoreself|ignoreenemies|live|inlos';
    var partyNoto = 'green';
    const players = "0x0190|0x0191|0x0192|0x0193|0x00B7|0x00BA|0x025D|0x025E|0x0260|0x029A|0x029B|0x02B6|0x02B7|0x03DB|0x03DF|0x03E2|0x02EB|0x02EC|0x02ED|0x02C1|0x011D";
    const maxMembers = 10;

    var getMembersStart = Orion.PartyMembers().length + 1;
    if (getMembersStart == maxMembers) {
        Orion.CharPrint(self, 55, 'Party members: ' + getMembersStart + '/' + maxMembers);
        Orion.CharPrint(self, 55, '-- Party is full --');
        return;
    }

    var getParty = Orion.FindType(players, any, 'ground', targetFlags, 8, partyNoto);
    if (getParty.length > 0) {
        for (var i = 0; i < getParty.length; i++) {
            if (!Orion.InParty(getParty[i])) {
                Orion.RequestContextMenu(getParty[i]);
                Orion.WaitContextMenuID(getParty[i], 810);
                Orion.Wait(1500);
                var getMembers = Orion.PartyMembers().length + 1;
                if (getMembers == maxMembers) {
                    Orion.CharPrint(self, 55, 'Party members: ' + getMembers + '/' + maxMembers);
                    Orion.CharPrint(self, 55, '-- Party is full --');
                    return;
                }
            }
        }
    } else {
        Orion.CharPrint(self, 55, '--No one found--');
        return;
    }

    var getMembersEnd = Orion.PartyMembers().length + 1;
    if (getMembersEnd > getMembersStart) {
        var count = getMembersEnd - getMembersStart;
        Orion.CharPrint(self, 55, 'Party members: ' + getMembersEnd + '/' + maxMembers);
        Orion.CharPrint(self, 55, '-- ' + count + ' members added --');
    } else {
        Orion.CharPrint(self, 55, '-- No members added --');
    }
}

// #flag: Disband party via context menu
function disbandParty() {
    Orion.RequestContextMenu(Player.Serial());
    Orion.WaitContextMenuID(Player.Serial(), 811);
    Orion.Wait(500);
    Orion.RemoveObject('ac_master');
}

//--------------------------------------------------------------
// RESTOCK AND CONTAINER HELPERS
//--------------------------------------------------------------

// #flag: Restock bandages from secure container, favor belt if present
function RestockBandages() {
    Orion.Print("Restock script started");
    var startX = Player.X();
    var startY = Player.Y();
    var startZ = Player.Z();

    var bandageSecure;

    if (Orion.ShardName() === "Origin") {
        bandageSecure = '0x41497E27';
    } else {
        Orion.Print("Select the secure container with bandages");
        Orion.WaitForAddObject('bandageSecure');
        bandageSecure = Orion.FindObject('bandageSecure');

        if (!bandageSecure) {
            Orion.Print("Error: No secure container selected");
            return;
        }

        bandageSecure = bandageSecure.Serial();
    }

    var secureObj = Orion.FindObject(bandageSecure);
    if (!secureObj) {
        Orion.Print("Error: Secure container not found");
        return;
    }

    Orion.WalkTo(secureObj.X(), secureObj.Y(), secureObj.Z(), 1, 255, 1);
    Orion.OpenContainer(bandageSecure);
    Orion.Wait(1250);

    var backpack = Orion.ObjAtLayer('Backpack');
    if (!backpack) {
        Orion.Print("Error: Could not find your backpack");
        return;
    }

    Orion.OpenContainer(backpack.Serial());
    Orion.Wait(1250);

    var allBandagesInSecure = Orion.FindTypeEx('0x0E21', -1, bandageSecure);
    if (allBandagesInSecure.length === 0) {
        Orion.Print("No bandages found in the secure container");
        return;
    }

    var baseGraphic = allBandagesInSecure[0].Graphic();
    var baseColor = allBandagesInSecure[0].Color();

    var backpackBandages = Orion.FindTypeEx('0x0E21', 'any', backpack.Serial());
    backpackBandages.forEach(function (item) {
        if (item.Graphic() !== baseGraphic || item.Color() !== baseColor) {
            Orion.Wait(1250);
            Orion.MoveItem(item.Serial(), 0, bandageSecure);
            Orion.Wait(2500);
        }
    });

    var firstAidBelt = Orion.FindTypeEx('0xA1F6', 'any', backpack.Serial());
    var beltSerial = null;

    if (firstAidBelt.length) {
        beltSerial = firstAidBelt[0].Serial();
        Orion.OpenContainer(beltSerial);
        Orion.Wait(1200);

        var beltBandages = Orion.FindTypeEx('0x0E21', 'any', beltSerial);
        beltBandages.forEach(function (item) {
            if (item.Graphic() !== baseGraphic || item.Color() !== baseColor) {
                Orion.MoveItem(item.Serial(), 0, bandageSecure);
                Orion.Wait(600);
            }
        });
    }

    var totalNeeded = beltSerial ? 1000 : 500;
    var targetContainerSerial = beltSerial || backpack.Serial();
    var haveCount = Orion.Count('0x0E21', baseColor, targetContainerSerial);
    var needed = totalNeeded - haveCount;

    if (needed <= 0) {
        Orion.Print("You already have enough bandages");
        return;
    }

    var available = Orion.Count('0x0E21', baseColor, bandageSecure);
    if (available === 0) {
        Orion.Print("No matching bandages left in the secure container");
        return;
    }

    var toMove = Math.min(needed, available);
    Orion.MoveItem(allBandagesInSecure[0].Serial(), toMove, targetContainerSerial);
    Orion.Print("Restock complete. Moved " + toMove + " bandages");
    Orion.Wait(2500);
    Orion.WalkTo(startX, startY, startZ);
}

// #flag: Robust container open function that waits out "wait to perform" spam
function openContainer(containerSerial) {
    var retryCount = 0;
    while (retryCount < 10) {
        Orion.UseObject(containerSerial);
        Orion.Wait(1250);

        if (!Orion.InJournal('You must wait to perform')) {
            return true;
        }
        retryCount++;
    }

    return false;
}

//--------------------------------------------------------------
// HEALING HELPERS
//--------------------------------------------------------------

// #flag: Weighted random friend picker based on missing health
function weightedRandomHealTarget(potentialTargets, dist) {
    var weightedTargets = [];
    if (potentialTargets && potentialTargets.length > 0) {
        potentialTargets.forEach(function (targetId) {
            var targetObj = Orion.FindObject(targetId);
            if (!targetObj) return;
            if (targetObj.Distance() > dist) return;

            Orion.GetStatus(targetObj.Serial());
            var currentHits = targetObj.Hits();
            var maxHits = targetObj.MaxHits();
            var healthPct = (currentHits / maxHits) * 100;

            if (healthPct < 100) {
                if (healthPct < 40) {
                    weightedTargets.push(targetId, targetId, targetId);
                } else if (healthPct < 80) {
                    weightedTargets.push(targetId, targetId);
                } else {
                    weightedTargets.push(targetId);
                }
            }
        });
    }
    if (weightedTargets.length > 0) {
        var randomIndex = Math.floor(Math.random() * weightedTargets.length);
        return Orion.FindObject(weightedTargets[randomIndex]);
    }
    return null;
}

// #flag: Check if any bandage buff is currently active
function IsApplyingBandages() {
    return (Orion.BuffExists('0x7596') && Orion.BuffTimeRemaining('healing skill') > 0) ||
        (Orion.BuffExists('veterinary') && Orion.BuffTimeRemaining('veterinary') > 0);
}

// #flag: Auto bandage poisoned target in range if present
function auto_PoisonBandage() {
    var bandages = Orion.FindType('0x0E21', -1, backpack, 'item', ' ', ' ', true);
    if (bandages.length === 0) {
        Orion.PrintFast('self', 33, 4, 'No bandages found for poison');
        Orion.Wait(1000);
        return false;
    }

    var potentialTargets = Orion.FindType(playerGraphics, "-1", 'ground', "live|ignoreself", 2, "green");
    potentialTargets.push(Player.Serial());

    for (var i = 0; i < potentialTargets.length; i++) {
        var currentTarget = Orion.FindObject(potentialTargets[i]);
        if (!currentTarget) continue;

        Orion.GetStatus(currentTarget.Serial());
        if (currentTarget.Poisoned() && currentTarget.Distance() <= 2) {
            if (!IsApplyingBandages()) {
                Orion.BandageTarget(currentTarget.Serial());
                Orion.Wait(500);
                Orion.AddDisplayTimer('poisonBandage', Orion.BuffTimeRemaining('0x7596'), 'UnderChar', 'Rectangle|Bar', 'Poison', 0, 0, 126, 4, '0xFFFF0000');
                Orion.DisplayTimerSetSize('poisonBandage', 200, 20);
                Orion.PrintFast('self', 1151, 4, 'Bandaging on Poison: ' + currentTarget.Name());
                Orion.Wait(750);
                return true;
            }
        }
    }
    return false;
}

//--------------------------------------------------------------
// TAME / PET COMBAT
//--------------------------------------------------------------

// #flag: Auto pet all kill nearest enemy, respects useLootCorpses
function allKillNear() {
    while (!Player.Dead() && isToggleOn('allKillNear')) {
        var useLootCorpses = Shared.GetVar('useLootCorpses');
        var arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetRange, targetNoto);

        if (arr.length > 0) {
            arr.sort(function (a, b) { return a.Distance() - b.Distance(); });

            for (var i = 0; i < arr.length && isToggleOn('allKillNear'); i++) {
                var target = arr[i];
                var targetObject = Orion.FindObject(target.Serial());
                if (!targetObject) continue;

                var targetProperties = targetObject.Properties();
                if (!isSummoned(targetProperties)) {
                    var closestTargetSerial = target.Serial();

                    Orion.AddHighlightCharacter(closestTargetSerial, 0x0AC3, true);
                    Orion.ShowStatusbar(closestTargetSerial, 550, 100);
                    Orion.CharPrint(closestTargetSerial, 52, '*Target*');

                    Orion.Say("All Kill");
                    Orion.Wait(500);
                    Orion.TargetObject(closestTargetSerial);

                    while (Orion.ObjectExists(closestTargetSerial) && !Player.Dead() && isToggleOn('allKillNear')) {
                        var currentTargetObject = Orion.FindObject(closestTargetSerial);
                        if (currentTargetObject) {
                            UpdateGUIStatus('Attacking: ' + currentTargetObject.Name());
                        }
                        Orion.GetStatus(closestTargetSerial);
                        Orion.Wait(500);

                        arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetRange, targetNoto);
                        if (arr.length > 0) {
                            arr.sort(function (a, b) { return a.Distance() - b.Distance(); });
                            if (arr[0].Serial() !== closestTargetSerial) {
                                Orion.Print('New closer target found, changing target');
                                closestTargetSerial = arr[0].Serial();
                                Orion.Say("All Kill");
                                Orion.Wait(500);
                                Orion.TargetObject(closestTargetSerial);
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    Orion.CloseStatusbar('all');
                    if (useLootCorpses == 'True') {
                        LootCorpses();
                    }
                    Orion.Say("All Follow Me");
                    Orion.Wait(100);
                    break;
                }
            }
        } else {
            UpdateGUIStatus('No target available');
            Orion.Wait(500);
        }
    }
}

// #flag: Add mount alias by targeting mount
function AddMount() {
    Orion.Print('-1', 'Target your mount');
    Orion.AddObject('myMount');
}

// #flag: Simple mount or dismount toggle using saved mount alias
function MountAndDismount() {
    var mount = Orion.ObjAtLayer('Mount');
    if (!mount) {
        if (!Orion.FindObject('myMount')) {
            Orion.Print('-1', 'Mount not set. Please target your mount');
            AddMount();
        } else {
            Orion.UseObject('myMount');
        }
    } else {
        Orion.UseObject('self');
    }
}

//--------------------------------------------------------------
// PVP FUNCTIONS
//--------------------------------------------------------------

// #flag: Auto trap box usage on nerve strike and paralysis
function autoBox() {
    Orion.Print(1191, "[AutoBox] Script Started");

    while (!Player.Dead() && isToggleOn('autoBox')) {
        var box = Orion.FindTypeEx('0x09A9', 'any', 'backpack');

        if (!box.length) {
            Orion.Print(1191, "[AutoBox] No box found in backpack");
            Orion.Wait(1000);
            continue;
        }

        if (Orion.InJournal('Your attacker dealt a crippling nerve strike', 'my', 10)) {
            Orion.Print(1191, "[AutoBox] Nerve Strike detected");
            Orion.ClearJournal();
            Orion.UseItemOnMobile(box[0].Serial(), 'self');
            Orion.Wait(50);
            Orion.CloseGump('container', box[0].Serial());
            Orion.Wait(2000);
        }

        if (Player.Paralyzed()) {
            Orion.Print(1191, "[AutoBox] Player is paralyzed");

            if (Player.Hits() > 30) {
                Orion.UseItemOnMobile(box[0].Serial(), 'self');
                Orion.Wait(50);
                Orion.CloseGump('container', box[0].Serial());
                Orion.Wait(2000);
            } else {
                Orion.Print(1191, "[AutoBox] HP too low (" + Player.Hits() + "), not using box");
            }
        }

        Orion.Wait(500);
    }
    Orion.Print(1191, "[AutoBox] Script Stopped");
}

// #flag: Auto drink Str/Dex pots when buffs missing
function autoDrinkDexStr() {
    Orion.Print(1191, "[Auto Str/Dex Potion] Script Started");

    while (!Player.Dead() && isToggleOn('autoDrinkDexStr')) {
        if (!Player.Hidden()) {
            if (!Orion.BuffExists('Agility') || Orion.BuffTimeRemaining('Agility') < 5000) {
                var agilityPotion = Orion.FindType('0x0F08', '0x0000', 'backpack');
                if (agilityPotion.length) {
                    Orion.UseItemOnMobile(agilityPotion[0], Player.Serial());
                    Orion.Wait(100);
                } else {
                    Orion.CharPrint('self', 1191, 'No Greater Agility Potions');
                }
            }

            if (!Orion.BuffExists('Strength') || Orion.BuffTimeRemaining('Strength') < 5000) {
                var strengthPotion = Orion.FindType('0x0F09', '0x0000', 'backpack');
                if (strengthPotion.length) {
                    Orion.UseItemOnMobile(strengthPotion[0], Player.Serial());
                    Orion.Wait(100);
                } else {
                    Orion.CharPrint('self', 1191, 'No Greater Strength Potions');
                }
            }
        }

        Orion.Wait(600);
    }

    Orion.Print(1191, "[Auto Str/Dex Potion] Script Stopped");
}

// #flag: Auto heal and cure potions based on HP and poison
function autoHealCure() {
    Orion.Print(1191, "[Auto Heal/Cure] Script Started");

    while (!Player.Dead() && isToggleOn('autoHealCure')) {
        Orion.Wait(500);

        if (Player.Poisoned()) {
            var curePotion = Orion.FindType('0x0F07', '0x0000', 'backpack');
            if (curePotion.length) {
                Orion.UseItemOnMobile(curePotion[0], Player.Serial());
                Orion.Wait(1100);
                Orion.ClearJournal();
            } else {
                Orion.CharPrint('self', 1191, 'No Cure Potions');
            }
        }

        if (!Orion.DisplayTimerExists('healPot') &&
            Player.Hits() < (Player.MaxHits() - 30)) {
            var healPotion = Orion.FindType('0x0F0C', '0x0000', 'backpack');
            if (healPotion.length) {
                Orion.UseItemOnMobile(healPotion[0], Player.Serial());
                Orion.AddDisplayTimer('healPot', 10000, 'AboveChar', 'bar|circle', 'Heal Potion', 0, 0, '44', fontCode, '0xFFA500FF');
                Orion.Wait(600);
            } else {
                Orion.CharPrint('self', 1191, 'No Heal Potions');
            }
        }
        Orion.Wait(500);
    }
    Orion.Print(1191, "[Auto Heal/Cure] Script Stopped");
}

// #flag: Auto enchanted apple usage when certain debuffs present
function autoApple() {
    Orion.Print(1191, "[Auto Apple] Script Started");

    while (!Player.Dead() && isToggleOn('autoApple')) {
        if (!Orion.DisplayTimerExists('apple')) {
            if (Orion.BuffExists('Corpse Skin') ||
                Orion.BuffExists('Sleep') ||
                Orion.BuffExists('Mortal Strike')) {
                var apple = Orion.FindType('0x2FD8', '0x0488', 'backpack');
                if (apple.length) {
                    Orion.UseObject(apple[0]);
                    Orion.AddDisplayTimer('apple', 30000, "UnderChar", "Circle|Bar", "Apple", 0, 50, '289', fontCode, '0x00CCFFFF');
                } else {
                    Orion.CharPrint('self', 1191, 'No Apples Available');
                }
            }
        }

        Orion.Wait(500);
    }
    Orion.Print(1191, "[Auto Apple] Script Stopped");
}

//--------------------------------------------------------------
// BARD FUNCTIONS
//--------------------------------------------------------------

// #flag: Area peace bard function using instrument and peacemaking
function AreaPeace() {
    while (!Player.Dead() && isToggleOn('AreaPeace')) {
        Orion.UseType('0x0E9D|0x0E9C|0x0EB2|0x0EB3');
        Orion.UseSkill('Peacemaking');
        Orion.WaitForTarget(1000);
        Orion.TargetObject(self);
        Orion.Wait(8500);
    }
}

// #flag: Auto provo bard function using ignore lists and display timers
function AutoProvo() {
    while (!Player.Dead() && isToggleOn('AutoProvo')) {
        Orion.UseIgnoreList('ProvoList');
        var mob = Orion.FindTypeEx(any, any, ground, 'mobile', 13, 'red|gray|criminal').sort(function (a, b) {
            return Orion.GetDistance(a.Serial()) - Orion.GetDistance(b.Serial());
        });

        for (var i = 0; i < mob.length; i += 2) {
            if (!mob[i] || !mob[i + 1]) {
                break;
            }

            var xDiff = mob[i + 1].X() - mob[i].X();
            var yDiff = mob[i + 1].Y() - mob[i].Y();
            var mobRelativeDistance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
            var playerDistanceOne = mob[i].Distance();
            var playerDistanceTwo = mob[i + 1].Distance();
            var target = mob[0];
            var target2 = mob[1];

            if (mobRelativeDistance < 12 && playerDistanceOne < 12 && playerDistanceTwo < 12) {
                Orion.UseType('0x0E9D|0x0E9C|0x0EB2|0x0EB3');
                Orion.CharPrint(mob[i].Serial(), 1153, 'Inciting');
                Orion.CharPrint(mob[i + 1].Serial(), 1153, 'Onto');
                Orion.WaitTargetObject([mob[i].Serial(), mob[i + 1].Serial()]);
                Orion.UseSkill('22');
                Orion.Wait(100);
                Orion.Print("Ignoring " + mob[0].Name());
                Orion.AddIgnoreListObject('ProvoList', [target.Serial()]);
                Orion.Print("Ignoring " + mob[1].Name());
                Orion.AddIgnoreListObject('ProvoList', [target2.Serial()]);
                Orion.Wait(7500);
                if (Orion.Timer("ProvoTimer") >= 45000) {
                    Orion.Print("Clearing ignore list");
                    Orion.ClearIgnoreList('ProvoList');
                    Orion.RemoveTimer('ProvoTimer');
                }
                if (Orion.TimerExists('ProvoTimer') && Orion.Timer("ProvoTimer") <= 45000) {
                    // timer already exists
                } else {
                    Orion.SetTimer('ProvoTimer', 0);
                    Orion.AddDisplayTimer('1', 45000, 'RightTop', 'bar', 'Provoke Ignore List Reset', -85, 10, '0', '-1');
                }
            }
            Orion.Wait(1000);
        }
        Orion.Wait(100);
    }
}

// #flag: Disco nearest bard function, keeps ignore list and applies discordance
function discoNearest() {
    while (!Player.Dead() && isToggleOn('discoNearest')) {
        Orion.UseIgnoreList('DiscoList');
        var mobs = Orion.FindTypeEx(any, any, ground, 'mobile', 10, "red|gray|enemy").sort(function (a, b) {
            return Orion.GetDistance(a.Serial()) - Orion.GetDistance(b.Serial());
        });
        Orion.ResetIgnoreList();
        var target = mobs[0];
        if (target) {
            Orion.UseType('0x0E9D|0x0E9C|0x0EB2|0x0EB3');
            Orion.Print("Using Discordance on " + mobs[0].Name() + " " + mobs[0].Distance() + " tiles away");
            Orion.UseSkill('Discordance');
            Orion.WaitTargetObject([target.Serial()]);
            Orion.Wait(100);
            Orion.Print("Ignoring " + mobs[0].Name());
            Orion.AddIgnoreListObject('DiscoList', [target.Serial()]);
            Orion.Wait(7500);
        } else {
            Orion.Print("Clearing ignore list");
            Orion.ClearIgnoreList('DiscoList');
            Orion.Wait(10000);
        }
    }
}

// #flag: Bard mastery buff loop based on bardSkill Shared var
function BardBuff() {
    var bardSkill = Shared.GetVar('bardSkill');
    while (!Player.Dead() && isToggleOn('BardBuff')) {
        if (bardSkill == 'Peacemaking' && !Orion.BuffExists('perseverance') && Player.Mana() > 25) {
            Orion.Cast('Perseverance');
            Orion.Wait(5000);
        }
        if (bardSkill == 'Peacemaking' && !Orion.BuffExists('resilience') && Player.Mana() > 25) {
            Orion.Cast('Resilience');
            Orion.Wait(5000);
        }
        if (bardSkill == 'Provocation' && !Orion.BuffExists('inspire') && Player.Mana() > 25) {
            Orion.Cast('inspire');
            Orion.Wait(5000);
        }
        if (bardSkill == 'Provocation' && !Orion.BuffExists('invigorate') && Player.Mana() > 25) {
            Orion.Cast('invigorate');
            Orion.Wait(5000);
        }
        Orion.Wait(100);
    }
}

//--------------------------------------------------------------
// EXPLOSION POTIONS
//--------------------------------------------------------------

// #flag: Chain explosion potions at a fixed target until out
function ChainExplodePot(targetSerial) {
    var potionGraphic = 0x0F0D;
    var potionColor = 0x0000;
    var potionDistance = 10;
    var throwDelay = 500;

    Orion.Print(1191, "[ChainExplodePot] Script Started");
    while (true) {
        if (Orion.Count(potionGraphic, potionColor, 'self', potionDistance, true) <= 0) {
            Orion.Print('No more explosion potions');
            break;
        }

        var target = Orion.FindObject(targetSerial);

        if (!target || !target.Exists()) {
            Orion.Print('Target no longer exists');
            break;
        }

        if (target.Distance() <= potionDistance) {
            Orion.UseType(potionGraphic, potionColor);
            Orion.WaitForTarget(1000);
            Orion.TargetObject(target.Serial());
            Orion.Print('Threw potion at: ' + target.Name());
        } else {
            Orion.Print('Target out of range');
        }

        Orion.Wait(throwDelay);
    }
}

// #flag: Chain explosion potions at targeted enemy, prompting for target
function ChainExplodePotNoTarg() {
    var potionGraphic = 0x0F0D;
    var potionColor = 0x0000;
    var potionDistance = 10;
    var throwDelay = 1200;

    Orion.Print(1191, "[ChainExplodePot] Script Started");
    Orion.Print("Please target your enemy");

    Orion.WaitForAddObject('explodetarget');

    var target = Orion.FindObject('explodetarget');
    if (!target || !Orion.ObjectExists(target.Serial())) {
        Orion.Print("No valid target selected");
        return;
    }

    while (true) {
        if (Orion.Count(potionGraphic, potionColor, 'self', potionDistance, true) <= 0) {
            Orion.Print('No more explosion potions');
            break;
        }

        if (!Orion.ObjectExists(target.Serial())) {
            Orion.Print('Target no longer exists');
            break;
        }

        if (target.Distance() <= potionDistance) {
            Orion.UseType(potionGraphic, potionColor);
            Orion.WaitForTarget(1000);
            Orion.TargetObject(target.Serial());
            Orion.Print('Threw potion at: ' + target.Name());
        } else {
            Orion.Print('Target out of range');
        }
        Orion.Wait(throwDelay);
    }
}

//--------------------------------------------------------------
// MAGE CROSS HEAL
//--------------------------------------------------------------

// #flag: Magery based cross heal and cure function for party members
function CrossHeal() {
    if (Orion.SkillValue("Magery") < 7500) {
        Orion.Print(1191, "[CrossHeal] Script Started");
        while (!Player.Dead()) {
            Orion.Wait(100);

            if (Player.Poisoned() && Player.Hits('%') < 80) {
                Orion.Cast('Cure');
                while (Player.Frozen()) {
                    Orion.Wait(100);
                }
                Orion.WaitTargetObject(Player.Serial());
                Orion.Wait(1500);
                continue;
            } else if (Player.Hits('%') < 80) {
                Orion.Cast('Greater Heal');
                while (Player.Frozen()) {
                    Orion.Wait(100);
                }
                Orion.WaitForTarget(2000);
                Orion.WaitTargetObject(Player.Serial());
                Orion.Wait(1500);
                continue;
            }

            var friends = Orion.FindTypeEx(-1, -1, 'ground', 'human|inlos|live', 10, 'green|blue');
            for (var i = 0; i < friends.length; i++) {
                var friendSerial = friends[i].Serial();
                if (friendSerial === Player.Serial())
                    continue;

                var friend = Orion.FindObject(friendSerial);
                if (!friend || Orion.GetDistance(friendSerial) > 10)
                    continue;

                Orion.ShowStatusbar(friendSerial, 550, 200);
                Orion.Wait(50);
                Orion.GetStatus(friendSerial);
                Orion.Wait(50);

                if (friend.Poisoned() && friend.Hits('%') < 80) {
                    Orion.Cast('Cure');
                    while (Player.Frozen()) {
                        Orion.Wait(100);
                    }
                    Orion.WaitTargetObject(friendSerial);
                    Orion.Wait(1500);
                } else if (friend.Hits('%') < 80) {
                    Orion.Cast('Greater Heal');
                    while (Player.Frozen()) {
                        Orion.Wait(100);
                    }
                    Orion.WaitForTarget(2000);
                    Orion.WaitTargetObject(friendSerial);
                    Orion.Wait(1500);
                }
            }
            Orion.Wait(500);
            Orion.CloseStatusbar('all');
            Orion.Wait(300);
        }
    }
}

//--------------------------------------------------------------
// TARGET SCROLLING HELPERS
//--------------------------------------------------------------

// #flag: Scroll next hostile target (red/gray/criminal) and highlight
function SelectTargetScrolling(forward) {
    var lastInd, lastDist, highVal;

    if (Orion.GetGlobal("forward") != String(forward)) {
        Orion.SetGlobal("forward", String(forward));
        Orion.IgnoreReset();
        Orion.Ignore(Orion.ClientLastTarget());
    }

    for (var i = 0; i < 2; i++) {
        var mobArr = Orion.FindType("!0x00A4|!0x033D|!0x023E|!0x02B4 |!0x0033|!0x002F ", "-1", ground, "live", 18, "red|gray|criminal");

        if (mobArr.length) {
            forward ? (highVal = 18, lastDist = 0) : (highVal = 0, lastDist = 18);

            Orion.GetGlobal("lastDist") == "" ? lastDist = lastDist : lastDist = Number(Orion.GetGlobal("lastDist"));

            for (var ii = 0; ii < mobArr.length; ii++) {
                var dist = Orion.GetDistance(mobArr[ii]);

                if (forward && dist <= highVal && dist >= lastDist) {
                    highVal = dist;
                    lastInd = ii;
                } else if (!forward && dist >= highVal && dist <= lastDist) {
                    highVal = dist;
                    lastInd = ii;
                }
            }

            if (lastInd != undefined) {
                Orion.SetGlobal("lastDist", highVal);
                Orion.RemoveHighlightCharacter(Orion.GetGlobal("LTHighlight"), true);
                Orion.ClientLastTarget(mobArr[lastInd]);
                Orion.TargetSystemSerial(mobArr[lastInd]);
                var currtar = Orion.FindObject(mobArr[lastInd]);
                Orion.ClientLastTarget(mobArr[lastInd]);
                Orion.CharPrint(Player.Serial(), '48', "Target:[" + currtar.Name() + "]");
                Orion.SetGlobal("LTHighlight", mobArr[lastInd]);
                Orion.AddHighlightCharacter(mobArr[lastInd], '1152', true);
                Orion.AddDisplayTimer(101, 30000, 'Top', 'Rectangle|Bar', currtar.Name(), 0, 0, '0xFFFF', 4, 'green');
                Orion.Ignore(mobArr[lastInd]);
                return;
            }
        }

        if ((!mobArr.length && i == 0) || lastInd == undefined) {
            Orion.SetGlobal("lastDist", "");
            Orion.IgnoreReset();
        }
    }

    Orion.Print("No enemies");
}

// #flag: Scroll next hostile target with blue highlight style
function SelectTargetScrollingBlue(forward) {
    var lastInd, lastDist, highVal;

    if (Orion.GetGlobal("forward") != String(forward)) {
        Orion.SetGlobal("forward", String(forward));
        Orion.IgnoreReset();
        Orion.Ignore(Orion.ClientLastTarget());
    }

    for (var i = 0; i < 2; i++) {
        var mobArr = Orion.FindType("!0x00A4|!0x033D|!0x023E|!0x02B4 |!0x0033|!0x002F ", "-1", ground, "live|ignoreself|ignorefriends|near", 10, "gray|criminal|red|enemy");

        if (mobArr.length) {
            forward ? (highVal = 18, lastDist = 0) : (highVal = 0, lastDist = 18);

            Orion.GetGlobal("lastDist") == "" ? lastDist = lastDist : lastDist = Number(Orion.GetGlobal("lastDist"));

            for (var ii = 0; ii < mobArr.length; ii++) {
                var dist = Orion.GetDistance(mobArr[ii]);

                if (forward && dist <= highVal && dist >= lastDist) {
                    highVal = dist;
                    lastInd = ii;
                } else if (!forward && dist >= highVal && dist <= lastDist) {
                    highVal = dist;
                    lastInd = ii;
                }
            }

            if (lastInd != undefined) {
                Orion.SetGlobal("lastDist", highVal);
                Orion.RemoveHighlightCharacter(Orion.GetGlobal("LTHighlight"), true);
                Orion.ClientLastTarget(mobArr[lastInd]);
                Orion.TargetSystemSerial(mobArr[lastInd]);
                var currtar = Orion.FindObject(mobArr[lastInd]);
                Orion.ClientLastTarget(mobArr[lastInd]);
                Orion.CharPrint(Player.Serial(), '2119', "Target:[" + currtar.Name() + "]");
                Orion.SetGlobal("LTHighlight", mobArr[lastInd]);
                Orion.AddHighlightCharacter(mobArr[lastInd], '0x27AF', true);
                Orion.AddDisplayTimer(101, 30000, 'Top', 'Rectangle|Bar', currtar.Name(), 0, 0, '0xFFFF', 4, 'green');
                Orion.Ignore(mobArr[lastInd]);
                return;
            }
        }

        if ((!mobArr.length && i == 0) || lastInd == undefined) {
            Orion.SetGlobal("lastDist", "");
            Orion.IgnoreReset();
        }
    }

    Orion.Print("No enemies");
}

//--------------------------------------------------------------
// MOVEMENT AND TARGETING HELPERS
//--------------------------------------------------------------

// #flag: Path to target, attack, walk in, ignore unreachable and update GUI
function GoToAndAttackTarget(target) {
    if (!target || !Orion.ObjectExists(target.Serial())) {
        Orion.PrintFast(Player.Serial(), 33, 0, "Target does not exist");
        return false;
    }

    var targetSerial = target.Serial();
    Orion.PrintFast(targetSerial, 33, 0, "***Target***");
    Orion.ShowStatusbar(targetSerial, 550, 100);
    Orion.GetStatus(targetSerial);
    UpdateAttackStatus(target);

    var pathArray = Orion.GetPathArray(target.X(), target.Y(), target.Z(), 1, 10);
    if (target.Distance() > 1 && pathArray.length === 0) {
        Orion.PrintFast(Player.Serial(), 33, 0, "Target is unreachable. Adding to ignore list");
        Orion.AddIgnoreList("AutoTargetIgnore", targetSerial);
        return false;
    }

    if (pathArray.length < 15) {
        while (Orion.ObjectExists(targetSerial)) {
            Orion.AddHighlightCharacter(targetSerial, 0x0AC3, true);
            Orion.WalkTo(target.X(), target.Y(), target.Z(), 1, 0, 1);
            Orion.Attack(targetSerial);
            Orion.Wait(100);
        }
    }

    Orion.ClearHighlightCharacters();
    Orion.AddIgnoreList("AutoTargetIgnore", targetSerial);
    Orion.CloseStatusbar('all');
    return true;
}

// #flag: Helper to print current attack target name to GUI and overhead
function UpdateAttackStatus(target) {
    Orion.PrintFast(Player.Serial(), 49, 0, "Attacking: " + target.Name());
    UpdateGUIStatus("Attacking: " + target.Name());
    Orion.SetGlobal("lastTarget", target.Serial());
}

// #flag: Find enemies near player using pathing friendly flags
function FindEnemies() {
    var searchRadius = 10;
    return Orion.FindTypeEx(targetGraphics, 'any', 'ground', 'ignoreself|ignorefriends|live|near|inlos', searchRadius, "gray|criminal|enemy|red", ' ', 'AutoTargetIgnore');
}

//--------------------------------------------------------------
// CORPSE AND INVENTORY HELPERS
//--------------------------------------------------------------

// #flag: Walk to and open corpses that match player name
function LootMyCorpses() {
    var strPlayerName = Player.Name().toLowerCase();
    var expectedTag = "a corpse of " + strPlayerName;

    var corpses = Orion.FindTypeEx('0x2006|0x0ECB', -1, 'ground', 'item', 10);

    if (!corpses || corpses.length === 0) {
        Orion.SayParty("No corpses found nearby");
        return;
    }

    for (var i = 0; i < corpses.length; i++) {
        var serial = corpses[i].Serial();
        var corpse = Orion.FindObject(serial);
        if (!corpse) continue;

        var tooltip = corpse.Properties();
        if (tooltip && tooltip.toLowerCase().indexOf(expectedTag) !== -1) {
            Orion.WalkTo(corpse.X(), corpse.Y(), corpse.Z(), 1, 255, 1);
            Orion.Wait(600);
            Orion.UseObject(serial);
            Orion.Wait(1250);
        }
    }
}

// #flag: Auto Seed of Life usage when HP below threshold
function autoSeed() {
    Orion.Print(1191, "[Auto Seed] Script Started");
    while (true) {
        if (Player.Hits() < seedhits && !Player.Dead() && Orion.Count('0x1727') > 0) {
            if (Orion.Timer("SeedTimer") >= -1 && !Orion.HaveTarget()) {
                Orion.UseType('0x1727');
                if (Orion.InJournal('bitter seed instantly', 'my')) {
                    Orion.SetTimer("SeedTimer", -600000);
                    Orion.ClearJournal();
                }
            }
            Orion.Wait(1000);
        }
        Orion.Wait(500);
    }
}

// #flag: Auto Mana Draught usage when mana falls below threshold
function autoDraught() {
    Orion.Print(1191, "[Auto Draught] Script Started");

    var draughtGraphic = 0x0FFB;
    var draughtColor = 0x0128;
    var manaThreshold = 15;

    while (true) {
        if (Player.Mana() < manaThreshold && !Player.Dead() && Orion.Count(draughtGraphic, draughtColor) > 0) {
            if (Orion.Timer("DraughtTimer") >= -1 && !Orion.HaveTarget()) {
                Orion.UseType(draughtGraphic, draughtColor);
                Orion.SetTimer("DraughtTimer", -60000);
            }
            Orion.Wait(1000);
        }
        Orion.Wait(500);
    }
}

// #flag: Mount ethereal if not mounted using configured mountID
function autoMount(_internal) {
    if (Orion.ObjAtLayer('Mount') !== null) {
        UpdateGUIStatus('Already mounted');
        return;
    }

    var etherealMount = Orion.FindType(mountID, any, 'backpack');

    if (etherealMount.length > 0) {
        Orion.UseObject(etherealMount[0]);
        UpdateGUIStatus('Mounting ethereal');
        while (Player.Frozen()) {
            Orion.Wait(1000);
        }
    } else {
        UpdateGUIStatus('No ethereal mount found in backpack');
    }
}

// #flag: Swap waist item off and back on at full HP to refresh special properties
function swapWaist() {
    Orion.ClearJournal();

    while (!Player.Dead()) {
        if (Player.Hits() === Player.MaxHits()) {
            var waistItem = Orion.ObjAtLayer("Waist");
            if (waistItem) {
                var serial = waistItem.Serial();

                Orion.Unequip("Waist");
                Orion.Wait(500);

                var equipped = false;
                var attempts = 0;

                while (!equipped && attempts < 10) {
                    Orion.ClearJournal();
                    Orion.Equip(serial);
                    Orion.Wait(800);

                    if (Orion.InJournal("You must wait to perform another action")) {
                        Orion.Wait(500);
                        attempts++;
                        continue;
                    }

                    Orion.Wait(1000);

                    if (Orion.ObjAtLayer("Waist")) {
                        equipped = true;
                        break;
                    }

                    Orion.Wait(500);
                    attempts++;
                }

                if (!equipped) {
                    Orion.Print("Failed to re-equip waist after multiple attempts");
                }
            }
        }
        Orion.Wait(500);
    }

    Orion.Print("Player has died. Stopping waist-swap loop");
}

//--------------------------------------------------------------
// BAD LOCATION TABLE
//--------------------------------------------------------------

// #flag: Predefined bad locations for pathfinding avoidance
var badLocations = [
    { x: 535, y: 991 }, { x: 1409, y: 3824 }, { x: 1414, y: 3828 }, { x: 1419, y: 3832 }, { x: 4449, y: 1115 }, { x: 4442, y: 1122 },
    { x: 1960, y: 2755 }, { x: 1591, y: 1679 }, { x: 3544, y: 1173 }, { x: 3545, y: 1169 }, { x: 3550, y: 1169 }
];
