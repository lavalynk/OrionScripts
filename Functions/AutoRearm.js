//------------------------------------------------------------------------------------------------------------------------------------------
// AutoRearm()
// Automatically re-equips the last weapon after being disarmed or unequipped.  
// Detects disarm events, tracks the previously held weapon, and re-equips it once allowed.  
// Includes visual timer feedback and conditional logic to prevent rearming during restricted states.
//------------------------------------------------------------------------------------------------------------------------------------------
function AutoRearm() {
    // Requires a dress group labeled in the variable below
    var ondisarmonly = false;
    var doit = false;

    while (true) {
        var prevwep = null;
        
        // Check if disarmed and set a rearm timer if needed
        if (Orion.BuffExists("disarm") && Orion.Timer("DisarmTimer") >= -1) {
            Orion.SetTimer("DisarmTimer", -4000);
            Orion.AddDisplayTimer("DisarmTimer", 4000, "AboveChar", "Circle|Bar", "Disarm", 0, 0, '55', 0xFF, '0xFFFFFF');
        }

        // Determine if rearming is allowed
        if ((Orion.BuffExists("disarm") || Orion.BuffExists("no rearm")) || !ondisarmonly) {
            doit = true;
        }

        // Rearm if not currently holding a weapon and `doit` is true
        if (!(Orion.ObjAtLayer('RightHand') || Orion.ObjAtLayer('LeftHand')) && doit) {
            var wep = Orion.FindObject('PrevWep');
            while (!(Orion.ObjAtLayer('RightHand') || Orion.ObjAtLayer('LeftHand')) && wep) {
                if (!Player.Frozen() && !(Orion.BuffExists("disarm") || Orion.BuffExists("no rearm"))) {
                    Orion.Equip(wep.Serial());
                    Orion.Wait(500);
                }
            }
            doit = false; // Reset `doit` to prevent repeated rearming
        }

        // Save the currently equipped weapon for future rearming
        if (Orion.ObjAtLayer('RightHand')) {
            Orion.AddObject("PrevWep", Orion.ObjAtLayer('RightHand').Serial());
        } else if (Orion.ObjAtLayer('LeftHand')) {
            Orion.AddObject("PrevWep", Orion.ObjAtLayer('LeftHand').Serial());
        }

        Orion.Wait(400); // Pause to avoid continuous loop execution
    }
}