//----------------------------------------------------------------------------------------------------------------------
// STAT ADJUSTMENT SCRIPT
// Created By: LavaLynk
// Version: 2.0
//----------------------------------------------------------------------------------------------------------------------
// This script is designed to optimize stat gains using the Arms Lore and Item Identification skills.
// 
// - Strength is trained using Arms Lore.
// - Dexterity and Intelligence are trained using Item Identification.
// 
// **IMPORTANT:** You MUST be at skill cap for this script to work effectively.
// 
// How it Works:
// 1. The script temporarily sets the selected skill (Arms Lore or Item Identification) to "Up."
// 2. Since you are at skill cap, the skill will not increase, but the system will still register a successful attempt.
// 3. This simulated success triggers the potential for a stat gain.
// 4. Once training is complete, skill statuses are reverted to their original state.
// 
// **Setup Requirements:**
// - Ensure you are at skill cap (7200 total skill points).
// - Set an armor piece in your backpack as the training target.
// - Run the script and let it manage stat gains efficiently.
//----------------------------------------------------------------------------------------------------------------------
// GLOBAL VARIABLES - MODIFY ONLY IF YOU KNOW WHAT YOU ARE DOING!!
//--------------------------------------------------------------------------------------------------------------------------------

const SKILLS = ['Alchemy', 'Anatomy', 'Animal Lore', 'Animal Taming', 'Archery', 'Arms Lore', 'Begging', 'Blacksmithy', 'Bowcraft/Fletching',
					   'Bushido', 'Camping', 'Carpentry', 'Cartography', 'Chivalry', 'Cooking', 'Detecting Hidden', 'Discordance', 'Evaluating Intelligence',
					   'Fencing', 'Fishing', 'Focus', 'Forensic Evaluation', 'Healing', 'Herding', 'Hiding', 'Imbuing', 'Inscription', 'Item Identification',
					   'Lockpicking', 'Lumberjacking', 'Magery', 'Meditation', 'Mining', 'Musicianship', 'Necromancy', 'Ninjitsu', 'Parrying', 'Peacemaking',
					   'Poisoning', 'Provocation', 'Remove Trap', 'Resisting Spells', 'Snooping', 'Spellweaving', 'Spirit Speak', 'Stealing', 'Stealth',
					   'Swordsmanship', 'Tactics', 'Tailoring', 'Tinkering', 'Tracking', 'Throwing', 'Veterinary', 'Wrestling', 'Mace Fighting', 'Taste Identification',
					   'Mysticism'];

//--------------------------------------------------------------------------------------------------------------------------------
// GUI SETUP
//--------------------------------------------------------------------------------------------------------------------------------
function GUIStat() {
	textColor = '1191'
    
    // Initialize Shared Variables on First Run
    if (Shared.GetVar('str') === undefined || Shared.GetVar('dex') === undefined || Shared.GetVar('int') === undefined) {
    	Orion.Undress()
        Shared.AddVar('str', Player.Str());
        Shared.AddVar('dex', Player.Dex());
        Shared.AddVar('int', Player.Int());
    }    
    
    var g = Orion.CreateCustomGump(101089);
    g.Clear();
    g.SetCallback('OnClick1');
    
    var width = 8, height = 9, cellSize = 35;
    var gumpPics = { cornerTL: 0x9C40, cornerTR: 0x9C42, cornerBL: 0x9C46, cornerBR: 0x9C48,
                        borderT: 0x9C41, borderB: 0x9C47, borderL: 0x9C43, borderR: 0x9C45, center: 0x9C44 };
    
    for (var y = 0; y < height; ++y) {
        for (var x = 0; x < width; ++x) {
            var img = gumpPics.center;
            if (y === 0) img = x === 0 ? gumpPics.cornerTL : x === width - 1 ? gumpPics.cornerTR : gumpPics.borderT;
            else if (y === height - 1) img = x === 0 ? gumpPics.cornerBL : x === width - 1 ? gumpPics.cornerBR : gumpPics.borderB;
            else if (x === 0) img = gumpPics.borderL;
            else if (x === width - 1) img = gumpPics.borderR;
            g.AddGumpPic(x * cellSize, y * cellSize, img);
        }
    }
    g.AddCheckerTrans(0, 0, width * cellSize, height * cellSize);

    var prompt = 40, arrow = 235;
    g.AddText(25, prompt, 	textColor, 'Set Target: ' + GetTarget());
    g.AddButton(1010, arrow, prompt+4, 0x4B9, 0x4BA, 0x4B9, "");
    g.AddTooltip("Select piece of armor in backpack.")
    prompt += 30;
    g.AddLine(53.5, prompt, 233.5, prompt, 'white', 2);
    prompt += 20;

    g.AddText(30, prompt, 	textColor, 'Strength:');
    addStatAdjustment(g, 2000, 150, prompt, 'str');
    prompt += 30;

    g.AddText(30, prompt, 	textColor, 'Dexterity:');
    addStatAdjustment(g, 3000, 150, prompt, 'dex');
    prompt += 30;

    g.AddText(30, prompt, 	textColor, 'Intelligence:');
    addStatAdjustment(g, 4000, 150, prompt, 'int');
    prompt += 30;

    g.AddLine(53.5, prompt, 233.5, prompt, 'white', 2);
    prompt += 20;
    g.AddText(30, prompt, GetStatColor(), (Shared.GetVar('str') + Shared.GetVar('dex')+ Shared.GetVar('int')) + ' / ');
    g.AddText(80, prompt, GetStatColor(), Player.StatsCap());
    g.AddText(115, prompt, GetStatColor(), GetReady());
    prompt += 40;

    g.AddLine(53.5, prompt, 233.5, prompt, 'white', 2);
    prompt += 20;
    g.AddText(60, prompt + 5, textColor, "Start");
    g.AddButton(1006, 25, prompt, GetCheckboxStatus(), GetCheckboxStatus(), GetCheckboxStatus(), ' ');
    prompt += 30;
    
    var guiWidth = width * cellSize;
    var text = "Stat Adjustments";
    var averageCharWidth = 7; // Adjust this value based on your font and size
    var centeredX = CalculateCenteredX(guiWidth, text, averageCharWidth);
    g.AddText(centeredX, 10, 1152, text, 0);
    g.Update();
}

function addStatAdjustment(g, serial, x, y, stat) {
    var leftArrowGraphic = '0x2626', rightArrowGraphic = '0x2622';
    var leftArrowPressed = '0x2627', rightArrowPressed = '0x2623'
    var leftArrowFiveGraphic = '0x2626', rightArrowFiveGraphic = '0x2622';    
    var leftArrowFivePressed = '0x2627', rightArrowFivePressed = '0x2623'  
      
    g.AddButton(serial, x-25, y, leftArrowGraphic, leftArrowGraphic, leftArrowPressed, "1151");
    g.AddTooltip("-1")
    g.AddButton(serial + 1, x + 50, y, rightArrowGraphic, rightArrowGraphic, rightArrowPressed, "1151");
    g.AddTooltip("+1")    
    g.AddButton(serial + 2, x - 50, y, leftArrowFiveGraphic, leftArrowFiveGraphic, leftArrowFivePressed, '151')
    g.AddTooltip("-5")    
    g.AddButton(serial + 3, x + 75, y, rightArrowFiveGraphic, rightArrowFiveGraphic, rightArrowFivePressed, '151')
    g.AddTooltip("+5")        
    g.AddText(x + 10, y, 1152, Shared.GetVar(stat) || 10);
}

//--------------------------------------------------------------------------------------------------------------------------------
// CASES
//--------------------------------------------------------------------------------------------------------------------------------
function OnClick1() {
    var buttonID = CustomGumpResponse.ReturnCode();
    
    if (buttonID >= 2000 && buttonID < 3000) {
        adjustStatValue('str', buttonID);
    } else if (buttonID >= 3000 && buttonID < 4000) {
        adjustStatValue('dex', buttonID);
    } else if (buttonID >= 4000 && buttonID < 5000) {
        adjustStatValue('int', buttonID);
    } else {
        switch (buttonID) {
            case 1006:
			    var appRunning = Shared.GetVar("appRunning");
			    if (appRunning === 1) {
			        Shared.AddVar("appRunning", 0);
			        Orion.Terminate("Stats");
			    } else {
			        Shared.AddVar("appRunning", 1);	        
			        Orion.Exec("Stats", true);
			    }
			    Orion.Wait(100)
			    GUIStat()
			break;
            case 1010:
                SetTarget();
                Orion.Undress()
                GUIStat()                
                break;
        }
    }
}
//--------------------------------------------------------------------------------------------------------------------------------
// GUI FUNCTIONS
//--------------------------------------------------------------------------------------------------------------------------------
function adjustStatValue(stat, buttonID) { 
    var change = 0;
    
    if (buttonID % 4 === 3) {
        change = 5;
    } else if (buttonID % 4 === 2) {
        change = -5;
    } else if (buttonID % 4 === 1) {
        change = 1;
    } else if (buttonID % 4 === 0) {
        change = -1;
    }
    
    var currentValue = Shared.GetVar(stat) || 10;
    var newValue = Math.max(10, Math.min(125, currentValue + change));
    Shared.AddVar(stat, newValue);
    GUIStat();
}

function CalculateCenteredX(guiWidth, text, averageCharWidth) {
    var textWidth = text.length * averageCharWidth;
    return (guiWidth - textWidth) / 2;
}

function GetCheckboxStatus() {
    var appRunning = Shared.GetVar("appRunning");
    return appRunning === 1 ? '0x2602' : '0x2603';
}

function getTotalSkillValue() {
    var total = 0;
    for (var i = 0; i < SKILLS.length; i++) {
        total += Orion.SkillValue(SKILLS[i], 'real');
    }
    return total;
}

//--------------------------------------------------------------------------------------------------------------------------------
// SCRIPT FUNCTIONS
//--------------------------------------------------------------------------------------------------------------------------------
function trainStat(skill, current, target) {
    
    if (getTotalSkillValue() !== 7200) {
        Orion.Print("[ERROR] Total skill value is not 7200. Aborting script.");
        Orion.Terminate("Stats");
        return;
    }
    
    if (current < target) {
        var obj = Orion.FindObject(GetTarget());
        if (!obj) {
            Orion.Print("[ERROR] Target object not found. Aborting script.");
            Orion.Terminate("Stats");
            return;
        }
		Orion.Print(Orion.SkillStatus(skill))
        Orion.SetSkillStatus(skill, "Up");
        Orion.Print( "Skill: "+ skill + " Current: " + current + " Target:" + target)
        while (current < target) {
            Orion.UseSkill(skill);
            Orion.Wait(500);
            Orion.TargetObject(obj.Serial());
            Orion.Wait(delay);
            
            statAdjustment();
            if (Orion.InJournal('already casting') || Orion.InJournal('not yet recovered') || Orion.InJournal('few moments')) {
                delay += 200;
                Orion.Print("[DEBUG] Adjusting delay: " + delay);
                Orion.Wait(200);
                Orion.ClearJournal();
            }
            
            if (skill === 'Arms Lore') {
                current = Player.Str();
            } else if (skill === 'Item Identification' && target === Shared.GetVar('dex')) {
                current = Player.Dex();
            } else if (skill === 'Item Identification' && target === Shared.GetVar('int')) {
                current = Player.Int();
            }
        }
    }
}

function Stats() {
    delay = 1300;
        
    if ((Shared.GetVar('str') + Shared.GetVar('dex') + Shared.GetVar('int')) != Player.StatsCap()) {
        Orion.Print('[ERROR] Your current stat cap does not match the total shared stats. Please adjust.');
        Orion.Terminate('Stats');
        return;
    }
    saveSkillStatus();   
   
    Orion.Undress();
    statAdjustment();    
    if (Player.Str() < Shared.GetVar('str')) {
	    Orion.Print("STR")
        trainStat('Arms Lore', Player.Str(), Shared.GetVar('str'));
        statAdjustment();    
    }
    if (Player.Dex() < Shared.GetVar('dex')) {
    	Orion.Print("DEX")
        trainStat('Item Identification', Player.Dex(), Shared.GetVar('dex'));
        statAdjustment();    
    }
    if (Player.Int() < Shared.GetVar('int')) {
    	Orion.Print("INT")    
        trainStat('Item Identification', Player.Int(), Shared.GetVar('int'));
        statAdjustment();    
    }
    Shared.AddVar("appRunning", 0)
    GUIStat()
}

function statAdjustment() {
    adjustStat('str', Shared.GetVar('str'), Player.Str());
    adjustStat('dex', Shared.GetVar('dex'), Player.Dex());
    adjustStat('int', Shared.GetVar('int'), Player.Int());

}

function adjustStat(stat, targetValue, current) {     
    if (targetValue > current) {
        Orion.SetStatStatus(stat, 'Up'); 
    } else if (targetValue < current) {
        Orion.SetStatStatus(stat, 'Down');
    } else {
        Orion.SetStatStatus(stat, 'Lock');
    }
}

	
function SetTarget(){
	Orion.Print(55, 'Set Target')
	Orion.WaitForAddObject('ac_target',25000);
}

function GetTarget(){
	var bb = Orion.FindObject('ac_target');
	if(bb){
		return bb.Serial();
	}
	return 'not selected';
}
		
function GetStatColor() {
    if (Shared.GetVar('str') + Shared.GetVar('int') + Shared.GetVar('dex') != Player.StatsCap()) {
        return 33;
    } else {
        return 76;
    }
}

function GetReady(){
    if (Shared.GetVar('str') + Shared.GetVar('int') + Shared.GetVar('dex') != Player.StatsCap()) {
        return '- DO NOT START';
    } else {
        return '- READY TO EXECUTE';
    }
}

function saveSkillStatus() {
    for (var i = 0; i < SKILLS.length; i++) {
        var status = Orion.SkillStatus(SKILLS[i]);
        Shared.AddVar(SKILLS[i], status);
	    Orion.SetSkillStatus(SKILLS[i], 'Lock');        
    }
}

function revertSkillStatus() {
    for (var i = 0; i < SKILLS.length; i++) {
        var status = Shared.GetVar(SKILLS[i]);
        if (status) {
            Orion.SetSkillStatus(SKILLS[i], status);
        }
    }
}
