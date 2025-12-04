// ====================================================================================================================
// CHARACTER ASSISTANT (CA)
// Advanced Combat & Utility Automation Suite
// Created By: LavaLynk
// Version 4.02 – Shared Toggle Edition
// ====================================================================================================================
//
// Overview:
// The Character Assistant provides a complete modular automation suite for
// combat, healing, targeting, buffs, defensive abilities, pet commands, 
// bard skills, consumables, looting, movement, and GUI control.
//
// All features are controlled using Shared Variables (0 = Off, 1 = On).  
// Every automation script checks its Shared Variable continuously and stops
// immediately when toggled off. This prevents stuck loops and ensures
// consistent performance.
//
// Core Features:
//   • Full Character Assistant GUI (Sampire, Thrower, Misc, Bard, Tamer).
//   • Optional compact status-bar GUI.
//   • Auto-attack systems (Sampire AI, Thrower logic, GoToAndAttackTarget).
//   • Auto buffs: Consecrate, Enemy of One, Vamp Form, Wraith Form.
//   • Defensive automations: Counter Attack, Confidence, Evade.
//   • Auto-bandage system with weighted healing logic.
//   • Bard automation (Peace, Provo, Disco, Mastery buffs).
//   • Pet support (All Kill, follow logic).
//   • Consumable automation (Heal/Cure/Str/Dex pots, Apples, Mana Draught).
//   • Auto mount, corpse looting, death watcher, form cleanup.
//   • Party creation / disbanding helpers.
//   • Target scrolling + enemy highlighting.
//   • Inventory, restock, and container helpers.
//   • Complete Shared Variable reset system used during Autostart.
//
// Design:
// Structured for modularity, high stability, and fast toggle-based control.
// ====================================================================================================================

// ====================================================================================================================
// INCLUDES
// ====================================================================================================================
//#include OA/Modules/Durability.js
//#include OA/Modules/Looter.oajs
//#include OA/Modules/GUI.js

// ====================================================================================================================
// GLOBAL CONFIGURATION
// Centralized settings for GUI colors, targeting, debugging,
// item graphics, and combat filters.
// ====================================================================================================================

//--------------------------------------------------
// GUI Color Palette
//--------------------------------------------------
var HUE_FRAME        = 1905;   // Main frame hue
var HUE_STATUS_LABEL = 902;    // Dark gray "Status:" label
var HUE_STATUS_TEXT  = 945;    // Lighter gray status text
var HUE_LABEL_OFF    = 902;    // Dim label hue when toggle off
var HUE_LABEL_ON     = 945;    // Bright label hue when toggle on

// Legacy compatibility (same as HUE_FRAME)
var color = HUE_FRAME;

//--------------------------------------------------
// Mounts & Survival
//--------------------------------------------------
var mountID  = '0x2D9C|0x20F6';   // Ethereal mount graphics
var seedhits = 40;                // HP threshold for Seed of Life

//--------------------------------------------------
// Summoned Creature Names (lowercase match list)
// Used in AutoSampire and AutoAttack skipping logic
//--------------------------------------------------
var summonedNames = [
    "nature's fury",
    "energy vortex",
    "blade spirit",
    "revenant",
    "skeletal mage",
    "bone mage",
    "lich lord"
];

//--------------------------------------------------
// Target Selection Settings
//--------------------------------------------------
var targetGraphics = '!0x0136|!0x00A4|!0x033D|!0x023E|!0x02B4|!0x002F';  // Valid enemy mobiles
var targetFlags    = 'ignoreself|ignorefriends|live|inlos|near';         // Scan filters
var targetRange    = 10;                                                 // Default enemy search radius
var targetNoto     = 'gray|criminal|red|enemy|orange';                   // Allowed notorieties

//--------------------------------------------------
// Player Graphics (for healing & party scans)
//--------------------------------------------------
var playerGraphics = '0x0190|0x0191|0x0192|0x0193|0x00B7|0x00BA|0x025D|0x025E|0x025F|0x0260|0x029A|0x029B|0x02B6|0x02B7|0x03DB|0x03DF|0x03E2|0x02EB|0x02EC|0x02ED|0x02C1|0x011D';

//--------------------------------------------------
// Item Graphics (Runebooks / Atlases)
//--------------------------------------------------
var RUNIC_ATLAS_GRAPHIC = '0x9C16';
var RUNEBOOK_GRAPHIC    = '0x22C5';

//--------------------------------------------------
// Fonts & Debugging
//--------------------------------------------------
var fontCode       = 1;       // Default font for text overlays
var DEBUG_SAMPIRE  = false;   // Debug toggles for Sampire AI
var DEBUG_THROWER  = false;   // Debug toggles for Thrower AI

// ====================================================================================================================
// Function: ClearCharacterAssistantShared
// Purpose:  Reset ALL Character Assistant Shared variables, toggles, GUI globals, and stop critical background scripts.
// Params:   None
// ====================================================================================================================
function ClearCharacterAssistantShared()
{
    // --------------------------------------------------------------------------------------
    // 1. Master toggle bit-flags (0 = OFF, 1 = ON)
    //    Every automation script MUST appear here or CA cannot clean restart correctly.
    // --------------------------------------------------------------------------------------
    var bitToggles = [
        // Core combat
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
        'AutoSampire',

        // Defensive + utility
        'autoConfidence',
        'autoEvade',
        'auto_CrossHealBandage',
        'HidePlayers',
        'CrossHeal',

        // Pet / Tamer
        'allKillNear',

        // Potions & consumables
        'autoHealCure',
        'autoDrinkDexStr',
        'autoApple',
        'autoSeed',
        'autoDraught',
        'autoBox',

        // Explosion potions
        'ChainExplodePotNoTarg',

        // Bard
        'BardBuff',
        'AutoProvo',
        'AreaPeace',
        'discoNearest',

        // Follower logic
        'FollowMaster',

        // Selector GUI
        'selector',

        // Death monitor
        'deathCheck'
    ];

    // Set all toggle bits to OFF
    for (var i = 0; i < bitToggles.length; i++)
        setToggle(bitToggles[i], 0);


    // --------------------------------------------------------------------------------------
    // 2. Reset all Shared string/bool variables
    // --------------------------------------------------------------------------------------
    Shared.AddVar('selector', 0);             // main GUI selector
    Shared.AddVar('autoWalk', 'False');       // ranged auto-walking
    Shared.AddVar('useLootCorpses', 'False'); // auto-loot
    Shared.AddVar('useMoveToCorpses', 'False');
    Shared.AddVar('masterSerial', '');        // follow/follower logic reference
    Shared.AddVar('gui_status', '');          // lower-right status text
    Shared.AddVar('gui_phase', '');           // left-side PHASE text
    Shared.AddVar('bardSkill', '');           // bard mastery dropdown mode


    // --------------------------------------------------------------------------------------
    // 3. Reset Orion globals so GUI displays correctly
    // --------------------------------------------------------------------------------------
    Orion.SetGlobal('gui_status', 'Ready!');
    Orion.SetGlobal('gui_phase', 'Status');

    // These are used by target scrolling
    Orion.SetGlobal("LTHighlight", "");
    Orion.SetGlobal("lastDist", "");
    Orion.SetGlobal("forward", "");


    // --------------------------------------------------------------------------------------
    // 4. Terminate scripts that MUST NOT continue past a reset
    // --------------------------------------------------------------------------------------
    if (Orion.ScriptRunning('deathCheck'))
        Orion.Terminate('deathCheck');

    if (Orion.ScriptRunning('AutoRearm'))
        Orion.Terminate('AutoRearm');

    if (Orion.ScriptRunning('keepActive'))
        Orion.Terminate('keepActive');


    // --------------------------------------------------------------------------------------
    // 5. GUI cleanup & feedback
    // --------------------------------------------------------------------------------------
    Orion.Print(1900, "[Character Assistant] Shared variables cleared");
}


// ====================================================================================================================
// Function: Autostart
// Purpose:  Initialize Character Assistant on login: reset variables, load GUI, and start core monitors.
// Params:   None
// ====================================================================================================================
function Autostart() {
    ClearCharacterAssistantShared();
   	UpdateGUIPhase("Status")    
    Orion.Wait(100);

    if (!Orion.ScriptRunning('checkDurability')) {
        Orion.ToggleScript('checkDurability');
    }
    if (!Orion.ScriptRunning('deathCheck')) {
        setToggle('deathCheck', 1);
        Orion.ToggleScript('deathCheck');
    }

    Shared.AddVar('autoWalk', 'False');

    if (!Orion.ScriptRunning('InsureDrops')) {
        Orion.ToggleScript('InsureDrops');
    }
    Orion.Wait(1250);
    Orion.UseObject(backpack);
    Orion.Wait(1250);
    GUI_SELECTOR();	
}

// ====================================================================================================================
// Function: GetRace
// Purpose:  Return correct race tile ID for GUI portrait display.
// Params:   None
// ====================================================================================================================
function GetRace() {
    var race = Player.Race();
    if (race == 1 || race == 2) {
        return 0x9F1F;
    } else if (race == 3) {
        return 0x9F21;
    }
    return 0;
}

// ====================================================================================================================
// Function: GetRaceX
// Purpose:  Get horizontal offset for race tile so it appears centered.
// Params:   None
// ====================================================================================================================
function GetRaceX() {
    var race = Player.Race();
    if (race == 1 || race == 2) {
        return 185;
    } else if (race == 3) {
        return 165;
    }
    return 0;
}

// ====================================================================================================================
// Function: GUI_SELECTOR
// Purpose:  Render the main collapsed Character Assistant selector menu.
// Params:   None
// ====================================================================================================================
function GUI_SELECTOR() {
    Orion.Wait(100);
    Shared.AddVar('selector', 0);
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
    g.AddButton(1015, 25, 45, '0x15AB', '0x15AB', '0x15AB', '1900');
    g.AddTooltip('Sampire Menu');

    // Center: Thrower / Archer
    g.AddButton(1016, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15D5', '0x15D5', '0x15D5', '1900');
    g.AddTooltip('Thrower / Archer Menu');

    // Right: Misc
    g.AddButton(1018, totalWidth - buttonWidth - 25, 45, '0x15CD', '0x15CD', '0x15CD', '1900');
    g.AddTooltip('Miscellaneous Menu');

	g.AddButton(10000, 7, 65, '0x15A1','0x15A2','0x15A3','905') //left arrow			
	g.AddButton(10002, 256, 65,'0x15A4','0x15A5','0x15A6','905') // right arrow			
		
    var guiWidth = width * cellSize;
    var text = "Character Assistant";
    var centeredX = CalculateCenteredX(guiWidth, text, 6);
    
	g.AddButton(300000, 60, 10, '0x1401', '0x1401', '0x1401', '1900 ')
	g.AddButton(300001, 50, 10, '0x1400', '0x1400', '0x1400', '1900 ')
	g.AddButton(300002, 218, 10, '0x1402', '0x1402', '0x1402', '1900')		
			
	g.AddButton(300003, 60, 20, '0x1407', '0x1407', '0x1407', '1900')		
	g.AddButton(300004, 50, 20, '0x1406', '0x1406', '0x1406', '1900')
	g.AddButton(300005, 218, 20, '0x1408', '0x1408', '0x1408', '1900')		    
 
    g.AddText(centeredX, 10, 1152, text, 0);    

	g.AddText(25, (height-1) * 37, HUE_STATUS_LABEL, Orion.GetGlobal('gui_phase'))
	g.AddText(75, (height-1) * 37, HUE_STATUS_TEXT,Orion.GetGlobal('gui_status'));	

    // Event / Bot menus
    g.AddButton(868686, 35, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.AddButton(868687, 235, 14, '0x2716', '0x2716', '0x2716', '1900');

    g.Update();
}

// ====================================================================================================================
// Function: GUI_SELECTOR2
// Purpose:  Render page 2 of the Character Assistant selector (Tamer/Bard/Misc).
// Params:   None
// ====================================================================================================================
function GUI_SELECTOR2(){
	Orion.Wait(100)
    Shared.AddVar('selector', 5);	
	var g = Orion.CreateCustomGump(101099);
	g.Clear();
	g.SetCallback('OnClick');
	const width = 8;
	const cellSize = 35;
	const height = 4;
	const color = 2769;
	const totalWidth = width * cellSize; // 280px
	const buttonWidth = 60; // Button size based on image	
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
  
		//g.AddCheckerTrans(0, 0, x*35, y*35);		     
		// Left-aligned (Sampire Menu)
		g.AddButton(3000, 25, 45, '0x15AD', '0x15AD', '0x15AD', '1900');
		g.AddTooltip('Tamer Menu');
		
		// Center-aligned (Thrower/Archer Menu)
		g.AddButton(3001, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15B1', '0x15B1', '0x15B1', '1900');
		g.AddTooltip('Bard Menu');
		
		// Right-aligned (Miscellaneous Menu)
		g.AddButton(3002, totalWidth - buttonWidth - 25, 45, '0x15A9', '0x15A9', '0x15A9', '1900');
		g.AddTooltip('Miscellaneous Menu');
		
		g.AddButton(10001, 7, 65, '0x15A1','0x15A2','0x15A3','905') //left arrow			
		g.AddButton(10003, 256, 65,'0x15A4','0x15A5','0x15A6','905') // right arrow			
			
	    var guiWidth = width * cellSize;
	    var text = "Character Assistant";
	    var centeredX = CalculateCenteredX(guiWidth, text, 6);
	    
		g.AddButton(300000, 60, 10, '0x1401', '0x1401', '0x1401', '1900 ')
		g.AddButton(300001, 50, 10, '0x1400', '0x1400', '0x1400', '1900 ')
		g.AddButton(300002, 218, 10, '0x1402', '0x1402', '0x1402', '1900')		
				
		g.AddButton(300003, 60, 20, '0x1407', '0x1407', '0x1407', '1900')		
		g.AddButton(300004, 50, 20, '0x1406', '0x1406', '0x1406', '1900')
		g.AddButton(300005, 218, 20, '0x1408', '0x1408', '0x1408', '1900')		    
	 
	    g.AddText(centeredX, 10, 1152, text, 0);    
	
		g.AddText(25, (height-1) * 37, HUE_STATUS_LABEL, Orion.GetGlobal('gui_phase'))
		g.AddText(75, (height-1) * 37, HUE_STATUS_TEXT,Orion.GetGlobal('gui_status'));	
	
	    var guiWidth = width * cellSize;
	    var text = "Character Assistant";
	    var averageCharWidth = 6; // Adjust this value based on your font and size
	    var centeredX = CalculateCenteredX(guiWidth, text, averageCharWidth);
	    g.AddText(centeredX, 10, 1152, text, 0);
		
	    g.AddButton(868686, 35, 14, '0x2716', '0x2716', '0x2716', '1900');
	    g.AddButton(868687, 235, 14, '0x2716', '0x2716', '0x2716', '1900');

		
		g.Update()
}

// ====================================================================================================================
// Function: GUI_COMPACT
// Purpose:  Render compact version of Character Assistant with only title + status.
// Params:   None
// ====================================================================================================================
function GUI_COMPACT() {
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
	
	
	g.AddButton(300000, 60, 10, '0x1401', '0x1401', '0x1401', '1900 ')
	g.AddButton(300001, 50, 10, '0x1400', '0x1400', '0x1400', '1900 ')
	g.AddButton(300002, 218, 10, '0x1402', '0x1402', '0x1402', '1900')		
			
	g.AddButton(300003, 60, 20, '0x1407', '0x1407', '0x1407', '1900')		
	g.AddButton(300004, 50, 20, '0x1406', '0x1406', '0x1406', '1900')
	g.AddButton(300005, 218, 20, '0x1408', '0x1408', '0x1408', '1900')	
	      
    g.AddText(centeredX, 10, 1152, text, 0);    

	g.AddText(25, (height-1) * 37, HUE_STATUS_LABEL, Orion.GetGlobal('gui_phase'))
	g.AddText(75, (height-1) * 37, HUE_STATUS_TEXT,Orion.GetGlobal('gui_status'));	
    
    g.AddButton(868686, 35, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.AddButton(868687, 235, 14, '0x2716', '0x2716', '0x2716', '1900');
    
    g.Update();
}

// ====================================================================================================================
// Function: GUI_SAMPIRE
// Purpose:  Render the full Sampire menu (attacks, buffs, looting).
// Params:   None
// ====================================================================================================================
function GUI_SAMPIRE() {
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

    g.AddButton(1017, 25, 45, '0x15AC', '0x15AC', '0x15AC', '1159');
    g.AddTooltip('Collapse Menu');

    g.AddButton(1016, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15D5', '0x15D5', '0x15D5', '1900');
    g.AddTooltip('Thrower / Archer Menu');

    g.AddButton(1018, totalWidth - buttonWidth - 25, 45, '0x15CD', '0x15CD', '0x15CD', '1900');
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

	g.AddButton(10000, 7, 65, '0x15A1','0x15A2','0x15A3','905') //left arrow			
	g.AddButton(10002, 256, 65,'0x15A4','0x15A5','0x15A6','905') // right arrow			
		
    var guiWidth = width * cellSize;
    var text = "Sampire Menu";
    var centeredX = CalculateCenteredX(guiWidth, text, 6);
    
	g.AddButton(300000, 60, 10, '0x1401', '0x1401', '0x1401', '1900 ')
	g.AddButton(300001, 50, 10, '0x1400', '0x1400', '0x1400', '1900 ')
	g.AddButton(300002, 218, 10, '0x1402', '0x1402', '0x1402', '1900')		
			
	g.AddButton(300003, 60, 20, '0x1407', '0x1407', '0x1407', '1900')		
	g.AddButton(300004, 50, 20, '0x1406', '0x1406', '0x1406', '1900')
	g.AddButton(300005, 218, 20, '0x1408', '0x1408', '0x1408', '1900')		    
 
    g.AddText(centeredX-5, 10, 1152, text, 0);    

	g.AddText(25, (height-1) * 35, HUE_STATUS_LABEL, Orion.GetGlobal('gui_phase'))
	g.AddText(75, (height-1) * 35, HUE_STATUS_TEXT,Orion.GetGlobal('gui_status'));	

    // Event / Bot menus
    g.AddButton(868686, 35, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.AddButton(868687, 235, 14, '0x2716', '0x2716', '0x2716', '1900');

    g.Update();
}

// ====================================================================================================================
// Function: GUI_THROWER
// Purpose:  Render Thrower/Archer menu (chivalry, attack toggles, walk options).
// Params:   None
// ====================================================================================================================
function GUI_THROWER() {
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

    g.AddButton(1015, 25, 45, '0x15AB', '0x15AB', '0x15AB', '1900');
    g.AddTooltip('Sampire Menu');

    g.AddButton(1017, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15D6', '0x15D6', '0x15D6', '1159');
    g.AddTooltip('Collapse Menu');

    g.AddButton(1018, totalWidth - buttonWidth - 25, 45, '0x15CD', '0x15CD', '0x15CD', '1900');
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

	g.AddButton(10000, 7, 65, '0x15A1','0x15A2','0x15A3','905') 	
	g.AddButton(10002, 256, 65,'0x15A4','0x15A5','0x15A6','905') 	
		
    var guiWidth = width * cellSize;
    var text = "Thrower/Archer Menu";
    var centeredX = CalculateCenteredX(guiWidth, text, 6);
    
	g.AddButton(300000, 60, 10, '0x1401', '0x1401', '0x1401', '1900 ')
	g.AddButton(300001, 50, 10, '0x1400', '0x1400', '0x1400', '1900 ')
	g.AddButton(300002, 218, 10, '0x1402', '0x1402', '0x1402', '1900')		
			
	g.AddButton(300003, 60, 20, '0x1407', '0x1407', '0x1407', '1900')		
	g.AddButton(300004, 50, 20, '0x1406', '0x1406', '0x1406', '1900')
	g.AddButton(300005, 218, 20, '0x1408', '0x1408', '0x1408', '1900')		    
 
    g.AddText(centeredX-10, 10, 1152, text, 0);    

	g.AddText(25, (height-1) * 35, HUE_STATUS_LABEL, Orion.GetGlobal('gui_phase'))
	g.AddText(75, (height-1) * 35, HUE_STATUS_TEXT,Orion.GetGlobal('gui_status'));	

    g.AddButton(868686, 35, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.AddButton(868687, 235, 14, '0x2716', '0x2716', '0x2716', '1900');

    g.Update();
}

// ====================================================================================================================
// Function: GUI_MISC
// Purpose:  Render miscellaneous utility menu (special moves, defensive toggles).
// Params:   None
// ====================================================================================================================
function GUI_MISC() {
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

    g.AddButton(1015, 25, 45, '0x15AB', '0x15AB', '0x15AB', '1900');
    g.AddTooltip('Sampire Menu');

    g.AddButton(1016, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15D5', '0x15D5', '0x15D5', '1900');
    g.AddTooltip('Thrower / Archer Menu');

    g.AddButton(1017, totalWidth - buttonWidth - 25, 45, '0x15CE', '0x15CE', '0x15CE', '1159');
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

	g.AddButton(10000, 7, 65, '0x15A1','0x15A2','0x15A3','905') 	
	g.AddButton(10002, 256, 65,'0x15A4','0x15A5','0x15A6','905')	
		
    var guiWidth = width * cellSize;
    var text = "Miscallaneous Menu";
    var centeredX = CalculateCenteredX(guiWidth, text, 6);
    
	g.AddButton(300000, 60, 10, '0x1401', '0x1401', '0x1401', '1900 ')
	g.AddButton(300001, 50, 10, '0x1400', '0x1400', '0x1400', '1900 ')
	g.AddButton(300002, 218, 10, '0x1402', '0x1402', '0x1402', '1900')		
			
	g.AddButton(300003, 60, 20, '0x1407', '0x1407', '0x1407', '1900')		
	g.AddButton(300004, 50, 20, '0x1406', '0x1406', '0x1406', '1900')
	g.AddButton(300005, 218, 20, '0x1408', '0x1408', '0x1408', '1900')		    
 
    g.AddText(centeredX-4, 10, 1152, text, 0);    

	g.AddText(25, (height-1) * 35, HUE_STATUS_LABEL, Orion.GetGlobal('gui_phase'))
	g.AddText(75, (height-1) * 35, HUE_STATUS_TEXT,Orion.GetGlobal('gui_status'));	

    g.AddButton(868686, 35, 14, '0x2716', '0x2716', '0x2716', '1900');
    g.AddButton(868687, 235, 14, '0x2716', '0x2716', '0x2716', '1900');
    
	g.AddTilePic(GetRaceX(), 230, GetRace(), "0x0000", 5002, '1900')
	g.AddTooltip("Collect your corpses!")
    g.Update();
}

// ====================================================================================================================
// Function: GUI_TAMER
// Purpose:  Render Tamer/Mage menu (all-kill, cross-heal, misc mage options).
// Params:   None
// ====================================================================================================================
function GUI_TAMER(){
	Shared.AddVar('selector', 6)
	Orion.Wait(100)
	var g = Orion.CreateCustomGump(101099);
	g.Clear();
	g.SetCallback('OnClick');
	const width = 8;
	const cellSize = 35;
	const height = 12;
	const color = 2769;
	const totalWidth = width * cellSize; // 280px
	const buttonWidth = 60; // Button size based on image	
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
  
		g.AddButton(1019, 25, 45, '0x15AE', '0x15AE', '0x15AE', '1159');
		g.AddTooltip('Collapse Menu');
		
		g.AddButton(3001, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15B1', '0x15B1', '0x15B1', '1900');
		g.AddTooltip('Bard Menu');
		
		g.AddButton(3002, totalWidth - buttonWidth - 25, 45, '0x15A9', '0x15A9', '0x15A9', '1900');
		g.AddTooltip('Miscellaneous Menu');
			
		prompt = 120
		arrow = 235
		g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2)
		prompt += 10
	
		g.AddText(60, prompt + 5, GetColorStatus('allKillNear'), "All Kill Nearest");
		g.AddButton(3500, 25, prompt, GetCheckboxStatus("allKillNear"), GetCheckboxStatus("allKillNear"), GetCheckboxStatus("allKillNear"), '');
		prompt += 30

		g.AddText(60, prompt + 5, GetColorStatus('CrossHeal'), "Magery - Cross Heal");
		g.AddButton(3501, 25, prompt, GetCheckboxStatus("CrossHeal"), GetCheckboxStatus("CrossHeal"), GetCheckboxStatus("CrossHeal"), '');
		prompt += 30
				
		g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2)

		g.AddButton(10001, 7, 65, '0x15A1','0x15A2','0x15A3','905') 	
		g.AddButton(10003, 256, 65,'0x15A4','0x15A5','0x15A6','905')			
			
	    var guiWidth = width * cellSize;
	    var text = "Tamer/Mage Menu";
	    var centeredX = CalculateCenteredX(guiWidth, text, 6);
	    
		g.AddButton(300000, 60, 10, '0x1401', '0x1401', '0x1401', '1900 ')
		g.AddButton(300001, 50, 10, '0x1400', '0x1400', '0x1400', '1900 ')
		g.AddButton(300002, 218, 10, '0x1402', '0x1402', '0x1402', '1900')		
				
		g.AddButton(300003, 60, 20, '0x1407', '0x1407', '0x1407', '1900')		
		g.AddButton(300004, 50, 20, '0x1406', '0x1406', '0x1406', '1900')
		g.AddButton(300005, 218, 20, '0x1408', '0x1408', '0x1408', '1900')		    
	 
	    g.AddText(centeredX-10, 10, 1152, text, 0);    
	
		g.AddText(25, (height-1) * 35, HUE_STATUS_LABEL, Orion.GetGlobal('gui_phase'))
		g.AddText(75, (height-1) * 35, HUE_STATUS_TEXT,Orion.GetGlobal('gui_status'));	
	
	    g.AddButton(868686, 35, 14, '0x2716', '0x2716', '0x2716', '1900');
	    g.AddButton(868687, 235, 14, '0x2716', '0x2716', '0x2716', '1900');
		
		g.Update();
}

// ====================================================================================================================
// Function: GUI_BARD
// Purpose:  Render Bard menu (buffs, disco, provoke, area peace).
// Params:   None
// ====================================================================================================================
function GUI_BARD(){
	Shared.AddVar('selector', 7)
	Orion.Wait(100)
	var g = Orion.CreateCustomGump(101099);
	g.Clear();
	g.SetCallback('OnClick');
	const width = 8;
	const cellSize = 35;
	const height = 12;
	const color = 2769;
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
  
		g.AddButton(3000, 25, 45, '0x15AD', '0x15AD', '0x15AD', '1900');
		g.AddTooltip('Tamer Menu');
		
		g.AddButton(1019, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15B2', '0x15B2', '0x15B2', '1159');
		g.AddTooltip('Collapse Menu');
		
		g.AddButton(3002, totalWidth - buttonWidth - 25, 45, '0x15A9', '0x15A9', '0x15A9', '1900');
		g.AddTooltip('Miscellaneous Menu');
		
		g.AddButton(10001, 7, 65, '0x15A1','0x15A2','0x15A3','905') 	
		g.AddButton(10003, 256, 65,'0x15A4','0x15A5','0x15A6','905') 	
		prompt = 120
		arrow = 235
		g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2)
		prompt += 10
	
	
		g.AddButton(1104, 25, prompt, GetCheckboxStatus("BardBuff"), GetCheckboxStatus("BardBuff"), GetCheckboxStatus("BardBuff"), '');
		g.AddComboBox(5005, 70, prompt + 5, '0x0BB8', 0, '0x0BB8', 100, -3, 3);
		g.AddComboBoxText(' ', ' ', Shared.GetVar('bardSkill') === ' ' ? 1 : 0);
		g.AddComboBoxText('Peacemaking', ' ', Shared.GetVar('bardSkill') === 'Peacemaking' ? 1 : 0);
		g.AddComboBoxText('Provocation', ' ', Shared.GetVar('bardSkill') === 'Provocation' ? 1 : 0);
		g.AddTooltip('Select Bard Buff');
		prompt += 30
		g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2)
		prompt += 10
		g.AddText(60, prompt + 5, GetColorStatus('discoNearest'), "Disco Nearest Monster");
		g.AddButton(1101, 25, prompt, GetCheckboxStatus("discoNearest"), GetCheckboxStatus("discoNearest"), GetCheckboxStatus("discoNearest"), '');
		prompt += 30
		g.AddText(60, prompt + 5, GetColorStatus('AutoProvo'), "Auto Provoke");
		g.AddButton(1102, 25, prompt, GetCheckboxStatus("AutoProvo"), GetCheckboxStatus("AutoProvo"), GetCheckboxStatus("AutoProvo"), '');
		prompt += 30
		g.AddText(60, prompt + 5, GetColorStatus('AreaPeace'), "Area Peace");
		g.AddButton(1103, 25, prompt, GetCheckboxStatus("AreaPeace"), GetCheckboxStatus("AreaPeace"), GetCheckboxStatus("AreaPeace"), '');
		prompt += 30	
		g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2)

	    var guiWidth = width * cellSize;
	    var text = "Bard Menu";
	    var centeredX = CalculateCenteredX(guiWidth, text, 6);
	    
		g.AddButton(300000, 60, 10, '0x1401', '0x1401', '0x1401', '1900 ')
		g.AddButton(300001, 50, 10, '0x1400', '0x1400', '0x1400', '1900 ')
		g.AddButton(300002, 218, 10, '0x1402', '0x1402', '0x1402', '1900')		
				
		g.AddButton(300003, 60, 20, '0x1407', '0x1407', '0x1407', '1900')		
		g.AddButton(300004, 50, 20, '0x1406', '0x1406', '0x1406', '1900')
		g.AddButton(300005, 218, 20, '0x1408', '0x1408', '0x1408', '1900')		    
	 
	    g.AddText(centeredX-4, 10, 1152, text, 0);    
	
		g.AddText(25, (height-1) * 35, HUE_STATUS_LABEL, Orion.GetGlobal('gui_phase'))
		g.AddText(75, (height-1) * 35, HUE_STATUS_TEXT,Orion.GetGlobal('gui_status'));	
	
	    // Event / Bot menus
	    g.AddButton(868686, 35, 14, '0x2716', '0x2716', '0x2716', '1900');
	    g.AddButton(868687, 235, 14, '0x2716', '0x2716', '0x2716', '1900');
		
		g.Update();
}

// ====================================================================================================================
// Function: GUI_MISC2
// Purpose:  Render Miscellaneous page 2 (potions, seeds, trap box, chain explode).
// Params:   None
// ====================================================================================================================
function GUI_MISC2(){
	Shared.AddVar('selector', 8)
	Orion.Wait(100)
	var g = Orion.CreateCustomGump(101099);
	g.Clear();
	g.SetCallback('OnClick');
	const width = 8;
	const cellSize = 35;
	const height = 12;
	const color = 2769;
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
  
		g.AddButton(3000, 25, 45, '0x15AD', '0x15AD', '0x15AD', '1900');
		g.AddTooltip('Tamer Menu');
		
		g.AddButton(3001, (totalWidth / 2) - (buttonWidth / 2), 45, '0x15B1', '0x15B1', '0x15B1', '1900');
		g.AddTooltip('Bard Menu');
		
		g.AddButton(1019, totalWidth - buttonWidth - 25, 45, '0x15AA', '0x15AA', '0x15AA', '1159');
		g.AddTooltip('Collapse Menu');
		
		prompt = 120
		arrow = 235
		g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2)
		prompt += 10

		g.AddText(60, prompt+5, GetColorStatus('autoBox'), 'Auto Trap Box');
		g.AddButton(3600, 25, prompt, GetCheckboxStatus("autoBox"), GetCheckboxStatus("autoBox"), GetCheckboxStatus("autoBox"), '');  	
		prompt += 30

		g.AddText(60, prompt+5, GetColorStatus('autoHealCure'), 'Auto Heal/Cure Potion');
		g.AddButton(3601, 25, prompt, GetCheckboxStatus("autoHealCure"), GetCheckboxStatus("autoHealCure"), GetCheckboxStatus("autoHealCure"), '');  	
		prompt += 30		

		g.AddText(60, prompt+5, GetColorStatus('autoDrinkDexStr'), 'Auto Str/Dex Potion');
		g.AddButton(3602, 25, prompt, GetCheckboxStatus("autoDrinkDexStr"), GetCheckboxStatus("autoDrinkDexStr"), GetCheckboxStatus("autoDrinkDexStr"), '');  	
		prompt += 30		
		
		g.AddText(60, prompt+5, GetColorStatus('autoApple'), 'Auto Enchanted Apple');
		g.AddButton(3603, 25, prompt, GetCheckboxStatus("autoApple"), GetCheckboxStatus("autoApple"), GetCheckboxStatus("autoApple"), '');  	
		prompt += 30					

		g.AddText(60, prompt+5, GetColorStatus('autoSeed'), 'Auto Seed of Life');
		g.AddButton(3604, 25, prompt, GetCheckboxStatus("autoSeed"), GetCheckboxStatus("autoSeed"), GetCheckboxStatus("autoSeed"), '');  	
		prompt += 30	
		
		g.AddText(60, prompt+5, GetColorStatus('autoDraught'), 'Auto Mana Draught');
		g.AddButton(3605, 25, prompt, GetCheckboxStatus("autoDraught"), GetCheckboxStatus("autoDraught"), GetCheckboxStatus("autoDraught"), '');  	
		prompt += 30	

		g.AddText(60, prompt+5, GetColorStatus('ChainExplodePotNoTarg'), 'Chain Explosion Potions');
		g.AddButton(3606, 25, prompt, GetCheckboxStatus("ChainExplodePotNoTarg"), GetCheckboxStatus("ChainExplodePotNoTarg"), GetCheckboxStatus("ChainExplodePotNoTarg"), '');  	
		prompt += 30			
						
		g.AddLine(53.5, prompt + 5, 233.5, prompt + 5, 'white', 2)
		prompt += 10	

		g.AddButton(10001, 7, 65, '0x15A1','0x15A2','0x15A3','905')	
		g.AddButton(10003, 256, 65,'0x15A4','0x15A5','0x15A6','905') 	
			
	    var guiWidth = width * cellSize;
	    var text = "Miscallaneous Menu 2";
	    var centeredX = CalculateCenteredX(guiWidth, text, 6);
	    
		g.AddButton(300000, 60, 10, '0x1401', '0x1401', '0x1401', '1900 ')
		g.AddButton(300001, 50, 10, '0x1400', '0x1400', '0x1400', '1900 ')
		g.AddButton(300002, 218, 10, '0x1402', '0x1402', '0x1402', '1900')		
				
		g.AddButton(300003, 60, 20, '0x1407', '0x1407', '0x1407', '1900')		
		g.AddButton(300004, 50, 20, '0x1406', '0x1406', '0x1406', '1900')
		g.AddButton(300005, 218, 20, '0x1408', '0x1408', '0x1408', '1900')		    
	 
	    g.AddText(centeredX-4, 10, 1152, text, 0);    
	
		g.AddText(25, (height-1) * 35, HUE_STATUS_LABEL, Orion.GetGlobal('gui_phase'))
		g.AddText(75, (height-1) * 35, HUE_STATUS_TEXT,Orion.GetGlobal('gui_status'));	
	
	    g.AddButton(868686, 35, 14, '0x2716', '0x2716', '0x2716', '1900');
	    g.AddButton(868687, 235, 14, '0x2716', '0x2716', '0x2716', '1900');
		
		g.Update();
}

// ====================================================================================================================
// Function: GUI
// Purpose:  Route to the correct GUI page based on Shared selector variable.
// Params:   None
// ====================================================================================================================
function GUI() {
    var selector = Shared.GetVar('selector');
    if (selector == 0) {
        GUI_SELECTOR();
    } else if (selector == 1) {
        GUI_THROWER();
    } else if (selector == 2) {
        GUI_SAMPIRE();
    } else if (selector == 3) {
        GUI_MISC();
    } else if (selector == 4) {
        GUI_COMPACT();        
    } else if (selector == 5) {
    	GUI_SELECTOR2();
    } else if (selector == 6) {
		GUI_TAMER();
    } else if (selector == 7) {
    	GUI_BARD();
    } else if (selector == 8) {
    	GUI_MISC2();
    } else {
        GUI_SELECTOR();
    }
}

// ====================================================================================================================
// Function: OnClick
// Purpose:  Central GUI click handler for every Character Assistant menu button.
// Params:   None
// ====================================================================================================================
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


        case 1015:
            GUI_SAMPIRE();
            break;

        case 1016:
            GUI_THROWER();
            break;

        case 1017:
            GUI_SELECTOR();
            break;

        case 1018:
            GUI_MISC();
            break;
		case 1019:
			GUI_SELECTOR2();
			break;
			

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


        case 1099:
            ToggleScriptShared('AutoSampire');
            GUI();
            break;


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
            
		case 3000:
			GUI_TAMER()
			break;				
		
		case 3001:
			GUI_BARD()
			break;	

		case 3002:
			GUI_MISC2()                       		
			break	;
			
        case 3500: 
            ToggleScriptShared('allKillNear');
            Orion.Wait(50);
            if (!isToggleOn('allKillNear')) {
                Orion.Print(1191, "[All Kill Nearest] Script Stopped");
            }
            GUI();
            break;

        case 3501:
            ToggleScriptShared('CrossHeal');
            Orion.Wait(50);
            if (!isToggleOn('CrossHeal')) {
                Orion.Print(1191, "[CrossHeal] Script Stopped");
            }
            GUI();
            break;

        case 3600:
            ToggleScriptShared('autoBox');
            Orion.Wait(50);
            if (!isToggleOn('autoBox')) {
                Orion.Print(1191, "[AutoBox] Script Stopped");
            }
            GUI();
            break;

        case 3601: 
            ToggleScriptShared('autoHealCure');
            Orion.Wait(50);
            if (!isToggleOn('autoHealCure')) {
                Orion.Print(1191, "[Auto Heal/Cure] Script Stopped");
            }
            GUI();
            break;

        case 3602:
            ToggleScriptShared('autoDrinkDexStr');
            Orion.Wait(50);
            if (!isToggleOn('autoDrinkDexStr')) {
                Orion.Print(1191, "[Auto Str/Dex Potion] Script Stopped");
            }
            GUI();
            break;

        case 3603: 
            ToggleScriptShared('autoApple');
            Orion.Wait(50);
            if (!isToggleOn('autoApple')) {
                Orion.Print(1191, "[Auto Apple] Script Stopped");
            }
            GUI();
            break;

        case 3604: 
            ToggleScriptShared('autoSeed');
            Orion.Wait(50);
            if (!isToggleOn('autoSeed')) {
                Orion.Print(1191, "[Auto Seed] Script Stopped");
            }
            GUI();
            break;

        case 3605: 
            ToggleScriptShared('autoDraught');
            Orion.Wait(50);
            if (!isToggleOn('autoDraught')) {
                Orion.Print(1191, "[Auto Draught] Script Stopped");
            }
            GUI();
            break;

        case 3606: 
            ToggleScriptShared('ChainExplodePotNoTarg');
            Orion.Wait(50);
            if (!isToggleOn('ChainExplodePotNoTarg')) {
                Orion.Print(1191, "[ChainExplodePot] Script Stopped");
            }
            GUI();
            break;
            		
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

        case 7001:
            Shared.AddVar('selector', 0);
            GUI_SELECTOR();
            break;

		case 10000:
			GUI_SELECTOR2()
			break;		

		case 10001:
			GUI_SELECTOR()
			break;	
			
		case 10002:
			GUI_SELECTOR2()
			break;		

		case 10003:
			GUI_SELECTOR()
			break;	
			            
		case 300000:
			if (Shared.GetVar('selector') != 4) {
				GUI_COMPACT()		
			} else {
	            Shared.AddVar('selector', 0);		
				GUI_SELECTOR()
			}
			break;
			
		case 300001:
			if (Shared.GetVar('selector') != 4) {
				GUI_COMPACT()		
			} else {
	            Shared.AddVar('selector', 0);		
				GUI_SELECTOR()
			}
			break;

		case 300002:
			if (Shared.GetVar('selector') != 4) {
				GUI_COMPACT()		
			} else {
	            Shared.AddVar('selector', 0);		
				GUI_SELECTOR()
			}
			break;

		case 300003:
			if (Shared.GetVar('selector') != 4) {
				GUI_COMPACT()		
			} else {
	            Shared.AddVar('selector', 0);		
				GUI_SELECTOR()
			}
			break;
			
		case 300004:
			if (Shared.GetVar('selector') != 4) {
				GUI_COMPACT()		
			} else {
	            Shared.AddVar('selector', 0);		
				GUI_SELECTOR()
			}
			break;

		case 300005:
			if (Shared.GetVar('selector') != 4) {
				GUI_COMPACT()		
			} else {
	            Shared.AddVar('selector', 0);		
				GUI_SELECTOR()
			}
			break;

		case 300006:
			if (Shared.GetVar('selector') != 4) {
				GUI_COMPACT()		
			} else {
	            Shared.AddVar('selector', 0);		
				GUI_SELECTOR()
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

// ====================================================================================================================
// Function: SetMaster
// Purpose:  Prompt user to target a master and store their serial in Shared var.
// Params:   None
// ====================================================================================================================
function SetMaster() {
    Orion.Print(1152, "Target your master");
    var res = Orion.WaitForAddObject(15000);
    if (!res) {
        Shared.AddVar('masterSerial', '');
        return;
    }
    Shared.AddVar('masterSerial', res);
}

// ====================================================================================================================
// Function: GetMasterSerial
// Purpose:  Retrieve the saved master serial from Shared vars.
// Params:   None
// ====================================================================================================================
function GetMasterSerial() {
    var s = Shared.GetVar('masterSerial');
    if (!s) return '';
    return s;
}

// ====================================================================================================================
// Function: GetMaster
// Purpose:  Resolve master serial into an Object, or string if invalid.
// Params:   None
// ====================================================================================================================
function GetMaster() {
    var s = GetMasterSerial();
    if (!s) return 'not selected';

    var obj = Orion.FindObject(s);
    if (!obj) return 'not selected';
    return obj;
}

// ====================================================================================================================
// Function: GetMasterName
// Purpose:  Get master name or “not selected” if unavailable.
// Params:   None
// ====================================================================================================================
function GetMasterName() {
    var m = GetMaster();
    if (typeof m === 'string') return 'not selected';
    return m.Name();
}

// ====================================================================================================================
// Function: FollowMaster
// Purpose:  Follow selected master until toggle disabled or invalid.
// Params:   None
// ====================================================================================================================
function FollowMaster() {
  while (true) {
      var master = GetMaster();
      if (!master) {
          // If master is null or undefined, wait for 1000 milliseconds before checking again
          Orion.Wait(1000);
          continue;
      }

      var masterSerial;
      try {
          masterSerial = master.Serial();
      } catch (e) {
          // If there's an error retrieving the master serial, wait and try again
          Orion.Wait(1000);
          continue;
      }

      if (!Orion.ObjectExists(masterSerial)) {
          // If master object does not exist, wait and try again
          Orion.Wait(1000);
          continue;
      }

      var distance;
      try {
          distance = master.Distance();
      } catch (e) {
          // If there's an error retrieving the master distance, wait and try again
          Orion.Wait(1000);
          continue;
      }

      // If the distance is greater than 3, follow the master
      if (distance > 6) {
          Orion.Follow(masterSerial);
      }

      // Wait for 1000 milliseconds before checking again
      Orion.Wait(100);
  }    
}

// ====================================================================================================================
// Function: isSummoned
// Purpose:  Determine if a creature is a summoned entity via properties or name.
// Params:   nameOrProps (string|array), serial (number)
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AutoEoO
// Purpose:  Auto-cast Enemy of One when enemies near and mana is sufficient.
// Params:   None
// ====================================================================================================================
function isSummonedByName(obj) {
    if (!obj) return false;
    var name = obj.Name();
    if (!name) return false;

    var lower = name.toLowerCase();
    for (var i = 0; i < summonedNames.length; i++) {
        if (lower.indexOf(summonedNames[i]) !== -1) {
            return true;
        }
    }
    return false;
}

// ====================================================================================================================
// Function: AutoEoO
// Purpose:  Auto-cast Enemy of One when enemies near and mana is sufficient.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AutoConWeap
// Purpose:  Auto-cast Consecrate Weapon when in combat and buff missing.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AutoPrimary
// Purpose:  Keep Primary special move armed when requirements allow.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AutoSecondary
// Purpose:  Keep Secondary special move armed when requirements allow.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AutoVamp
// Purpose:  Maintain Vampiric Embrace buff automatically.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AutoWraith
// Purpose:  Maintain Wraith Form while toggle is active.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AutoAttack
// Purpose:  Thrower/Archer attack logic with optional auto-walk and target switching.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AutoSampire
// Purpose:  Full Sampire attack logic using GoToAndAttackTarget and target filtering.
// Params:   None
// ====================================================================================================================
function AutoSampire() {

    while (!Player.Dead()) {

        // one-line FindTypeEx as requested
        var arr = Orion.FindTypeEx(targetGraphics, -1, 'ground', targetFlags, 15, targetNoto, 1000);

        var useLootCorpses = Shared.GetVar('useLootCorpses');

        SampireDebug("Found " + arr.length + " raw targets with FindTypeEx");

        if (arr.length > 0) {
            arr.sort(function (a, b) { return a.Distance() - b.Distance(); });

            var choseTarget = false;

            for (var i = 0; i < arr.length; i++) {
                var target = arr[i];
                var targetObject = Orion.FindObject(target.Serial());
                if (!targetObject) {
                    SampireDebug("Candidate " + i + ": object not found, skipping");
                    continue;
                }

                var name = targetObject.Name();
                var dist = target.Distance();
                var noto = targetObject.Notoriety();  // 1 = blue, 2 = green, 3 = gray, 4 = criminal, 5 = orange, 6 = red, 7 = yellow

                SampireDebug("Candidate " + i + ": name=[" + name + "], noto=" + noto + ", dist=" + dist);

                // name-based summoned check
                var summonedByName = isSummonedByName(targetObject);

                // optional properties-based summoned check if you still use isSummoned()
                var summonedByProps = false;
                var props = targetObject.Properties();
                if (typeof isSummoned === 'function') {
                    summonedByProps = isSummoned(props);
                }

                SampireDebug(" -> summonedByName=" + summonedByName + ", summonedByProps=" + summonedByProps);

                // NEW RULE:
                // Only skip when the target is RED (6) AND looks like a summon
                if (noto === 6 && (summonedByName || summonedByProps)) {
                    SampireDebug(" -> skipped (red summon match)");
                    continue;
                }

                // Everything else (gray lich lord, orange mobs, etc.) are allowed through
                SampireDebug(" -> attempting GoToAndAttackTarget on " + name + " [" + target.Serial() + "]");

                if (GoToAndAttackTarget(targetObject)) {
                    //SampireDebug(" -> attack sequence started on " + name);

                    if (useLootCorpses === 'True') {
                        //SampireDebug(" -> LootCorpses enabled, calling");
                        LootCorpses();
			        	UpdateGUIPhase("Status: ")                        
                    }

                    choseTarget = true;
                    Orion.Wait(500);
                    break;
                } else {
                    SampireDebug(" -> GoToAndAttackTarget returned false");
                }
            }

            if (!choseTarget) {
                SampireDebug("No suitable target chosen in this scan");
                Orion.Wait(250);
            }

        } else {
        	UpdateGUIPhase("Status: ")
            UpdateGUIStatus('No target available...');
            SampireDebug("No targets from FindTypeEx, waiting...");
            Orion.Wait(250);
        }
    }
    SampireDebug("AutoSampire loop ended (player is dead or script stopped)");
}

// ====================================================================================================================
// Function: HidePlayers
// Purpose:  Hide nearby players or certain summons visually from the client.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AutoMomentumStrike
// Purpose:  Automate Momentum Strike special move.
// Params:   None
// ====================================================================================================================
function AutoMomentumStrike() {
    while (!Player.Dead() && isToggleOn('AutoMomentumStrike')) {
        if (!Orion.BuffExists('Momentum Strike') && Player.Mana() > 10) {
            Orion.Cast('Momentum Strike');
            Orion.Wait(500);
        }
        Orion.Wait(500);
    }
}

// ====================================================================================================================
// Function: AutoLightningStrike
// Purpose:  Automate Lightning Strike special move.
// Params:   None
// ====================================================================================================================
function AutoLightningStrike() {
    while (!Player.Dead() && isToggleOn('AutoLightningStrike')) {
        if (!Orion.BuffExists('Lightning Strike') && Player.Mana() > 10) {
            Orion.Cast('Lightning Strike');
            Orion.Wait(500);
        }
        Orion.Wait(500);
    }
}

// ====================================================================================================================
// Function: AutoCounterAttack
// Purpose:  Automate Counter Attack when requirements allow.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: autoEvade
// Purpose:  Automate casting of Evasion with timer display.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: autoConfidence
// Purpose:  Automate Confidence ability with cooldown display.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: auto_CrossHealBandage
// Purpose:  Automate bandage healing for self + allies using weighted logic.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: deathCheck
// Purpose:  Monitor for player death and update GUI status accordingly.
// Params:   None
// ====================================================================================================================
function deathCheck() {
    while (isToggleOn('deathCheck')) {
        if (Player.Dead()) {
            GUI();
            UpdateGUIStatus('Character is dead');
        }
        Orion.Wait(4000);
    }
}

// ====================================================================================================================
// Function: eventGate
// Purpose:  Auto-enter event gate and retry if “spirit lacks” occurs.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AcceptRes
// Purpose:  Auto-accept resurrection gump, redress, and restart appropriate combat helpers based on skills.
//           Re-enables AutoAttack / AutoSampire, AutoPrimary, AutoRearm, and auto_CrossHealBandage with proper checks.
// Params:   (none)
// ====================================================================================================================
function AcceptRes()
{
    while (true) {
        // Wait until we are dead
        while (Player.Dead()) {
            if (Orion.WaitForGump(1000)) {
                var gump0 = Orion.GetGump('last');
                if ((gump0 !== null) && (!gump0.Replayed()) && (gump0.ID() === '0x000008AF')) {
                    gump0.Select(Orion.CreateGumpHook(2)); // "Accept" on res gump
                    Orion.Wait(100);
                }
            }

            Orion.Wait(2500);

            // Redress
            Orion.Dress(Player.Name() + Orion.ShardName());

            // ------------------------------
            // Re-enable combat helpers safely
            // ------------------------------

            // Thrower vs. Swords
            var throwing = Orion.SkillValue('Throwing', 'real');
            var swords   = Orion.SkillValue('Swordsmanship', 'real');

            // Thrower: AutoAttack
            if (throwing >= 900) { // 90.0
                if (!Orion.ScriptRunning('AutoAttack')) {
                    Orion.ToggleScript('AutoAttack');
                }
                if (Orion.ScriptRunning('AutoAttack')) {
                    Shared.AddVar('AutoAttack', 1);
                }
                // If you want to ensure AutoSampire is off after res:
                if (Orion.ScriptRunning('AutoSampire')) {
                    Orion.Terminate('AutoSampire');
                    Shared.AddVar('AutoSampire', 0);
                }
            }
            // Swords: AutoSampire
            else if (swords >= 900) {
                if (!Orion.ScriptRunning('AutoSampire')) {
                    Orion.ToggleScript('AutoSampire');
                }
                if (Orion.ScriptRunning('AutoSampire')) {
                    Shared.AddVar('AutoSampire', 1);
                }
                // Make sure AutoAttack is off in this case
                if (Orion.ScriptRunning('AutoAttack')) {
                    Orion.Terminate('AutoAttack');
                    Shared.AddVar('AutoAttack', 0);
                }
            }

            // AutoPrimary / AutoRearm – Tactics check
            var tactics = Orion.SkillValue('Tactics', 'real');
            if (tactics >= 600) { // 60.0
                if (!Orion.ScriptRunning('AutoPrimary')) {
                    Orion.ToggleScript('AutoPrimary');
                }
                if (Orion.ScriptRunning('AutoPrimary')) {
                    Shared.AddVar('AutoPrimary', 1);
                }

                if (!Orion.ScriptRunning('AutoRearm')) {
                    Orion.ToggleScript('AutoRearm');
                }
                if (Orion.ScriptRunning('AutoRearm')) {
                    Shared.AddVar('AutoRearm', 1);
                }
            } else {
                Shared.AddVar('AutoPrimary', 0);
                Shared.AddVar('AutoRearm', 0);
            }

            // Bandage cross-heal – Healing check
            var healRaw  = Orion.SkillValue('Healing', 'real');
            var healReal = healRaw / 10.0;
            if (healReal >= 50.0) {
                if (!Orion.ScriptRunning('auto_CrossHealBandage')) {
                    Orion.ToggleScript('auto_CrossHealBandage');
                }
                if (Orion.ScriptRunning('auto_CrossHealBandage')) {
                    Shared.AddVar('auto_CrossHealBandage', 1);
                }
            } else {
                Shared.AddVar('auto_CrossHealBandage', 0);
            }

            // If you ever add AutoEoO / AutoConWeap here, same pattern applies.
        }

        // Small pause while alive before checking again
        Orion.Wait(2500);
    }
}

// ====================================================================================================================
// Function: AutoRearm
// Purpose:  Auto re-equip previous weapon after disarm or loss.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: FormRevert
// Purpose:  Remove all polymorph, necro, mystic, and animal forms.
// Params:   None
// ====================================================================================================================
function FormRevert() {
    if (Orion.BuffExists('Horrific Beast')) { while (Orion.BuffExists('Horrific Beast')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Horrific Beast'); Orion.Wait(3000); } }
    if (Orion.BuffExists('Wraith Form')) { while (Orion.BuffExists('Wraith Form')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Wraith Form'); Orion.Wait(3000); } }
    if (Orion.BuffExists('Lich Form')) { while (Orion.BuffExists('Lich Form')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Lich Form'); Orion.Wait(3000); } }
    if (Orion.BuffExists('Vampiric Embrace')) { while (Orion.BuffExists('Vampiric Embrace')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Vampiric Embrace'); Orion.Wait(3000); } }
    if (Orion.BuffExists('Animal Form')) { while (Orion.BuffExists('Animal Form')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Animal Form'); Orion.Wait(3000); } }
    if (Orion.BuffExists('Stone Form')) { while (Orion.BuffExists('Stone Form')) { Orion.Print(90, "Removing the current form"); Orion.Cast('Stone Form'); Orion.Wait(3000); } }
}

// ====================================================================================================================
// Function: SetBadLocations
// Purpose:  Register predefined bad pathfinding tiles for navigation avoidance.
// Params:   None
// ====================================================================================================================
function SetBadLocations() {
    var id = 0;
    for (var i = 0; i < badLocations.length; i++) {
        var loc = badLocations[i];
        Orion.SetBadLocation(loc.x, loc.y, -1);
        Orion.AddHighlightArea(id, -1, 'pos', '0x0490', 0, 0, 'all', loc.x, loc.y);
        id++;
    }
}

// ====================================================================================================================
// Function: keepActive
// Purpose:  Keep client awake by periodically clicking backpack.
// Params:   None
// ====================================================================================================================
function keepActive() {
    while (true) {
        Orion.Click(backpack);
        Orion.Wait(30000);
    }
}

// ====================================================================================================================
// Function: create_Party
// Purpose:  Auto-invite nearby friendly players into a party.
// Params:   None
// ====================================================================================================================
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

    var getParty = Orion.FindType(players, any, 'ground', targetFlags, 15, partyNoto);
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

// ====================================================================================================================
// Function: disbandParty
// Purpose:  Disband current party using context menu.
// Params:   None
// ====================================================================================================================
function disbandParty() {
    Orion.RequestContextMenu(Player.Serial());
    Orion.WaitContextMenuID(Player.Serial(), 811);
    Orion.Wait(500);
    Orion.RemoveObject('ac_master');
}

// ====================================================================================================================
// Function: RestockBandages
// Purpose:  Pull correct bandages from a secure into belt or backpack.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: openContainer
// Purpose:  Repeatedly attempt to open a container while ignoring “wait to perform” warnings.
// Params:   containerSerial
// ====================================================================================================================
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

// ====================================================================================================================
// Function: weightedRandomHealTarget
// Purpose:  Select lowest-health ally using weighted probability.
// Params:   potentialTargets (array), dist (number)
// ====================================================================================================================
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

// ====================================================================================================================
// Function: IsApplyingBandages
// Purpose:  Check whether player currently has bandage buff active.
// Params:   None
// ====================================================================================================================
function IsApplyingBandages() {
    return (Orion.BuffExists('0x7596') && Orion.BuffTimeRemaining('healing skill') > 0) ||
        (Orion.BuffExists('veterinary') && Orion.BuffTimeRemaining('veterinary') > 0);
}

// ====================================================================================================================
// Function: auto_PoisonBandage
// Purpose:  Auto-bandage poisoned players or self within range.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: allKillNear
// Purpose:  Auto command pets to attack nearest hostile and resume follow.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: AddMount
// Purpose:  Select mount and store as alias.
// Params:   None
// ====================================================================================================================
function AddMount() {
    Orion.Print('-1', 'Target your mount');
    Orion.AddObject('myMount');
}

// ====================================================================================================================
// Function: MountAndDismount
// Purpose:  Toggle mount/dismount using saved mount alias.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: autoBox
// Purpose:  Auto trigger trap box on nerve strike or paralysis.
// Params:   None
// ====================================================================================================================
function autoBox() {
    Orion.Print(1191, "[AutoBox] Script Started");

    while (!Player.Dead() && isToggleOn('autoBox')) {
        var box = Orion.FindTypeEx('0x09A9', 'any', 'backpack');

        if (!box.length) {
            Orion.Print(1191, "[AutoBox] No box found in backpack");
            Orion.Wait(1000);
            break;
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
    Shared.AddVar("autoBox", 0)
    GUI()    
    Orion.Print(1191, "[AutoBox] Script Stopped");
}

// ====================================================================================================================
// Function: autoDrinkDexStr
// Purpose:  Auto drink Dexterity + Strength potions when buffs expire.
// Params:   None
// ====================================================================================================================
function autoDrinkDexStr() {
    Orion.Print(1191, "[Auto Str/Dex Potion] Script Started");
	var autoDrinkDexStr = 1
    while (!Player.Dead() && isToggleOn('autoDrinkDexStr') && autoDrinkDexStr == 1) {
        if (!Player.Hidden()) {
            if (!Orion.BuffExists('Agility') || Orion.BuffTimeRemaining('Agility') < 5000) {
                var agilityPotion = Orion.FindType('0x0F08', '0x0000', 'backpack');
                if (agilityPotion.length) {
                    Orion.UseItemOnMobile(agilityPotion[0], Player.Serial());
                    Orion.Wait(100);
                } else {
                    Orion.CharPrint('self', 1191, 'No Greater Agility Potions');
                    var autoDrinkDexStr = 0
                    break;
                }
            }

            if (!Orion.BuffExists('Strength') || Orion.BuffTimeRemaining('Strength') < 5000) {
                var strengthPotion = Orion.FindType('0x0F09', '0x0000', 'backpack');
                if (strengthPotion.length) {
                    Orion.UseItemOnMobile(strengthPotion[0], Player.Serial());
                    Orion.Wait(100);
                } else {
                    Orion.CharPrint('self', 1191, 'No Greater Strength Potions');
                    var autoDrinkDexStr = 0  
                    break;                  
                }
            }
        }

        Orion.Wait(600);
    }
    Shared.AddVar("autoDrinkDexStr", 0)
    GUI()    
}

// ====================================================================================================================
// Function: autoHealCure
// Purpose:  Auto drink heal + cure potions based on damage/poison.
// Params:   None
// ====================================================================================================================
function autoHealCure() {
    Orion.Print(1191, "[Auto Heal/Cure] Script Started");
	
	var autoHealCure = 1
	
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

        if (!Orion.DisplayTimerExists('healPot') && Player.Hits() < (Player.MaxHits() - 30) && autoHealCure == 1) {
            var healPotion = Orion.FindType('0x0F0C', '0x0000', 'backpack');
            if (healPotion.length) {
                Orion.UseItemOnMobile(healPotion[0], Player.Serial());
                Orion.AddDisplayTimer('healPot', 10000, 'AboveChar', 'bar|circle', 'Heal Potion', 0, 0, '44', fontCode, '0xFFA500FF');
                Orion.Wait(600);
            } else {
				autoHealCure = 0
                Orion.CharPrint('self', 1191, 'No Heal Potions');
                break;
            }
        }
        Orion.Wait(500);
    }
    Shared.AddVar("autoHealCure", 0)
    GUI()
    Orion.Print(1191, "[Auto Heal/Cure] Script Stopped");
}

// ====================================================================================================================
// Function: autoApple
// Purpose:  Auto use enchanted apples when certain debuffs detected.
// Params:   None
// ====================================================================================================================
function autoApple() {
    Orion.Print(1191, "[Auto Apple] Script Started");

    while (!Player.Dead() && isToggleOn('autoApple')) {
        if (!Orion.DisplayTimerExists('apple')) {
            if (Orion.BuffExists('Corpse Skin') || Orion.BuffExists('Sleep') || Orion.BuffExists('Mortal Strike')) {
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
    Shared.AddVar("autoApple", 0 )
    GUI()
    Orion.Print(1191, "[Auto Apple] Script Stopped");
}

// ====================================================================================================================
// Function: AreaPeace
// Purpose:  Auto peacemaking around player with instrument usage.
// Params:   None
// ====================================================================================================================
function AreaPeace() {
    while (!Player.Dead() && isToggleOn('AreaPeace')) {
        Orion.UseType('0x0E9D|0x0E9C|0x0EB2|0x0EB3');
        Orion.UseSkill('Peacemaking');
        Orion.WaitForTarget(1000);
        Orion.TargetObject(self);
        Orion.Wait(8500);
    }
    Shared.AddVar("AreaPeace", 0)
    GUI()
}

// ====================================================================================================================
// Function: AutoProvo
// Purpose:  Auto provoke two enemies onto each other using ignore lists.
// Params:   None
// ====================================================================================================================
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
    Shared.AddVar("AutoProvo", 0)
    GUI()
}

// ====================================================================================================================
// Function: discoNearest
// Purpose:  Auto discord nearest enemy with ignore list rotation.
// Params:   None
// ====================================================================================================================
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
    Shared.AddVar("discoNearest", 0)
    GUI()
}

// ====================================================================================================================
// Function: BardBuff
// Purpose:  Auto cast bard masteries based on selected skill option.
// Params:   None
// ====================================================================================================================
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
    Shared.AddVar("BardBuff", 0)
    GUI()
}

// ====================================================================================================================
// Function: ChainExplodePot
// Purpose:  Throw explosion potions continuously at a fixed target.
// Params:   targetSerial (number)
// ====================================================================================================================
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
    Shared.AddVar("ChainExplodePot", 0)
    GUI()
}

// ====================================================================================================================
// Function: ChainExplodePotNoTarg
// Purpose:  Prompt user for a target and chain-throw explosion pots.
// Params:   None
// ====================================================================================================================
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
    Shared.AddVar("ChainExplodePotNoTarg", 0)
    GUI()
}

// ====================================================================================================================
// Function: CrossHeal
// Purpose:  Mage-based cross healing and curing for self + allies.
// Params:   None
// ====================================================================================================================
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
    Shared.AddVar("CrossHeal", 0)
}

// ====================================================================================================================
// Function: SelectTargetScrollingBlue
// Purpose:  Scroll hostile targets using blue highlight style.
// Params:   forward (bool)
// ====================================================================================================================
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

// ====================================================================================================================
// Function: SelectTargetScrollingBlue
// Purpose:  Scroll hostile targets using blue highlight style.
// Params:   forward (bool)
// ====================================================================================================================
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

// ====================================================================================================================
// Function: GoToAndAttackTarget
// Purpose:  Pathfind to enemy, attack, update GUI, and ignore unreachable mobs.
// Params:   target (Orion object)
// ====================================================================================================================
function GoToAndAttackTarget(target) {
    if (!target || !Orion.ObjectExists(target.Serial())) {
        Orion.PrintFast(Player.Serial(), 33, 0, "Target does not exist.");
        return false;
    }

    var targetSerial = target.Serial();
    Orion.PrintFast(targetSerial, 33, 0, "***Target***");
    Orion.ShowStatusbar(targetSerial, 550, 100);
    Orion.GetStatus(targetSerial);
    UpdateAttackStatus(target);
    
    var pathArray = Orion.GetPathArray(target.X(), target.Y(), target.Z(), 1, 10);
    if (target.Distance() > 1 && pathArray.length === 0) {
        Orion.PrintFast(Player.Serial(), 33, 0, "Target is unreachable. Adding to ignore list.");
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

// ====================================================================================================================
// Function: UpdateAttackStatus
// Purpose:  Update GUI indicators and stored lastTarget value during attack.
// Params:   target (Orion object)
// ====================================================================================================================
function UpdateAttackStatus(target) {
    Orion.PrintFast(Player.Serial(), 49, 0, "Attacking: " + target.Name());
    UpdateGUIPhase("Attack")
    UpdateGUIStatus(target.Name());
    Orion.SetGlobal("lastTarget", target.Serial());
}

// ====================================================================================================================
// Function: FindEnemies
// Purpose:  Get list of valid enemies using filtering and ignore lists.
// Params:   None
// ====================================================================================================================
function FindEnemies() {
    var searchRadius = 10;
    return Orion.FindTypeEx(targetGraphics, 'any', 'ground', 'ignoreself|ignorefriends|live|near|inlos', searchRadius, "gray|criminal|enemy|red", ' ', 'AutoTargetIgnore');
}

// ====================================================================================================================
// Function: LootMyCorpses
// Purpose:  Walk to and open player’s own corpse(s) nearby.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: autoSeed
// Purpose:  Auto use Seed of Life when HP drops below configured threshold.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: autoDraught
// Purpose:  Auto drink Mana Draught when mana is low.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: autoMount
// Purpose:  Mount ethereal automatically when not mounted.
// Params:   None
// ====================================================================================================================
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

// ====================================================================================================================
// Function: SampireDebug
// Purpose:  Conditional debug printer for AutoSampire.
// Params:   msg (string)
// ====================================================================================================================
function SampireDebug(msg) {
    if (DEBUG_SAMPIRE) {
        Orion.Print("[AutoSampire] " + msg);
    }
}

// ====================================================================================================================
// Function: ThrowerDebug
// Purpose:  Conditional debug printer for AutoAttack.
// Params:   msg (string)
// ====================================================================================================================
function ThrowerDebug(msg) {
    if (DEBUG_THROWER) {
        Orion.Print("[AutoAttack] " + msg);
    }
}

// ====================================================================================================================
// BAD LOCATION TABLE
// ====================================================================================================================
var badLocations = [
    { x: 535, y: 991 }, { x: 1409, y: 3824 }, { x: 1414, y: 3828 }, { x: 1419, y: 3832 }, { x: 4449, y: 1115 }, { x: 4442, y: 1122 },
    { x: 1960, y: 2755 }, { x: 1591, y: 1679 }, { x: 3544, y: 1173 }, { x: 3545, y: 1169 }, { x: 3550, y: 1169 }
];
