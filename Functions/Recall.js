var gumpActions = { "Crier": 75, "Britain": 76, }
var runeBook = " "

//------------------------------------------------------------------------------------------------------------------------------------------
// Recall()
// Uses runebook to recall to a named destination via gump actions, retries on “blocking,” and runs a fallback after 3 failures.
//------------------------------------------------------------------------------------------------------------------------------------------
function Recall(destination) {
	UpdateGUIStatus("Recalling to: " + destination);

	// Validate destination
	if (gumpActions[destination] === undefined) {
		Orion.SayParty("Invalid recall destination: " + destination);
		return;
	}

	// Try to find the runebook
	var runebook = findRunebook();

	if (runebook.length === 0) {
		Orion.Print("Runebook not found. Opening backpack to search again...");
		Orion.UseObject('backpack');
		Orion.Wait(1000); // Wait for the backpack to open
		runebook = findRunebook(); // Retry finding the runebook
	}

	if (runebook.length > 0) {
		// Store player's initial position
		var initialX = Player.X();
		var initialY = Player.Y();
		var recallAttempts = 0;

		// Attempt recall up to 3 times
		while (Player.X() === initialX && Player.Y() === initialY && recallAttempts < 3) {
			// Use the runebook and wait for the gump
			Orion.UseObject(runebook);
			Orion.WaitForGump(1000);

			// Execute the GumpAction based on the destination
			GumpAction('0x00000059', gumpActions[destination], 1000, true);

			// Wait for spell animation and travel check
			Orion.Wait(3500);

			// Check for blocked message
			if (Orion.InJournal("blocking")) {
				Orion.SayParty("Recall attempt " + (recallAttempts + 1) + " failed - location blocked.");
				recallAttempts++;

				// Fallback after 3 failed attempts
				if (recallAttempts >= 3) {
					Orion.SayParty("All recall attempts failed. Executing fallback action.");
					Orion.Exec("waitForNextTown", true);
					break;
				}
			}
		}

		Orion.Wait(2000);
	} else {
		Orion.SayParty("Runebook not found in backpack after retrying.");
	}
}
