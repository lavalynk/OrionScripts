var primaryArmorIgnoreWeapons = ['Bladed Staff', 'Soul Glaive', "Shadow's Fury", 'Composite Bow', 'Boomerang', 'Longsword'];
var secondaryArmorIgnoreWeapons = ['Leafblade', 'Bokuto', 'Katana', 'Broadsword'];
var primaryWhirlwindWeapon = ['Radiant Scimitar', 'Magical Shortbow'];
var secondaryWhirlwindWeapon = ['Double Axe'];
var primaryDoubleAttackWeapons = ['Double Axe'];  	

//------------------------------------------------------------------------------------------------------------------------------------------
// smartAbilities()
// Auto-selects combat abilities based on equipped weapon and nearby enemy count:
// - ≥3 enemies: Whirlwind if available, else fallback to Armor Ignore (Primary)
// - 1–2 enemies: Armor Ignore or Double Attack (Primary)
// - 0 enemies: prime Primary if neither ability is active and mana allows
//------------------------------------------------------------------------------------------------------------------------------------------
function smartAbilities(_internal) {
    var weaponObject = Orion.ObjAtLayer('RightHand') || Orion.ObjAtLayer('LeftHand');
    if (!weaponObject) {
        Orion.Print("No weapon equipped.");
        return;
    }

    while (!Player.Dead()) {
        var props = weaponObject.Properties();
        var enemyCount = countEnemies(3);
        //Orion.Print("Enemies detected: " + enemyCount);

        if (enemyCount >= 3) {
            // Use Whirlwind
            if (
                primaryWhirlwindWeapon.filter(function (weapon) { return props.indexOf(weapon) > -1; }).length > 0 ||
                secondaryWhirlwindWeapon.filter(function (weapon) { return props.indexOf(weapon) > -1; }).length > 0
            ) {
                if (!Orion.AbilityStatus('Secondary')) {
                    Orion.UseAbility('Secondary');
                    Orion.Wait(250);
                }
            } else {
                // Fallback to Armor Ignore
                if (
                    primaryArmorIgnoreWeapons.filter(function (weapon) { return props.indexOf(weapon) > -1; }).length > 0 ||
                    secondaryArmorIgnoreWeapons.filter(function (weapon) { return props.indexOf(weapon) > -1; }).length > 0
                ) {
                    if (!Orion.AbilityStatus('Primary') && Player.Mana() >= 25) {
                        Orion.Print("Fallback to Armor Ignore.");
                        Orion.UseAbility('Primary');
                        Orion.Wait(250);
                    }
                } else {
                    Orion.Print("No valid abilities for this weapon.");
                }
            }
        } else if (enemyCount > 0) {
            // Use Armor Ignore or Double Attack
            if (
                primaryArmorIgnoreWeapons.filter(function (weapon) { return props.indexOf(weapon) > -1; }).length > 0 ||
                secondaryArmorIgnoreWeapons.filter(function (weapon) { return props.indexOf(weapon) > -1; }).length > 0
            ) {
                if (!Orion.AbilityStatus('Primary') && Player.Mana() >= 25) {
                    Orion.UseAbility('Primary');
                    Orion.Wait(250);
                }
            } else if (
                primaryDoubleAttackWeapons.filter(function (weapon) { return props.indexOf(weapon) > -1; }).length > 0
            ) {
                if (!Orion.AbilityStatus('Primary') && Player.Mana() >= 25) {
                    Orion.UseAbility('Primary');
                    Orion.Wait(250);
                }
            }
        } else {
            //Orion.Print("No enemies detected.");
                if (!Orion.AbilityStatus('Primary') && !Orion.AbilityStatus('Secondary') && Player.Mana() >= 25) {
                    Orion.UseAbility('Primary');
                    Orion.Wait(250);
                }
        }

        // Add a general wait to prevent excessive looping
        Orion.Wait(500); // Ensures the loop doesn't run too fast
    }
}
