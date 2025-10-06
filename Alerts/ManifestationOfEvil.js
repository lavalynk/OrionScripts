//------------------------------------------------------------------------------------------------------------------------------------------
// Manifestation of Evil — Town Crier Monitor v1.00
// Author: LavaLynk
// Description: Automates detection of Town Crier alerts announcing undead invasions for the Manifestation of Evil event.  
//              The script continuously listens for valid crier broadcasts, filters out generic buildup messages,  
//              identifies the invaded town, and sends the result to a configured Discord webhook.
//
// Core Functions:
//   • Autostart()              – Initializes looping check and resets current town variable.
//   • handleCrierMessages()    – Locates nearby Town Criers, reads journal updates, and processes event triggers.
//   • CatchTown()              – Extracts the invaded town name from crier text.
//   • discoMessage()           – Sends formatted event updates (character + shard + town) to Discord.
//   • runEveryThirtyMinutes()  – Repeats scanning cycle on a 30-minute schedule.
//
// Notes:
//   – Configure your Discord webhook in `discordHook` before running.  
//   – Requires journal logging enabled for Town Crier messages.  
//   – The script automatically walks to and away from crier NPCs between attempts.  
//   – Safe to run in background — minimal performance impact.
//
// Last Updated: 2025-10-05
//------------------------------------------------------------------------------------------------------------------------------------------
var discordHook = '0' // Set Discord Webhook here

function Autostart(){
	Orion.Exec("runEveryThirtyMinutes", true)
	Shared.AddVar("curTown", " ")
}


// Main function to handle Town Crier messages
function handleCrierMessages() {
    var intReturn = 0;
    const maxAttempts = 5;

    // Define the array of unwanted messages
    const messages = [
        "The land stirs, but the evil remains distant.",
        "Faint whispers of darkness echo beneath the surface.",
        "The ground trembles as the presence of evil grows stronger.",
        "A shadow looms over the land, heralding the coming of great darkness.",
        "The air crackles with dread -- the Manifestation of Evil is imminent!"
    ];

    while (intReturn < maxAttempts) {
        var crier = findCrier();
        if (!crier) {
            Orion.Print("Town Crier not found nearby.");
            Orion.Wait(30000); // Wait 30 seconds before retrying
            return;
        }

        // Walk to the Town Crier
        Orion.WalkTo(crier.X(), crier.Y(), crier.Z(), 1, 255, 1, 1000);

        // Check for unwanted messages
        for (var i = 0; i < messages.length; i++) {
            if (Orion.InJournal(messages[i])) {
                Orion.Print("Unwanted message detected: " + messages[i]);
                walkAwayFromCrier(crier); // Walk away
                Orion.ClearJournal(); // Clear unwanted messages from the journal
                Orion.Wait(1000); // Small wait before retrying
                continue; // Retry after walking away
            }
        }

        // Attempt to catch the desired message
        if (CatchTown()) {
            Orion.Print("Successfully caught the town message. Exiting.");
            discoMessage("Current Town: " + Shared.GetVar("curCity"));
            return; // Desired message found, exit function
        }

        intReturn++;
        Orion.Print("Attempt " + intReturn + " failed. Retrying...");
        Orion.Wait(1500); // Small delay before next attempt
        walkAwayFromCrier(crier); // Walk away        
    }
}

function CatchTown() { 
    var journalLine = Orion.InJournal('is being invaded by the undead');
    
    if (journalLine) {
        var town = ExtractTownFromMessage(journalLine.Text());
        if (town) {
            Orion.Print(52, "The town under attack is: " + town);
            Shared.AddVar("curCity", town);
            return true; // Exit and indicate success
        }
    }
    Orion.Print("Timed out waiting for the town message.");
    return false; // Return false if timeout occurs
}

function findCrier() {
    var npcGraphic = '0x0190'; // Graphic for human NPC
    var npcColor = -1; // Specific color of the NPC (can be -1 for any color)

    // Search for all NPCs of the specified type within range
    var npcs = Orion.FindTypeEx(npcGraphic, npcColor, 'ground', 'mobile', 20); // Adjust range if needed

    for (var i = 0; i < npcs.length; i++) {
        var npc = npcs[i];

        // Check if the NPC's properties contain "Town Crier"
        if (npc.Properties().indexOf("Town Crier") !== -1) {
            return npc; // Return the found NPC
        }
    }
    return null; // Return null if no Town Crier is found
}

function ExtractTownFromMessage(text) {
    // Match the part of the text before "is being invaded by the undead"
    var match = text.match(/^(.*) is being invaded by the undead/);
    return match ? match[1] : null; // Return the town name or null
}

// Helper function to walk 5 steps away from the Crier
function walkAwayFromCrier(crier) {
    var deltaX = 15; // Move 15 tiles to the right
    var deltaY = 0; // Keep Y constant
    var newX = crier.X() + deltaX;
    var newY = crier.Y() + deltaY;

    // Walk to the calculated position
    Orion.WalkTo(newX, newY, crier.Z(), 1, 255, 1, 1000);
}

// Function to display a countdown timer for 30 minutes
function AddDisplayTimer(seconds) {
    for (var i = seconds; i >= 0; i--) {
        Orion.Print("Next check in: " + i + " seconds.");
        Orion.Wait(1000); // Wait 1 second
    }
}

// Function to send a Discord message
function discoMessage(theMessage) {
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

// Loop to run the script every 30 minutes
function runEveryThirtyMinutes() {
    while (true) {
        handleCrierMessages();
        AddDisplayTimer(1800); // 30 minutes timer in seconds
    }
}