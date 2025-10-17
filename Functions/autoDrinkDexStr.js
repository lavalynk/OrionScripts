//------------------------------------------------------------------------------------------------------------------------------------------
// autoDrinkDexStr()
// Automatically maintains Strength and Agility potion buffs during combat.
// Periodically checks for missing or expiring buffs (under 5s remaining)  
// and drinks the corresponding potion if available in the backpack.
//------------------------------------------------------------------------------------------------------------------------------------------

function autoDrinkDexStr() {
    Orion.Print(1191, "[Auto Str/Dex Potion] Script Started!");

    while (!Player.Dead()) {
        if (!Player.Hidden()) {
            // **Check and drink Agility potion if needed**
            if (!Orion.BuffExists('Agility') || Orion.BuffTimeRemaining('Agility') < 5000) {
                var agilityPotion = Orion.FindType('0x0F08', '0x0000', 'backpack'); // Agility Potion
                if (agilityPotion.length) {
                    Orion.UseItemOnMobile(agilityPotion[0], Player.Serial()); // Use potion on self
                    Orion.Wait(100);
                } else {
                    Orion.CharPrint('self', 1191, 'No Greater Agility Potions!');
                }
            }

            // **Check and drink Strength potion if needed**
            if (!Orion.BuffExists('Strength') || Orion.BuffTimeRemaining('Strength') < 5000) {
                var strengthPotion = Orion.FindType('0x0F09', '0x0000', 'backpack'); // Strength Potion
                if (strengthPotion.length) {
                    Orion.UseItemOnMobile(strengthPotion[0], Player.Serial()); // Use potion on self
                    Orion.Wait(100);
                } else {
                    Orion.CharPrint('self', 1191, 'No Greater Strength Potions!');
                }
            }
        }
        Orion.Wait(600); // Prevent excessive loops
    }

    Orion.Print(1191, "[Auto Str/Dex Potion] Script Stopped!");
}