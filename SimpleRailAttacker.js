// Set your target graphic and noto types
var targetGraphics = '!0x0136|!0x000E|!0x00A4|!0x033D|!0x023E|!0x02B4|!0x002F';
var targetFlags = 'ignoreself|ignorefriends|live|inlos|near';
var targetNoto = 'gray|criminal|enemy|red|orange';
var targetRange = 10;

// Example Rail (Replace with your own)
var rail = [
    { x: 1000, y: 2000, z: 0, wait: 500 },
    { x: 1010, y: 2005, z: 0, wait: 500 },
    { x: 1020, y: 2010, z: 0, wait: 500 }
];

//------------------------------------------------------------------------------------------------------------------------------------------
// SimpleRailAttacker()
// Walks a preset rail of coordinates, scans/attacks nearby enemies at each stop, and triggers smartAbilities() during combat.
//------------------------------------------------------------------------------------------------------------------------------------------

function SimpleRailAttacker() {
    while (!Player.Dead()) {
        for (var i = 0; i < rail.length; i++) {
            var step = rail[i];

            Orion.WalkTo(step.x, step.y, step.z, 1, 255, 1);
            Orion.Wait(step.wait);

            var enemies = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetRange, targetNoto);
            enemies.sort(function (a, b) { return a.Distance() - b.Distance(); });

            for (var j = 0; j < enemies.length; j++) {
                var enemy = enemies[j];
                if (enemy) {
                    Orion.Attack(enemy.Serial());
                    Orion.CharPrint(enemy.Serial(), 52, "*Target*");

                    var t = 0;
                    while (Orion.ObjectExists(enemy.Serial()) && !Player.Dead() && t < 100) {
                        Orion.Wait(200);
                        smartAbilities();
                        t++;
                    }
                }
            }

            Orion.Wait(200);
        }
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------
// smartAbilities()
// Chooses and primes combat abilities based on weapon properties and nearby enemy count (Whirlwind for packs, Armor Ignore for single).
//------------------------------------------------------------------------------------------------------------------------------------------
function smartAbilities() {
    var weaponObject = Orion.ObjAtLayer('RightHand') || Orion.ObjAtLayer('LeftHand');
    if (!weaponObject || Player.Mana() < 25) return;

    var props = weaponObject.Properties();
    var enemies = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, 3, targetNoto);
    var count = enemies.length;

    var whirlwindWeapons = ['Radiant Scimitar', 'Magical Shortbow', 'Double Axe'];
    var armorIgnoreWeapons = ['Bladed Staff', 'Soul Glaive', "Shadow's Fury", 'Composite Bow', 'Boomerang', 'Longsword', 'Leafblade', 'Bokuto', 'Katana', 'Broadsword'];

    if (count >= 3 && matches(props, whirlwindWeapons)) {
        if (!Orion.AbilityStatus('Secondary')) Orion.UseAbility('Secondary');
    } else if (count >= 1 && matches(props, armorIgnoreWeapons)) {
        if (!Orion.AbilityStatus('Primary')) Orion.UseAbility('Primary');
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------
// matches(props, list)
// Utility: returns true if any weapon name in the list is found within the provided properties string.
//------------------------------------------------------------------------------------------------------------------------------------------
function matches(props, list) {
    for (var i = 0; i < list.length; i++) {
        if (props.indexOf(list[i]) > -1) return true;
    }
    return false;
}
