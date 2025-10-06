//-------------------------------------------------------------------------------------------------------------------------------------------------||
// Guardian of Justice — v1.00
// Author: LavaLynk
// Description: Stealthy utility that listens for journal commands and performs rapid support actions:
//              • !res     → Locate nearby ghost, cast Resurrection, confirm gump, then double Greater Heal.
//              • !justice → Gift of Life → Undress → self-sacrifice → auto-accept res gump → redress → Protection.
//              • !heal    → Chain Greater Heal until full HP, with progress feedback.
//              • !kill    → Mind Blast loop on nearest valid target.
// Autostart:   Autostart() launches autoHidden (maintains Hiding & opens backpack) and journalCommandHandler().
// Helpers:     SetDress(), GetDress(), getPlayerNameWithoutTitle(), isTargetAlive(), GumpAction().
// Notes:       Ensure journal captures normal chat; adjust ranges/IDs to shard rules.
// Last Updated: 2025-10-05
//-------------------------------------------------------------------------------------------------------------------------------------------------||


//-------------------------------------------------------------------------------------------------------------------------------------------------||
// AUTOSTART
//-------------------------------------------------------------------------------------------------------------------------------------------------||
function Autostart(){
	Orion.Exec("autoHidden", true)
	Orion.Exec("journalCommandHandler", true)
}
//-------------------------------------------------------------------------------------------------------------------------------------------------||
// CORE FUNCTIONS
//-------------------------------------------------------------------------------------------------------------------------------------------------||
function autoHidden() {
    Orion.Print("Starting auto-hidden script...");

    while (true) {
        // If the player is not hidden, attempt to hide
        if (!Player.Hidden()) {
            Orion.UseSkill('Hiding');
            Orion.Print("Attempting to hide...");
            
            // Wait for 15 seconds
            Orion.Wait(15000);

            // Check if hiding was successful
            if (Player.Hidden()) {
                Orion.Print("You are now hidden.");
            } else {
                Orion.Print("Failed to hide. Retrying...");
            }
        } else {
            Orion.Print("You are already hidden.");
        }

        // Short wait before re-checking (prevents spamming too frequently)
        Orion.Wait(5000);
		Orion.UseObject("backpack")        
    }
}

function journalCommandHandler() {
    Orion.Print("Starting journal-based command handler...");
	SetDress()    
	Orion.ClearJournal()
    while (true) {
        // Check for specific commands in the journal with appropriate flags
        if (Orion.InJournal('!res', 'normal')) {
            Orion.Print("Processing: !res command");
            Orion.ClearJournal('!res', 'normal'); // Clear the specific entry after handling            
            handleResCommand();
        }

        if (Orion.InJournal('!justice', 'normal')) {
            Orion.Print("Processing: !justice command");
            Orion.ClearJournal('!justice', 'normal'); // Clear the specific entry after handling            
            handleJusticeCommand();
        }

        if (Orion.InJournal('!heal', 'normal')) {
            Orion.Print("Processing: !heal command");
            Orion.ClearJournal('!heal', 'normal'); // Clear the specific entry after handling
            handleHealCommand();
        }

        if (Orion.InJournal('!kill', 'normal')) {
            Orion.Print("Processing: !kill command");
            Orion.ClearJournal('!kill', 'normal'); // Clear the specific entry after handling
            handleKillCommand();
        }

        // Short wait before re-checking
        Orion.Wait(500);
    }
}

// Individual command handlers
function handleResCommand() {
    Orion.Say("Resurrection requested!");

    // Find the first nearby ghost within 1 tile
    var ghost = Orion.FindType(-1, -1, 'ground', 'dead|human|ignoreself', 1); // Only dead, human players within 1 tile

    if (ghost.length > 0) {
        var ghostSerial = ghost[0];
        var ghostObject = Orion.FindObject(ghostSerial);
        var ghostName = ghostObject ? ghostObject.Name() : "Unknown";

        Orion.Say("Attempting to resurrect: " + ghostName);

        // Cast Resurrection and retry if it fizzles
        while (Orion.ObjectExists(ghostSerial) && Orion.FindObject(ghostSerial).Dead()) {
            // Cast the Resurrection spell
            Orion.Cast('Resurrection');
            Orion.WaitForTarget(3000); // Wait for the target UI to appear
            Orion.TargetObject(ghostSerial);
            Orion.Wait(2000); // Small delay before checking the result

            // Check the journal for success or fizzle
            if (Orion.InJournal('fizzles') !== -1) {
                Orion.ClearJournal('fizzles');
                Orion.Say("Resurrection fizzled! Retrying...");
            } else {
                Orion.Say("Resurrection cast successfully.");
                break; // Exit the loop on successful cast
            }
        }

        // Wait for the player to come back to life
        Orion.Say("Waiting for the player to resurrect...");
        while (Orion.ObjectExists(ghostSerial) && Orion.FindObject(ghostSerial).Dead()) {
            Orion.Wait(1000); // Check every second
        }

        Orion.Say("Player resurrected! Healing...");

        // Cast Greater Heal on the player twice
        for (var i = 0; i < 2; i++) {
            Orion.Cast('Greater Heal');
            Orion.WaitForTarget(3000); // Wait for the target UI to appear
            Orion.TargetObject(ghostSerial);
            Orion.Wait(2000); // Small delay before the next heal
        }

        Orion.Say("Healing complete.");
    } else {
        Orion.Say("No ghost found within 1 tile.");
    }
}



function handleJusticeCommand() {
    Orion.Say("Justice requested!");
	Orion.Terminate("autoHidden")
    // Cast "Gift of Life" on self
    Orion.Cast("Gift of Life");
    Orion.WaitForTarget(10000);
    Orion.TargetObject('self');
    Orion.Wait(500);

    // Check if the buff is active
    if (Orion.BuffExists("Gift of Life")) {
        // Random funny sayings
        var sayings = [
            "I'm ready to meet my maker!",
            "Let's make this quick, please.",
            "Justice awaits my soul!",
            "Alright, who's gonna do the honors?",
            "One life to lose for Justice!",
            "Time to embrace the void!",
            "I'm ready for the big sleep!",
            "Anyone got a good tombstone quote?",
            "Don't miss, I won't judge!",
            "This is gonna hurt... for a second.",
            "Remember me as a hero!",
            "Aim for the head, please.",
            "Alright, end me already!",
            "I hope this works... gulp!",
            "Just another day serving Justice!"
        ];
        var randomIndex = Math.floor(Math.random() * sayings.length);
        Orion.Say(sayings[randomIndex]); // Randomly select and say a funny line
    }

    // Undress the player
    Orion.Say("Time to undress for Justice...");
    Orion.Undress();
    Orion.Wait(1000); // Small wait to ensure undressing is complete

    // Wait for death
    Orion.Say("Now I wait for death...");
    while (!Player.Dead()) {
        Orion.Wait(1500);
    }

    // Wait for the resurrection gump and confirm
    while (Player.Dead()) {
        if (Orion.WaitForGump(10000)) {
            var gump = Orion.GetGump('last');
            if ((gump !== null) && (!gump.Replayed()) && (gump.ID() === '0x000008AF')) {
                gump.Select(Orion.CreateGumpHook(2)); // Select the resurrection option
                Orion.Wait(100); // Small delay
            }
        }
        Orion.Wait(500); // Check again after a short wait
    }

    // Player is alive
    var aliveSayings = [
        "I'm back and better than ever!",
        "That was refreshing!",
        "Death couldn't hold me!",
        "Guess who's back? Back again!",
        "Resurrection complete, let's roll!",
        "I live to fight another day!",
        "Miss me? I'm alive again!",
        "That was a close one!",
        "I'm up and running!",
        "You can't keep me down for long!",
        "Here we go again!",
        "That wasn't so bad after all!",
        "I'm alive, time to fight!",
        "Death was just a nap!",
        "I'm back, and I'm unstoppable!"
    ];
    var randomAliveIndex = Math.floor(Math.random() * aliveSayings.length);
    Orion.Say(aliveSayings[randomAliveIndex]); // Randomly select and say a funny line
    Orion.Wait(2000);

    // Get dressed using your GetDress() function
    Orion.Say("Getting dressed...");
    GetDress();
    Orion.Wait(2000);

    // Cast Protection
    Orion.Say("Casting Protection...");
    Orion.Cast("Protection");
    Orion.Wait(1000); // Wait a moment to ensure the spell is cast

    Orion.Say("Justice fulfilled and ready to fight again!");
    Orion.Wait(1500)
    Orion.Exec("autoHidden", true)
}


function handleHealCommand() {
    Orion.Say("Healing requested!");

    // Continuously heal until the player's health is full
    while (Player.Hits() < Player.MaxHits()) {
        // Cast Greater Heal
        Orion.Cast('Greater Heal');
        Orion.WaitForTarget(3000); // Wait for the target UI to appear
        Orion.Wait(2000); // Small delay before checking health again

        // Provide feedback on current health
        var healthPercentage = Math.floor((Player.Hits() / Player.MaxHits()) * 100);
        Orion.Say("Healing... Current health: " + healthPercentage + "%");

        // Safety break to avoid infinite loops (optional, can adjust the iteration limit)
        if (Player.Hits() === 0) {
            Orion.Say("Something went wrong, I'm dead!");
            break;
        }
    }

    // Final message when fully healed
    Orion.Say("Fully healed and ready!");
}


function handleKillCommand() {
    Orion.Say("Kill requested!");

    // Find the first nearby blue (innocent) 
    var target = Orion.FindType(-1, -1, 'ground', 'live|inlos|ignoreself|near', 10, 'blue'); // Notoriety: 1 = blue, 5 = orange
    Orion.Print(target);

    if (target.length > 0) {
        var targetSerial = target[0];
        var targetObject = Orion.FindObject(targetSerial);
        var targetName = targetObject ? targetObject.Name() : "Unknown";

        Orion.Say("Attacking target: " + targetName);

        // Enter a loop to continuously cast Mind Blast while the target is valid
        while (Orion.ObjectExists(targetSerial) && isTargetAlive(targetSerial)) {
            Orion.Cast('Mind Blast');
            Orion.WaitForTarget(3000); // Wait for target UI to appear
            Orion.TargetObject(targetSerial);
            Orion.Wait(2000); // Wait before casting again
        }

        Orion.Say("Target is dead.");
    } else {
        Orion.Say("No target found for the kill command.");
    }
}

// Helper function to check if the target is alive
function isTargetAlive(targetSerial) {
    var targetObject = Orion.FindObject(targetSerial);
    if (!targetObject) return false; // Target no longer exists
    if (targetObject.Notoriety() === 3) return false; // Notoriety 3 = gray/corpse
    if (targetObject.Hits() <= 0) return false; // Dead or non-functional
    return true; // Otherwise, target is alive
}

function SetDress() {
  var layers = [
    "None", // Placeholder for index 0
    "RightHand",
    "LeftHand",
    'Shoes',
    "Pants",
    'Shirt',
    'Helmet',
    'Gloves',
    'Ring',
    'Talisman',
    'Necklace',
    'Hair',
    'Waist',
    'InnerTorso',
    'Bracelet',
    'Face',
    'Beard',
    'MidTorso',
    'Earrings',
    'Arms',
    'Cloak',
    'Backpack',
    'Robe',
    'Eggs',
    'Legs',
  ];
  var dress = [];
  for (var i = 1; i < layers.length; i++) {
    var obj = Orion.ObjAtLayer(i);
    if (obj) {
      var serial = obj.Serial();
      dress.push(serial); // Push serial to the dress array
    }
  }
	Orion.SetDressList(getPlayerNameWithoutTitle() + " - " + Orion.ShardName(), dress); // Set the dress list using the dress array
	Orion.Print('Dress Set!')
}

function GetDress(){
	Orion.Dress(getPlayerNameWithoutTitle() + " - " + Orion.ShardName())
	Orion.Print('Equipping Gear...')
}

function getPlayerNameWithoutTitle() {
    var playerName = Player.Name(); // Get the player's name
    if (!playerName) {
        Orion.Print("Player name not found.");
        return "";
    }

    // Remove "Lady" or "Lord" from the start of the name, case-insensitive
    var cleanedName = playerName.replace(/^(Lady|Lord)\s+/i, "");
    return cleanedName;
}