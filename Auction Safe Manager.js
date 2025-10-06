//------------------------------------------------------------------------------------------------------------------------------------------
// Auction Safe Manager — v1.00
// Author: Lankester
// Description: Scans nearby safes, walks to each, checks gump clilocs to determine auction state,
//              starts auctions when available, color-highlights status, and paces runs with a display timer.
// Core Vars:  searchRange | safeGraphic | startAuctions | stopAuctions | maxAttempts
// Key Flows:  main() → findSafes() → walkToSafe() → clilocCheck() → startAuction() → setDisplayTimer()
// Utilities:  groupByZAxis() | highlightSafes()/highlightSafe() | keepActive() | removeHighlights()
// Notes:      Requires run near housing safes; adjust cliloc IDs & walk params for shard differences.
// Last Updated: 2025-10-05
//------------------------------------------------------------------------------------------------------------------------------------------

var searchRange = 12; //Set to range you want the script to search for safes.
var safeGraphic = '0x9C19|0x9C18';
var red = '0x0020';
var green = '0x0040';
var blue = '0x0059'

var startAuctions = 1156414;
var stopAuctions = 1156415;

var maxAttempts = 10; //Max walkTo attempts.

function main() {
    Orion.Exec('keepActive', true); // Keeps the script running even if the window loses focus
    var safes = findSafes(); // Find and sort the safes

    if (safes && safes.length > 0) {
        highlightSafes(safes, red); // Highlight all safes in red initially

        // Loop through each safe to process auctions
        safes.forEach(function (safe) {
            walkToSafe(safe); // Walk to the safe

            // Check if the auction is already active
            var stopAuctionActive = clilocCheck(safe.Serial(), stopAuctions);
            if (!stopAuctionActive) { // If stop auction is not active, try to start the auction
                var startAuctionAvailable = clilocCheck(safe.Serial(), startAuctions);
                if (startAuctionAvailable) { // If start auction cliloc is found, initiate the auction
                    startAuction();
                    // Re-check if the auction successfully started by looking for the stop auction cliloc
                    var auctionStarted = clilocCheck(safe.Serial(), stopAuctions);
                    if (auctionStarted) {
                        highlightSafe(safe, green); // Highlight the safe in green to show the auction is active
                        setDisplayTimer(); // Set a 5-minute timer before processing the next safe
                        Orion.Wait(310000); // Wait for 5 minutes (300,000 milliseconds) to let the timer reach zero
                    } else {
                        Orion.Print("Failed to start the auction for the safe.");
                    }
                } else {
                    Orion.Print("Start auction option is not available for this safe.");
                	highlightSafe(safe, green); // Highlight the safe in green to show the auction is active
                }
            } else {
                highlightSafe(safe, green); // Auction already active, highlight the safe in green
                Orion.Print("Auction is already active for this safe.");
            }
			Orion.Wait(1000);
        });
    } else {
        Orion.Print("No safes found to highlight.");
    }
	removeHighlights() 
}

function findSafes() {
	var safes = Orion.FindTypeEx(safeGraphic, '0x0000', 'any', 'item', searchRange);
	if (safes && safes.length > 0) {
		// Group safes by Z-axis (floors)
		var groupedSafes = groupByZAxis(safes);
		
		// Sort each Z-level group by distance from the player
		var sortedSafes = [];
		for (var zLevel in groupedSafes) {
			groupedSafes[zLevel].sort(function (a, b) {
				var distanceA = Orion.GetDistance(a.Serial());
				var distanceB = Orion.GetDistance(b.Serial());
				return distanceA - distanceB;
			});
			sortedSafes = sortedSafes.concat(groupedSafes[zLevel]);
		}
		
		for (var i = 0; i < sortedSafes.length; i++) {
			Orion.PrintFast(sortedSafes[i].Serial(), '0x0035', ' ',"Position: " + (i + 1));
		}
		
		Orion.PrintFast('self', '0x0AAC', ' ', sortedSafes.length + " safes found and sorted.");
		return sortedSafes;
	}
	Orion.Print("No safes found.");
	return [];
}

// Helper function to group safes by their Z-axis (floor level)
function groupByZAxis(safes) {
	var groups = {};
	safes.forEach(function (safe) {
		var zLevel = safe.Z();
		if (!groups[zLevel]) {
			groups[zLevel] = [];
		}
		groups[zLevel].push(safe);
	});
	return groups;
}

function highlightSafes(safes, color) {
	if (!safes || safes.length === 0) {
		Orion.Print("No safes to highlight.");
		return;
	}
	
	safes.forEach(function (safe) {
		Orion.AddHighlightArea(safe.Serial(), -1, safe.Serial(), color, 0, 0); // Highlight for 30 seconds in red
	});
}

function clilocCheck(serial, cliloc) {
    Orion.UseObject(serial);
    Orion.Wait(1000);

    if (Orion.WaitForGump(2000)) {
            var gump0 = Orion.GetGump('last');
            if ((gump0 !== null) && (!gump0.Replayed()) && (gump0.ID() === '0x000F3ED6')) {
            var textEntries = gump0.CommandList();
    
            // Define the cliloc ID you're searching for
            var clilocId = cliloc;
            var clilocText = Orion.GetCliLocString(clilocId);
    
            // Check if any of the gump's text entries match the cliloc text
            var found = false;
            for (var i = 0; i < textEntries.length; i++) {
                if (textEntries[i].indexOf(clilocId) !== -1) {
                    found = true;
                    break;
                }
            }
        }
            
        if (found) {
            Orion.Print("Found cliloc with text: " + clilocText);
            return true;
        } else {
            Orion.Print("Cliloc not found in the gump.");
        }
    } else {
        Orion.Print("The specified gump was not found.");
    }
}
	
function highlightSafes(safes, color) {
	safes.forEach(function (safe) {
		Orion.AddHighlightArea(safe.Serial(), -1, safe.Serial(), color, 0, 0);
	});
}

function highlightSafe(safe, color) {
	Orion.AddHighlightArea(safe.Serial(), -1, safe.Serial(), color, 0, 0);
}

function setDisplayTimer() {
	Orion.SetTimer('Start Auction', 310000);
	Orion.AddDisplayTimer(1, 310000, 'UnderChar', 'Circle', 'Start Auction', 0, 40, blue, ' '); 
}

function walkToSafe(safe) {
	Orion.WalkTo(safe.X(), safe.Y(), safe.Z(), 5, 0, 1, 1);
	
	var attempts = 0;
	
	while (safe.Distance() > 5 && Player.Z() !== safe.Z()) {
		Orion.Wait(50);
		attempts++;
		
		if (safe.Distance() <= 5 && Player.Z() === safe.Z()) {
			break;
		}
	
		if (attempts >= maxAttempts) {
			Orion.Print("Failed to reach the safe within the specified attempts.");
			break;
		}
	}
}

function startAuction() {
	if (Orion.WaitForGump(1000)) {
		var gump0 = Orion.GetGump('last');
		if ((gump0 !== null) && (!gump0.Replayed()) && (gump0.ID() === '0x000F3ED6')) {
			var gumpHook0 = Orion.CreateGumpHook(106);
			gumpHook0.AddEntry(15, "");
			gumpHook0.AddEntry(16, "");
			gumpHook0.AddEntry(13, "");
			gumpHook0.AddEntry(14, "");
			gump0.Select(gumpHook0);
			Orion.Wait(100);
		}
	}
}

function keepActive(){
	while (true) {
		Orion.OpenContainer('backpack')
		Orion.AddDisplayTimer('40000', 40000, 'AboveChar', 'Bar', 'Keep Active', 0,40, blue)
		Orion.Wait(40000)
	}
}

function removeHighlights() {
	Orion.RemoveHighlightArea('all');
}
		
