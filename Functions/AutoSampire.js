//------------------------------------------------------------------------------------------------------------------------------------------
// AutoSampire()
// Continuously searches for nearby valid enemies, approaches and attacks using GoToAndAttackTarget(),  
// and optionally loots corpses if enabled. Repeats until the player dies.
//------------------------------------------------------------------------------------------------------------------------------------------

function AutoSampire() {
    while (!Player.Dead()) {
        var arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', 'ignoreself|ignorefriends|live|near|inlos', 15, targetNoto, 1000);
        var useLootCorpses = Shared.GetVar('useLootCorpses');

        if (arr.length > 0) {
            arr.sort(function(a, b) { return a.Distance() - b.Distance(); });
            
            for (var i = 0; i < arr.length; i++) {
                var target = arr[i];
                var targetObject = Orion.FindObject(target.Serial());
                if (!targetObject) continue;

                var targetProperties = targetObject.Properties();
                if (!isSummoned(targetProperties)) {
                    if (GoToAndAttackTarget(targetObject)) {
                        if (useLootCorpses === 'True') LootCorpses();
                        Orion.Wait(500);
                        break;
                    }
                }
            }
        } else {
            Orion.Print('No target available...');
            Orion.Wait(100);
        }
    }
}

function GoToAndAttackTarget(target) {
    if (!target || !Orion.ObjectExists(target.Serial())) {
        Orion.PrintFast(Player.Serial(), 33, 0, "Target does not exist.");
        return false;
    }

    var targetSerial = target.Serial();
    Orion.PrintFast(targetSerial, 33, 0, "***Target***");
    Orion.ShowStatusbar(targetSerial, 550, 100);
    Orion.GetStatus(targetSerial);
       
    var pathArray = Orion.GetPathArray(target.X(), target.Y(), target.Z(), 1, 10);
    if (target.Distance() > 1 && pathArray.length === 0) {
        Orion.PrintFast(Player.Serial(), 33, 0, "Target is unreachable. Adding to ignore list.");
        Orion.AddIgnoreList("AutoTargetIgnore", targetSerial);
        return false;
    }

    if (pathArray.length < 15) {
        while (Orion.ObjectExists(targetSerial)) {
            Orion.AddHighlightCharacter(targetSerial, 0x0AC3, true);
            Orion.WalkTo(target.X(), target.Y(), target.Z(), 1, 0, 1);
            Orion.Attack(targetSerial);
            Orion.Wait(100);
        }
    }

    Orion.ClearHighlightCharacters();
    Orion.AddIgnoreList("AutoTargetIgnore", targetSerial);
    Orion.CloseStatusbar('all');
    return true;
}

function FindEnemies() {
    var searchRadius = 10;
    return Orion.FindTypeEx(targetGraphics, 'any', 'ground', 'ignoreself|ignorefriends|live|near|inlos', searchRadius, "gray|criminal|enemy|red", ' ', 'AutoTargetIgnore');
}

function isSummoned(name, serial) {
	if (!name || !serial) return false;

	var obj = Orion.FindObject(serial);
	if (!obj) return false;
	Orion.Wait(5)
	// Step 1: Check properties for (summoned) tag
	var props = obj.Properties();
	if (Array.isArray(props)) {
		for (var i = 0; i < props.length; i++) {
			if (props[i].toLowerCase().indexOf('(summoned)') !== -1) {
				//UpdateGUIStatus("Skipping due to (summoned) tag: " + name);
				return true;
			}
		}
	}

	// Step 2: Check name match and red notoriety
	var lowerName = name.toLowerCase();
	var summonedNames = ["nature's fury", "energy vortex", "blade spirit", "revenant", "skeletal mage", "bone mage", "lich lord"];
		Orion.Wait(5)
		for (var j = 0; j < summonedNames.length; j++) {
			if (lowerName.indexOf(summonedNames[j]) !== -1) {
				//Orion.Print("Matched summon name: " + summonedNames[j]);
				if (typeof obj.Notoriety === 'function') {
					var noto = obj.Notoriety();
					//Orion.Print("Notoriety for " + name + ": " + noto);
					if (noto === 3 || noto === 6) {
						//UpdateGUIStatus("Skipping red-named summon: " + name);
						return true;
					}
				}
			}
		}

	return false;
}