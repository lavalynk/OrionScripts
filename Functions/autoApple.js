//------------------------------------------------------------------------------------------------------------------------------------------
// autoApple()
// Automatically eats an apple when certain debuffs (Corpse Skin, Sleep, Mortal Strike) are active.
// Uses a 30-second cooldown timer to prevent premature reuse and displays a visual countdown under the character.
//------------------------------------------------------------------------------------------------------------------------------------------

function autoApple() {
    Orion.Print(1191, "[Auto Apple] Script Started!");

    while (!Player.Dead()) {
        if (!Orion.DisplayTimerExists('apple')) {
            // **Check for debuffs that require using an apple**
            if (Orion.BuffExists('Corpse Skin') || Orion.BuffExists('Sleep') || Orion.BuffExists('Mortal Strike')) {
                var apple = Orion.FindType('0x2FD8', '0x0488', 'backpack'); // Find Apple
                if (apple.length) {
                    Orion.UseObject(apple[0]); // Use Apple

         		    Orion.AddDisplayTimer('apple', 30000, "UnderChar", "Circle|Bar", "Apple", 0, 50, '289', fontCode, '0x00CCFFFF');	
                } else {
                    Orion.CharPrint('self', 1191, 'No Apples Available!');
                }
            }
        }

        Orion.Wait(500); // Reduce CPU usage
    }
    Orion.Print(1191, "[Auto Apple] Script Stopped!");
}