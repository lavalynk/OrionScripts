//------------------------------------------------------------------------------------------------------------------------------------------
// autoBox()
// Automatically uses trapped boxes to break paralyze or nerve strike effects during combat.
// Activates when journal detects a nerve strike or the player becomes paralyzed,  
// ensuring HP safety and avoiding redundant triggers.
//------------------------------------------------------------------------------------------------------------------------------------------
function autoBox() {
    Orion.Print(1191, "[AutoBox] Script Started!");

    while (!Player.Dead()) {
        var box = Orion.FindTypeEx('0x09A9', 'any', 'backpack');

        if (!box.length) {
            Orion.Print(1191, "[AutoBox] No box found in backpack!");
            Orion.Wait(1000); // Wait longer to prevent spam
            continue;
        }

        if (Orion.InJournal('Your attacker dealt a crippling nerve strike!', 'my', 10)) {
            Orion.Print(1191, "[AutoBox] Nerve Strike detected! Using box.");
            Orion.ClearJournal(); 
            Orion.UseItemOnMobile(box[0].Serial(), 'self');
            Orion.Wait(50)
            Orion.CloseGump('container', box[0].Serial())                
            Orion.Wait(2000);
        }

        if (Player.Paralyzed()) {
            Orion.Print(1191, "[AutoBox] Player is paralyzed!");
            
            if (Player.Hits() > 30) {
                Orion.UseItemOnMobile(box[0].Serial(), 'self');
	            Orion.Wait(50)                
	            Orion.CloseGump('container', box[0].Serial())                
                Orion.Wait(2000);
            } else {
                Orion.Print(1191, "[AutoBox] HP too low (" + Player.Hits() + "), not using box.");
            }
        }
        Orion.Wait(50); // Prevents excessive looping
    }
    Orion.Print(1191, "[AutoBox] Script Stopped (Player is dead).");
}