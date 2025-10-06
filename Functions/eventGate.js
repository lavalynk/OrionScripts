//------------------------------------------------------------------------------------------------------------------------------------------
// eventGate()
// Detects and interacts with nearby event gates within a 5-tile radius.  
// Walks to the gate, attempts to enter by triggering the gump, and retries if the journal shows  
// “Your spirit lacks” until successful teleportation or movement away from the gate is detected.
//------------------------------------------------------------------------------------------------------------------------------------------
function eventGate() {
    var gate = Orion.FindTypeEx('0x4B8F|0x0DDB|0x0F6C|0x4BCB|0x0DDA', -1, ground, 'items', 5);
    var success = false;
    
    if (gate.length !== 0) {
        // Store the gate's coordinates
        var gateX = gate[0].X();
        var gateY = gate[0].Y();
        var gateZ = gate[0].Z();
        
        Orion.WalkTo(gateX, gateY, gateZ, 0, 255, 0, 1, 2000);
        Orion.Wait(2500);

        // Check if the player is still at the gate coordinates after walking
        if (Player.X() === gateX && Player.Y() === gateY && Player.Z() === gateZ) {
            // Enter loop to retry until success
            while (!success) {
                Orion.UseObject(gate[0].Serial());
                Orion.WaitForGump(1000);
                GumpAction('0x0000232D', 1, 1000, true);

                Orion.Wait(500); // Small delay to ensure the journal updates

                // Check the journal and retry if "Your spirit lacks" is found
                if (Orion.InJournal('Your spirit lacks')) {
                    Orion.ClearJournal(); // Clear to prevent repeated detections
                } else if (Player.X() !== gateX || Player.Y() !== gateY || Player.Z() !== gateZ) {
                    // Exit loop if player has moved away from the gate
                    success = true;
                }
            }
        }
    }
}