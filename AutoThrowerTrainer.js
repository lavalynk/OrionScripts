//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// One Click Thrower Trainer
// Created By: LavaLynk
// v1.01
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//  Version Update Notes:
//
//  v1.01:
//  - Improved mana check to ensure efficient mana usage during training.
//  - Added a low-health healing routine using Spirit Speak to enhance safety during long training sessions.
//  - Optimized the delay system, adjusting based on casting or recovery times to prevent unnecessary pauses.
//  - Introduced automatic targeting for self-cast spells when necessary.
//
//  v1.00:
//  - Initial release of the One Click Thrower Trainer.
//
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//	Setup
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
var Throwing = 120;
var Chivalry = 100;
var Necromancy = 40;
var Healing = 100;
var Anatomy = 100;
var Tactics = 100;
var Parrying = 100;
var SpiritSpeak = 100;

var maxStr = 100;
var maxDex = 110;
var maxInt = 40;

var discordHook = 'https://discord.com/api/webhooks/1286433815123853342/B_0UpddlxlWTrpV8Rzo3AOHN4iDuPd5GftfzGWaXsHTuYcA0-xUIXQFb7c0o43MgyEUN' //Set Discord Hook
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Runebook Setup
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Runebook needs to be set up in the exact order as below.
//	1		Luna Mint
//	2 		EM Event Hall
//	3		Moongate
//	4		Skill Gain Spot
//	5		Dungeon Underworld
// 6		Dungeon Painted Caves
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// DO NOT MODIFY THESE LINES!
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const SKILLS = ['Alchemy', 'Anatomy', 'Animal Lore', 'Animal Taming', 'Archery', 'Arms Lore', 'Begging', 'Blacksmithy', 'Bowcraft/Fletching',
					   'Bushido', 'Camping', 'Carpentry', 'Cartography', 'Chivalry', 'Cooking', 'Detecting Hidden', 'Discordance', 'Evaluating Intelligence',
					   'Fencing', 'Fishing', 'Focus', 'Forensic Evaluation', 'Healing', 'Herding', 'Hiding', 'Imbuing', 'Inscription', 'Item Identification',
					   'Lockpicking', 'Lumberjacking', 'Magery', 'Meditation', 'Mining', 'Musicianship', 'Necromancy', 'Ninjitsu', 'Parrying', 'Peacemaking',
					   'Poisoning', 'Provocation', 'Remove Trap', 'Resisting Spells', 'Snooping', 'Spellweaving', 'Spirit Speak', 'Stealing', 'Stealth',
					   'Swordsmanship', 'Tactics', 'Tailoring', 'Tinkering', 'Tracking', 'Throwing', 'Veterinary', 'Wrestling', 'Mace Fighting', 'Taste Identification',
					   'Mysticism'];

const skillVars = ['Throwing', 'Chivalry', 'Necromancy', 'Healing', 'Anatomy', 'Tactics', 'Parrying', 'Spirit Speak'];

var initialSkillValues = { 'Throwing': Throwing, 'Chivalry': Chivalry, 'Necromancy': Necromancy, 'Healing': Healing, 'Anatomy': Anatomy, 'Tactics': Tactics, 'Parrying': Parrying, 'Spirit Speak': SpiritSpeak };

// Corrected skillFunctionMap to map skill names to their respective functions
var skillFunctionMap = { 
    'Throwing': ThrowingFunction, 
    'Chivalry': ChivalryFunction, 
    'Necromancy': NecromancyFunction, 
    'Healing': HealingFunction, 
    'Parrying': ParryingFunction, 
    'Spirit Speak': SpiritSpeakFunction,
    'Tactics': TacticsFunction     
};

var targetGraphics = '!0x0136|!0x000E|!0x00A4|!0x033D|!0x023E|!0x02B4|!0x002F|!0x004F|!0x0018';
var targetFlags = 'ignoreself|ignorefriends|live|inlos|near';
var targetRange = 10;
var targetNoto = 'gray|criminal|red|enemy|orange';
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Autostart Function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function Autostart(){
	FormRevert()
	Shared.AddVar('curTrain', 0)	
	GUITrainer()
	Orion.UseObject('backpack')
	Wait(2000)
	Orion.Exec('main', true)
	Scorecard()

}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Main Function
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function main() {
	if(!Orion.ScriptRunning('CheckAndSetStats')){;Orion.ToggleScript('CheckAndSetStats');};
	if(!Orion.ScriptRunning('keepActive')){;Orion.ToggleScript('keepActive');};
	if(!Orion.ScriptRunning('AutoScorecard')){;Orion.ToggleScript('AutoScorecard');};
	if(!Orion.ScriptRunning('checkSkillCap')){;Orion.ToggleScript('checkSkillCap');};	
	if(!Orion.ScriptRunning('GMScan')){;Orion.ToggleScript('GMScan');};		
    for (var i = 0; i < skillVars.length; i++) {
        var skillName = skillVars[i];
        var currentSkillValue = Orion.SkillValue(skillName, 'real') / 10; // Real skill value divided by 10
        // Compare current skill value with the initial one
		if (currentSkillValue < initialSkillValues[skillName]) {		
            runSkillFunction(skillName); // If the value changed, run the related function
        }
    }
    discoMessage("Completed.");
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Trainers
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ThrowingFunction(_internal) {
    Shared.AddVar('curTrain', 1)
    Recall('Underworld');
    Orion.WalkTo(4194,3262)
    step('North', 15);
    Orion.Wait(100);

    // Get the current skill level in Throwing
    var currentSkill = Orion.SkillValue('Throwing', 'real') / 10;

    // If skill is 50 or less, walk to the first training spot
    if (currentSkill <= 50) {
        Orion.WalkTo(1108, 1168, 0, 0, 255, 1);
        Orion.Print("Walking to training spot 1 (1108, 1168)");

        // Attack until the skill is more than 50
        while (currentSkill <= 50) {
            if (!Orion.ScriptRunning('AutoAttack')) {
                Orion.ToggleScript('AutoAttack');
            }
            Orion.Wait(1000); // Wait 1 second between checks
            currentSkill = Orion.SkillValue('Throwing', 'real') / 10; // Update skill value
            GUITrainer()
        }

        // Send a Discord message when the skill exceeds 50
        var playerName = Player.Name();
        var skillName = 'Throwing';
        var message = playerName + " has reached " + currentSkill + " in " + skillName + " on " + Orion.ShardName() + "!";
        discoMessage(message); // Send the message to Discord
    }

    // After skill exceeds 50, walk to the second training spot
    if (currentSkill > 50 && currentSkill < Throwing) {
        Orion.WalkTo(1104, 1193, 0, 1, 255, 1);
        Orion.Print("Walking to training spot 2 (1104, 1193)");

        // Continue training until skill reaches 120
        while (currentSkill < Throwing) {
            if (!Orion.ScriptRunning('AutoAttack')) {
                Orion.ToggleScript('AutoAttack');
            }
            Orion.Wait(1000); // Wait 1 second between checks
            currentSkill = Orion.SkillValue('Throwing', 'real') / 10; // Update skill value
            GUITrainer()
        }

        // Send a Discord message when the skill reaches 120
        var finalMessage = playerName + " has reached " + currentSkill + " in " + skillName + "!";
        discoMessage(finalMessage); // Send the message to Discord

        Orion.Print("Congratulations! Throwing skill has reached 120.");
        Orion.Terminate('AutoAttack');
        Recall('mint')
    }
}

function HealingFunction(_internal){
    Shared.AddVar('curTrain', 2)
    if(skillArea() == false){    
	    Recall('Skill');
	}
    Wait(2500);
   	Orion.WalkTo(5804, 3629, 14)
    var currentSkill = Orion.SkillValue('Healing', 'real') / 10;		   	
    LichForm()
    
    while (currentSkill < Healing) {
        // Get the full list of targets (including self)
        var fulllist = Orion.FindType("-1", "-1", 'ground', "live", 2, "green");
        var healtar = null;
        fulllist.push(Player.Serial());
        
        for (var i = 0; i < fulllist.length; i++) {
            if (healtar == null && Orion.FindObject(fulllist[i])) {
                var temptar = Orion.FindObject(fulllist[i]);
                healtar = temptar;
            } else {
                if (Orion.FindObject(fulllist[i])) {
                    var temptar = Orion.FindObject(fulllist[i]);
                    Orion.GetStatus(temptar.Serial());
                    Orion.GetStatus(healtar.Serial());
                    if (temptar.Hits() < healtar.Hits()) {
                        healtar = temptar;
                    }
                }
            }
        }

        var target = healtar;
        Orion.Wait(200);
        
        if (target != null) {
            if ((target.Poisoned() || target.Hits() < target.MaxHits()) && !Orion.BuffExists('healing skill') && target.Distance() <= 2) {
                Orion.BandageTarget(target.Serial());
                Orion.Wait(100);
                Orion.AddDisplayTimer('bandageFriend', Orion.BuffTimeRemaining('Healing Skill'), 'UnderChar', 'Circle', 'Heal', 0, 0, 'any', -1, '0x0000FFFE');
                Orion.DisplayTimerSetIcon('bandageFriend', 'Top', '0x0E21');
                Orion.Wait(500);
            }
        } else {
            Orion.Wait(200);
            if (Player.Hits() < Player.MaxHits()) {
                Orion.BandageSelf();
                Orion.Wait(100);
                Orion.AddDisplayTimer('bandageSelf', Orion.BuffTimeRemaining('Healing Skill'), 'UnderChar', 'Circle', 'Heal', 0, 0, 'any', -1, '0x0000FFFE');
                Orion.DisplayTimerSetIcon('bandageSelf', 'Top', '0x0E21');

                while (Orion.BuffExists('healing skill')) {
                    Orion.Wait(100);
                }
            }
        }
		
        // Check if Healing skill increased and is greater than or equal to the global Healing variable
        var currentSkill = Orion.SkillValue('Healing', 'real') / 10;
        if (currentSkill >= Healing) {
            // Send Discord message
            var playerName = Player.Name();
            var skillName = 'Healing';
            var message = playerName + " has reached " + currentSkill + " in " + skillName + " on " + Orion.ShardName() + "!";
            discoMessage(message); // Send the message to Discord

            // Update the global Healing variable to the new skill level
            Healing = currentSkill;
        }
		Orion.Wait(10)
	    var currentSkill = Orion.SkillValue('Healing', 'real') / 10;		
        GUITrainer()
        checkBandages()
    }
    FormRevert()
}

function ChivalryFunction(_internal) {
    Shared.AddVar('curTrain', 3)
    if(skillArea() == false){    
	    Recall('Skill');
	}
    Wait(2500);    
   	Orion.WalkTo(5804, 3629, 14)
    
    Orion.Print(30, "Make sure that you either have Tithing Points or 100% LRC built into your suit.");
    Orion.Print(40, "4/6 Casting is needed for optimum performance, but the script will adjust automatically");

    // Chivalry training spells at different skill levels (dictionary format renamed to ChivalryPath)
    var ChivalryPath = {
        45: 'Consecrate Weapon',
        60: 'Divine Fury',
        70: 'Enemy of One',
        90: 'Holy Light',
        120: 'Noble Sacrifice'
    };

    var currentSkill = Orion.SkillValue('Chivalry') / 10;
    var delay = 1000;
    var currentSpell = null;

    while (currentSkill < Chivalry) {
        for (var level in ChivalryPath) {
            var requiredSkill = parseFloat(level);  // Required skill level for the spell
            
            // Only cast the spell that corresponds to the current skill level and not the lower ones
            if (currentSkill < requiredSkill) {
                currentSpell = ChivalryPath[level];
                break;  // Exit the loop after selecting the current appropriate spell
            }
        }

        // Ensure that a spell has been selected based on the current skill
        if (currentSpell) {
            // Wait for mana recovery before casting
            while (Player.Mana() < 15) {
                Wait(5000);
            }

            // Ensure the player is not frozen before casting
            while (Player.Frozen()) {
                Orion.Wait(100);
            }

            Orion.Cast(currentSpell);
            Wait(delay);

            // Check for casting or recovery delays
            if (Orion.InJournal('already casting') != null || Orion.InJournal('not yet recovered') != null) {
                delay += 200;
                Orion.Wait(200);
                Orion.ClearJournal();
                continue;
            }
        }

        // Update the current skill after each cast
        currentSkill = Orion.SkillValue('Chivalry') / 10;
        GUITrainer()        
    }

    // Send a Discord message when the training is complete
    var playerName = Player.Name();
    var skillName = 'Chivalry';
    var finalSkillValue = Orion.SkillValue('Chivalry', 'real') / 10; // Divide by 10 to get the correct skill format

    var message = playerName + " has reached " + finalSkillValue + " in " + skillName + " on " + Orion.ShardName() + "!";
    discoMessage(message); // Send the message to Discord
    Recall('Mint');
}

function NecromancyFunction(_internal){
    Shared.AddVar('curTrain', 4)
    if(skillArea() == false){    
	    Recall('Skill');
	    Wait(2500);    
	   	Orion.WalkTo(5804, 3629, 14)		    
	}
    Orion.Print(30, "Wearing a good suit will greatly improve training. The most important property will be 100% Lower Reagent Cost to stop using reagents. Other desirable properties include: 40% Lower Mana Cost, 2 Faster Casting, 6 Faster Cast Recovery, and as much Mana Regeneration as possible.");
    
    FormRevert();
    Orion.Wait(3000);

    // Necromancy training spells at different skill levels (dictionary format)
    var NecromancyPath = {
        50: 'Wraith Form',
        70: 'Horrific Beast',
        90: 'Wither',
        99.0: 'Lich Form',
        120.0: 'Vampiric Embrace'
    };

    var currentSkill = Orion.SkillValue('Necromancy') / 10;
    var delay = 1250;
    var currentSpell = null;

    while (currentSkill < Necromancy) {
        // Loop through the dictionary and select the spell for the current skill level
        for (var level in NecromancyPath) {
            var requiredSkill = parseFloat(level);  // Required skill level for the spell
            
            // If the currentSkill is less than the required level, select the correct spell
            if (currentSkill < requiredSkill) {
                currentSpell = NecromancyPath[level];
                break;  // Exit loop after selecting the correct spell
            }
        }

        // Ensure a spell has been selected
        if (currentSpell) {
        	if (currentSpell == 'Wither'){
        		FormRevert()
        	}
            // Wait for mana recovery before casting
            while (Player.Mana() < 20) {
                Orion.Wait(1000);
            }

            // Ensure the player is not frozen before casting
            while (Player.Frozen()) {
                Orion.Wait(100);
            }

            Orion.Cast(currentSpell);

            // If a target is needed, target the player (self)
            if (Orion.HaveTarget()) {
                Orion.TargetObject('self');
            }

            Wait(delay);

            // Check for casting or recovery delays
            if (Orion.InJournal('already casting') != null || Orion.InJournal('not yet recovered') != null || Orion.InJournal('You cannot cast that spell') != null) {
                delay += 200;
                Orion.Wait(200);
                Orion.ClearJournal();
                continue;
            }

            // Low health check to heal
            if (Player.Hits() < 50) {
                Orion.Print('Low Health');
                Orion.UseSkill('Spirit Speak');
                Orion.Wait(delay);
            }

            // Update skill values after each loop iteration
            currentSkill = Orion.SkillValue('Necromancy') / 10;
            GUITrainer()            
        }
    }

    // Send a Discord message when the training is complete
    var playerName = Player.Name();
    var skillName = 'Necromancy';
    var finalSkillValue = Orion.SkillValue('Necromancy') / 10; // Format the skill value

    var message = playerName + " has reached " + finalSkillValue + " in " + skillName + " on " + Orion.ShardName() + "!";
    discoMessage(message); // Send the message to Discord

    // Completion message
    Recall('Mint');
}


function SpiritSpeakFunction(_internal) {
	delay = 500
    Shared.AddVar('curTrain', 5)
    if(skillArea() == false){    
	    Recall('Skill');
	    Wait(2500);    
	   	Orion.WalkTo(5804, 3629, 14)	  
	}
	LichForm()
	
    var skillCap = SpiritSpeak;
    
    var currentSkill = Orion.SkillValue('Spirit Speak', 'real')/10;
    // Training loop until skill reaches the cap
    while (currentSkill < skillCap) {
        // Update the skill values inside the loop
        currentSkill = Orion.SkillValue('Spirit Speak', 'real')/10;

        // Check if player has enough mana to cast
        if (Player.Mana() > 4 && !Player.Frozen()) {
            Orion.Cast('Curse Weapon');
            Wait(delay)
            GUITrainer()            
        } else {
            Orion.Wait(500);
        }
		if (Orion.InJournal('already casting') != null || Orion.InJournal('not yet recovered') != null) {
			delay += 200;
			Orion.Wait(200);
			Orion.ClearJournal();
			continue;
        }     
        Orion.Wait(100); 
    }
    var playerName = Player.Name();
    var skillName = 'Spirit Speak';
    var finalSkillValue = Orion.SkillValue('Spirit Speak', 'real') / 10; // Format the skill value

    var message = playerName + " has reached " + finalSkillValue + " in " + skillName + " on " + Orion.ShardName() + "!";
    discoMessage(message); // Send the message to Discord

    // Completion message
    Orion.Print(52, 'Spirit Speak training is completed!');
   // Recall('Mint');
}


function TacticsFunction(){
    Shared.AddVar('curTrain', 6)
}

function ParryingFunction(){
    Shared.AddVar('curTrain', 7)
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Various Functions
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function Recall(locationType) {
    var runicatlas = Orion.FindType('0x22C5', -1, 'backpack');
    var x = Player.X();
    var y = Player.Y();
	var FizzlesText = 'The spell fizzles';    

    var gumpHookMap = {
        'Mint': 75,
        'Event': 76,
        'Moongate': 77,
        'Skill': 78,
        'Underworld': 79
    };

    if (!gumpHookMap.hasOwnProperty(locationType)) {
        Orion.Print("Invalid location type specified.");
        return;
    }

    while (true) {
        var time = Orion.Now();
        Orion.UseObject(runicatlas);
        Wait(1250);  
        GumpAction('0x00000059', gumpHookMap[locationType], 1000, false);

        for (var i = 0; i < 5; i++) {
            if (x != Player.X() || y != Player.Y()) {
                return; // Successful recall, location changed
            } else if (Orion.InJournal(FizzlesText, 'my|sys', '0', '0xFFFF', time, Orion.Now()) != null) {
                break; // Fizzle detected, attempt recall again
            }
            Wait(2000);
        }
        Wait(1000);
    }
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

function Wait(delay) {
    Orion.AddDisplayTimer('wait', delay, 'AboveChar', 'circle|bar', 'Waiting', 0, 100, '1151', 4, '0x90FF90FF');
    Orion.Wait(delay);
}

function runSkillFunction(skillName) {
    // Check if the function exists in the map
    if (skillFunctionMap.hasOwnProperty(skillName)) {
        skillFunctionMap[skillName](); // Call the corresponding function
    } else {
        Orion.Print("No function found for skill: " + skillName);
    }
}

function step(direction, times) {
    for (var g = 0; g < times; g++) {
        Orion.Print('Stepping ' + direction + '!');
        Orion.Step(direction);
        Orion.Wait(200);
    }
}

function AutoAttack(_internal) {
    while (!Player.Dead()) {
    	var useLootCorpses = Shared.GetVar('useLootCorpses')
        var arr = Orion.FindTypeEx(-1, 'any', 'ground', targetFlags, targetRange, targetNoto);
        if (arr.length > 0) {
            arr.sort(function(a, b) { return a.Distance() - b.Distance(); });

            // Iterate through sorted targets to find the first non-summoned target
            for (var i = 0; i < arr.length; i++) {
                var target = arr[i];
                var targetObject = Orion.FindObject(target.Serial());
                if (!targetObject) continue; // Skip if the target object is not found

                var targetProperties = targetObject.Properties();
                if (!isSummoned(targetProperties)) { // Check if not summoned
                    var closestTargetSerial = target.Serial();
                    
                    Orion.AddHighlightCharacter(closestTargetSerial, 0x0AC3, true);
                    Orion.ShowStatusbar(closestTargetSerial, 0, 0);
                    Orion.CharPrint(closestTargetSerial, 52, '*Target*'); // Display 'Target' on the GUI
                    
                    while (Orion.ObjectExists(closestTargetSerial) && !Player.Dead()) {
                        var currentTargetObject = Orion.FindObject(closestTargetSerial);
                        if (currentTargetObject) {
                           // Orion.Print('Attacking: ' + currentTargetObject.Name());
                            Orion.Wait(100)
                        } else {
                          //  Orion.Print('Target lost, searching for a new target...');
                            Orion.Wait(100)                            
                            break;
                        }

                        Orion.Attack(closestTargetSerial);
                        Orion.Wait(100);
                        
                        arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetRange, targetNoto);
                        if (arr.length > 0) {
                            arr.sort(function(a, b) { return a.Distance() - b.Distance(); });
                            if (arr[0].Serial() !== closestTargetSerial) {
                                Orion.Print('New closer target found, changing target.');
                                closestTargetSerial = arr[0].Serial();
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    Orion.CloseStatusbar('all');  
                    Orion.Wait(100);
                    break; // Exit the for-loop after handling the first valid target
                }
            }
        } else {
            Orion.Wait(100);
        }
    }
}

function isSummoned(properties) {
    return properties.indexOf('(summoned)') !== -1;
}

function walkToRandomLocation(xMin, xMax, yMin, yMax) {
    // Generate a random X and Y within the bounds
    var randomX = xMin + Math.floor(Math.random() * (xMax - xMin + 1));
    var randomY = yMin + Math.floor(Math.random() * (yMax - yMin + 1));

    // Print the target location for debugging
    Orion.Print("Walking to random location: " + randomX + ", " + randomY);

    // Walk to the randomly generated location
    Orion.WalkTo(randomX, randomY, 14, 1, 255, 1, true, true);
}

function FormRevert(_internal){
	if (Orion.BuffExists('Horrific Beast')){;while (Orion.BuffExists('Horrific Beast')){;Orion.Print(90, "Removing the current form.");Orion.Cast('Horrific Beast');Orion.Wait(3000);}}
	if (Orion.BuffExists('Wraith Form')){;while (Orion.BuffExists('Wraith Form')){;Orion.Print(90, "Removing the current form.");Orion.Cast('Wraith Form');Orion.Wait(3000);}}
	if (Orion.BuffExists('Lich Form')){;while (Orion.BuffExists('Lich Form')){;Orion.Print(90, "Removing the current form.");Orion.Cast('Lich Form');Orion.Wait(3000);}}
	if (Orion.BuffExists('Vampiric Embrace')){;while (Orion.BuffExists('Vampiric Embrace')){;Orion.Print(90, "Removing the current form.");Orion.Cast('Vampiric Embrace');Orion.Wait(3000);}}			
}

function CheckAndSetStats(_internal) {
    while (true) {
        // Get current stat values
        var currentStr = Player.Str();
        var currentDex = Player.Dex();
        var currentInt = Player.Int();

        // Check if all stats match their max values
        if (currentStr == maxStr && currentDex == maxDex && currentInt == maxInt) {
            Orion.Print("All stats have reached their maximum values. Stopping the script.");
            break; // Break the loop if all stats are at their max
        }

        // Check Strength (Str)
        if (currentStr > maxStr) {
            Orion.SetStatStatus('Str', 'Down');  // Set Strength to Down if greater than max
        } else if (currentStr == maxStr) {
            Orion.SetStatStatus('Str', 'Lock');  // Lock Strength if equal to max
        } else {
            Orion.SetStatStatus('Str', 'Up');    // Set Strength to Up if less than max
        }

        // Check Dexterity (Dex)
        if (currentDex > maxDex) {
            Orion.SetStatStatus('Dex', 'Down');  // Set Dexterity to Down if greater than max
        } else if (currentDex == maxDex) {
            Orion.SetStatStatus('Dex', 'Lock');  // Lock Dexterity if equal to max
        } else {
            Orion.SetStatStatus('Dex', 'Up');    // Set Dexterity to Up if less than max
        }

        // Check Intelligence (Int)
        if (currentInt > maxInt) {
            Orion.SetStatStatus('Int', 'Down');  // Set Intelligence to Down if greater than max
        } else if (currentInt == maxInt) {
            Orion.SetStatStatus('Int', 'Lock');  // Lock Intelligence if equal to max
        } else {
            Orion.SetStatStatus('Int', 'Up');    // Set Intelligence to Up if less than max
        }
        Orion.Wait(5000); // Adjust the delay as needed for how frequently you want to check
    }
}

function checkSkillCap(){
    var totalSkillValue = 0; // Initialize sum
	while (true){
	    var totalSkillValue = 0; // Initialize sum	
	    // Loop through all the skills in the SKILLS array
	    for (var i = 0; i < SKILLS.length; i++) {
	        // Get the 'real' skill value (divide by 10 because it's multiplied in-game)
	        var skillValue = Orion.SkillValue(SKILLS[i], 'real') / 10;
	
	        // Add to the total sum
	        totalSkillValue += skillValue;
	    }
	
	    // Return or print the total skill value
		if (totalSkillValue == 720.0){
			SetSkillDirection()
			Orion.Terminate('checkSkillCap')
		}
		Orion.Wait(15000)
	}
}

function discoMessage(theMessage){
  // Get player name and shard name
  var charName = Player.Name();
  var shardName = Orion.ShardName();
  
  // Combine both to form the username
  var combinedName = charName + " [" + shardName + "]";
  
  // Prepare the message parameter
  var paramText = "username=" + combinedName + "&content= " + theMessage;
  
  // Send the HTTP POST request
  Orion.Wait(200);
  Orion.HttpPost(discordHook, paramText);
}

function GrabBandages(_internal){
	Recall('Mint')
	Wait(2500)
	Orion.WalkTo(989,522,0)
	Orion.Say('bank')
	Wait(1500)
	bankbox = Player.BankSerial()
	bandages = Orion.FindType('0x0E21', -1, bankbox)
	
	if (bandages.length > 0){
		Orion.MoveItem(bandages, maxWeight(), 'backpack')
		Wait(3000)
		Recall('Skill')	
	    Wait(2500);
	   	Orion.WalkTo(5804, 3629, 14)
	}		
}

function checkBandages(_internal){
	bandages = '0x0E21'
	if(Orion.Count(bandages, -1, 'backpack') == 0){
		GrabBandages()
	}
}

function LichForm(_internal){
	while (!Orion.BuffExists('Lich Form')){
		Orion.Cast('Lich Form')
		Orion.Wait(4000)
	}		
}

function keepActive(_internal){
	while (true) {
		Orion.OpenContainer('backpack');
		Orion.AddDisplayTimer('40000', 40000, 'Top', 'Rectangle|Bar', 'Keep Active', 0,0);
		Orion.Wait(40000);
	}
}

function Scorecard(_internal) {
//    discoMessage(Player.Name() + ' - ' + Orion.ShardName());
    discoMessage('-----------------------------------------------');

    // Throwing
    discoMessage('Throwing: ' + Orion.SkillValue('Throwing') / 10 + 
        (Shared.GetVar('curTrain') == 1 ? '      `*Active*` ' : ''));

    // Chivalry
    discoMessage('Chivalry: ' + Orion.SkillValue('Chivalry') / 10 + 
        (Shared.GetVar('curTrain') == 3 ? '       `*Active*` ' : ''));

    // Necromancy
    discoMessage('Necromancy: ' + Orion.SkillValue('Necromancy') / 10 + 
        (Shared.GetVar('curTrain') == 4 ? '      `*Active*` ' : ''));

    // Healing
    discoMessage('Healing: ' + Orion.SkillValue('Healing') / 10 + 
        (Shared.GetVar('curTrain') == 2 ? '      `*Active*` ' : ''));

    // Anatomy
    discoMessage('Anatomy: ' + Orion.SkillValue('Anatomy') / 10 + 
        (Shared.GetVar('curTrain') == 6 ? '      `*Active*` ' : ''));

    // Tactics
    discoMessage('Tactics: ' + Orion.SkillValue('Tactics') / 10 + 
        (Shared.GetVar('curTrain') == 7 ? '      `*Active*` ' : ''));

    // Spirit Speak
    discoMessage('Spirit Speak: ' + Orion.SkillValue('Spirit Speak') / 10 + 
        (Shared.GetVar('curTrain') == 5 ? '      `*Active*` ' : ''));

    // Parrying (if greater than 0)
    if (Orion.SkillValue('Parrying') > 0) {
        discoMessage('Parrying: ' + Orion.SkillValue('Parrying') / 10 + 
            (Shared.GetVar('curTrain') == 8 ? '      `*Active*` ' : ''));
    }

    discoMessage('-----------------------------------------------');
}

function AutoScorecard(_internal) {
	while (true) {
	    // Display the scorecard timer
	    Orion.AddDisplayTimer('scorecard', 3600000, 'Bottom', 'rectangle|bar', 'Scorecard', 0, 0, '1151');
	    
	    // Generate a random delay between 45 minutes (2700000 ms) and 60 minutes (3600000 ms)
	    var minTime = 2700000; // 45 minutes in milliseconds
	    var maxTime = 3600000; // 60 minutes in milliseconds
	    var randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime; // Random time between 45 and 60 minutes
	    // Wait for the random amount of time
	    Orion.Wait(randomTime);
	    
	    // Call the Scorecard function after the wait
	    Scorecard();
	}
}


function SetSkillDirection(_internal) {
    var i, j;

    // Loop through skillVars and set the status based on skill values
    for (i = 0; i < skillVars.length; i++) {
        var skillName = skillVars[i]; 
        var skillValue = initialSkillValues[skillName]; // Get the skill value from the initialSkillValues object

        if (skillValue > 0) {
            Orion.SetSkillStatus(skillName, 'Up'); // Set skill to 'Up' if value > 0
        } else {
            Orion.SetSkillStatus(skillName, 'Down'); // Set skill to 'Down' if value <= 0
        }
    }

    // Loop through all SKILLS and ensure all other skills not in skillVars are set to 'Down'
    for (j = 0; j < SKILLS.length; j++) {
        var skill = SKILLS[j];
        var found = false;

        // Check if the current skill is in skillVars
        for (i = 0; i < skillVars.length; i++) {
            if (skillVars[i] === skill) {
                found = true;
                break;
            }
        }

        // If the skill is not in skillVars, set its status to 'Down'
        if (!found) {
            Orion.SetSkillStatus(skill, 'Down');
        }
    }
}


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// GUI Setup
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// DO NOT MODIFY THESE LINES!
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function GUITrainer() {
    Shared.AddVar('selector', 2);
    Orion.Wait(100);
    var g = Orion.CreateCustomGump(101099);
    g.Clear();
    g.SetCallback('OnClick');
    var width = 8;
    var height = 9
    if (Parrying == 0){;height-=1;};
    var cellSize = 35;

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
   
    g.AddLine(23.5, prompt + 5, 253.5, prompt + 5, 'white', 2);
    prompt += 10;

    g.AddText(25, prompt + 5, 1152, 'Skill Name');
    g.AddText(155, prompt + 5, 1152, 'Real');
    g.AddText(215, prompt + 5, 1152, 'Cap'); 
    prompt += 30;          
    g.AddLine(23.5, prompt + 5, 253.5, prompt + 5, 'white', 2);
    prompt += 10;  
    
    g.AddText(25, prompt + 5, CurrentSkill(1), 'Throwing');
    g.AddText(155, prompt + 5, 1152, Orion.SkillValue('Throwing')/10)
    g.AddText(215, prompt + 5, 1152, Throwing);   
    prompt += 20; 
    
    g.AddText(25, prompt + 5, CurrentSkill(3), 'Chivalry');
    g.AddText(155, prompt + 5, 1152, Orion.SkillValue('Chivalry')/10)
    g.AddText(215, prompt + 5, 1152, Chivalry);   
    prompt += 20;                       

    g.AddText(25, prompt + 5, CurrentSkill(4), 'Necromancy');
    g.AddText(155, prompt + 5, 1152, Orion.SkillValue('Necromancy')/10)
    g.AddText(215, prompt + 5, 1152, Necromancy);   
    prompt += 20;
    
    g.AddText(25, prompt + 5, CurrentSkill(2), 'Healing');
    g.AddText(155, prompt + 5, 1152, Orion.SkillValue('Healing')/10)
    g.AddText(215, prompt + 5, 1152, Healing);   
    prompt += 20;    
    
    g.AddText(25, prompt + 5, CurrentSkill(6), 'Anatomy');
    g.AddText(155, prompt + 5, 1152, Orion.SkillValue('Anatomy')/10)
    g.AddText(215, prompt + 5, 1152, Anatomy);   
    prompt += 20;        
    
    g.AddText(25, prompt + 5, CurrentSkill(7), 'Tactics');
    g.AddText(155, prompt + 5, 1152, Orion.SkillValue('Tactics')/10)
    g.AddText(215, prompt + 5, 1152, Tactics);   
    prompt += 20;    
    
    g.AddText(25, prompt + 5, CurrentSkill(5), 'Spirit Speak');
    g.AddText(155, prompt + 5, 1152, Orion.SkillValue('Spirit Speak')/10)
    g.AddText(215, prompt + 5, 1152, SpiritSpeak);   
    prompt += 20;     
    if (Parrying == 0){;prompt+=3;};
    
    if (Parrying > 0){
    g.AddText(25, prompt + 5, CurrentSkill(8), 'Parrying');
    g.AddText(155, prompt + 5, 1152, Orion.SkillValue('Parrying')/10)
    g.AddText(215, prompt + 5, 1152, Parrying);   
    prompt += 25
    };      
         
    g.AddLine(23.5, prompt + 5, 253.5, prompt + 5, 'white', 2);    
	prompt += 10 
    if (Parrying == 0){;prompt-=4;};	
	
    g.AddText(25, prompt + 5, 1152, 'Totals:');
    g.AddText(155, prompt + 5, 1152, (Orion.SkillValue('Throwing')+Orion.SkillValue('Chivalry')+Orion.SkillValue('Necromancy')+Orion.SkillValue('Healing')+Orion.SkillValue('Anatomy')+Orion.SkillValue('Tactics')+Orion.SkillValue('Spirit Speak')+Orion.SkillValue('Parrying'))/10)
    g.AddText(215, prompt + 5, 1152, Throwing+Chivalry+Necromancy+Healing+Anatomy+Tactics+SpiritSpeak+Parrying);   
                 
    var guiWidth = width * cellSize;
    var text = " One Shot Thrower Trainer";
    var averageCharWidth = 7; // Adjust this value based on your font and size
    var centeredX = CalculateCenteredX(guiWidth, text, averageCharWidth);
    g.AddText(centeredX, 10, 1152, text, 0);
    
    g.AddButton(86, 250, 12, '0x67D', '0x67D', '0x67D', '1153');

    g.AddButton(87, 15, 12, '0x67D', '0x67D', '0x67D', '1153');    

    g.Update();
}

function maxWeight(_internal){
	var weight = (Player.MaxWeight()- Player.Weight()) * 10
	return weight
}

function GMScan() {
    var useDiscordPush = true //profile.useDiscordPush;
    var useAlarmSound = true //profile.useAlarmSound;
    var closeUO = false;
    var timeStamp = 0;
    var gmCheck;
    while (true) {
        gmCheck = Orion.FindTypeEx(any, any, ground, 'mobile', 10, 'yellow').filter(function (mob) {
            return mob.Properties().indexOf('GM ') > -1;
        }).length || Orion.InJournal('GM ', 'sys', '0', 'any', timeStamp - 500, Orion.Now() + 1000);
        timeStamp = Orion.Now();
        if (gmCheck) {
            if (useDiscordPush)
                DiscordPush(Player.Name() + ": GM");
            if (useAlarmSound)
                Orion.PlayWav('GMAlert.wav'); //default sound can be changed by putting a different .wav in the Ultima Online Classic folder.
            Orion.PauseScript('all', 'GMScan');
            Orion.Wait(500);
            Orion.Terminate('all', 'GMScan');
            Orion.StopWalking();
            Orion.Wait(5000);
            if (closeUO) {
                Orion.OAOptionSet('AutoReconnect', '0');
                Orion.CloseUO();
            }
        }
        Orion.Wait(3000);
    }
}

function DiscordPush(message) {
    var bot = Orion.RegRead('discordConfig') || SetDiscordRegistryEntry();
    Orion.HttpPost(bot, "content=" + message);
}

function SetDiscordRegistryEntry() {
    var hook = "" //profile.discordHook;
    var key = "" //profile.discordKey;
    var discordConfig = 'https://discord.com/api/webhooks/1286433815123853342/B_0UpddlxlWTrpV8Rzo3AOHN4iDuPd5GftfzGWaXsHTuYcA0-xUIXQFb7c0o43MgyEUN' 
    var registryName = 'discordConfig';
    Orion.RegWrite(registryName, discordConfig);
    return discordConfig;
}


function skillArea(_internal) {
    // Hardcoded area coordinates
    var topLeftX = 5796;
    var topLeftY = 3623;
    var bottomRightX = 5814;
    var bottomRightY = 3638;

    // Get the player's current position
    var playerX = Player.X();
    var playerY = Player.Y();

    // Check if the player's coordinates are within the hardcoded area
    if (playerX >= topLeftX && playerX <= bottomRightX && playerY >= topLeftY && playerY <= bottomRightY) {
        return true;  // Inside the area
    } else {
        return false; // Outside the area
    }
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// GUI Cases
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function OnClick(_internal){
	var buttonID = CustomGumpResponse.ReturnCode();

	switch(buttonID){
	
    case 1000:
        var location = Shared.GetVar('location');
        if (location === 'centaur') {
            Shared.AddVar('location', 'none');
        } else {
            Shared.AddVar('location', 'centaur');
	        GUIArrows();            
	        RunDown();            
        }
        GUIArrows();
        break;

    case 1001:
        var location = Shared.GetVar('location');
        if (location === 'rat') {
            Shared.AddVar('location', 'none');
        } else {
            Shared.AddVar('location', 'rat');
	        GUIArrows();	            
	        RunDown2();
        }
        GUIArrows();
        break;			    								
	}
}

function CalculateCenteredX(guiWidth, text, averageCharWidth) {
    var textWidth = text.length * averageCharWidth;
    return (guiWidth - textWidth) / 2;
}

function UpdateGUIStatus(msg) {
  var currentMessage = Orion.GetGlobal('gui_status');
  if (currentMessage == msg) {
    return;
  }
  Orion.SetGlobal('gui_status', msg);
	GUIArrows()
}

function CurrentSkill(skill) {
    var color;

    // Check for specific skill based on input number and assigned global variables
    if (skill == 1 && Orion.SkillValue('Throwing')/10 == Throwing) {
        color = 74;  // Assign color if Throwing is passed through and skill is matched
    } else if (skill == 2 && Orion.SkillValue('Healing')/10 == Healing) {
        color = 74;  // Healing
    } else if (skill == 3 && Orion.SkillValue('Chivalry')/10 == Chivalry) {
        color = 74;  // Chivalry
    } else if (skill == 4 && Orion.SkillValue('Necromancy')/10 == Necromancy) {
        color = 74;  // Necromancy
    } else if (skill == 5 && Orion.SkillValue('Spirit Speak')/10 == SpiritSpeak) {
        color = 74;  // Spirit Speak
    } else if (skill == 6 && Orion.SkillValue('Anatomy')/10 == Anatomy) {
        color = 74;  // Anatomy
    } else if (skill == 7 && Orion.SkillValue('Tactics')/10 == Tactics) {
        color = 74;  // Tactics
    } else if (skill == 8 && Orion.SkillValue('Parrying')/10 == Parrying) {
        color = 74;  // Parrying
    } else {
        color = 33;  // Default color if no match is found
    }
    // Compare current training skill
    curSkill = Shared.GetVar('curTrain');
    
    if (curSkill == skill) {
        color = 55;  // Override color if it's the current training skill
    }

    return color;
}