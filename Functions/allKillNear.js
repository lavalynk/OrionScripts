//------------------------------------------------------------------------------------------------------------------------------------------
// allKillNear()
// Commands pets with “All Kill” to attack the nearest valid enemy (non-summoned), highlights/monitors target,
// retargets if a closer enemy appears, optionally loots afterward, then issues “All Follow Me.”
//------------------------------------------------------------------------------------------------------------------------------------------
function allKillNear() {
    while (!Player.Dead()) {
        var useLootCorpses = Shared.GetVar('useLootCorpses');
        var arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetRange, targetNoto);

        if (arr.length > 0) {
            arr.sort(function (a, b) { return a.Distance() - b.Distance(); });

            for (var i = 0; i < arr.length; i++) {
                var target = arr[i];
                var targetObject = Orion.FindObject(target.Serial());
                if (!targetObject) continue;

                var targetProperties = targetObject.Properties();
                if (!isSummoned(targetProperties)) { 
                    var closestTargetSerial = target.Serial();

                    Orion.AddHighlightCharacter(closestTargetSerial, 0x0AC3, true);
                    Orion.ShowStatusbar(closestTargetSerial, 550, 100);
                    Orion.CharPrint(closestTargetSerial, 52, '*Target*');

                    Orion.Say("All Kill");
                    Orion.Wait(500);
                    Orion.TargetObject(closestTargetSerial);
                    
                    while (Orion.ObjectExists(closestTargetSerial) && !Player.Dead()) {
                        var currentTargetObject = Orion.FindObject(closestTargetSerial);
                        if (currentTargetObject) {
                            UpdateGUIStatus('Attacking: ' + currentTargetObject.Name());
                        }                        
                        Orion.GetStatus(closestTargetSerial);
                        Orion.Wait(500);

                        arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetRange, targetNoto);
                        if (arr.length > 0) {
                            arr.sort(function (a, b) { return a.Distance() - b.Distance(); });
                            if (arr[0].Serial() !== closestTargetSerial) {
                                Orion.Print('New closer target found, changing target.');
                                closestTargetSerial = arr[0].Serial();
                                Orion.Say("All Kill");
                                Orion.Wait(500);
                                Orion.TargetObject(closestTargetSerial);
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    Orion.CloseStatusbar('all');
                    if (useLootCorpses == 'True') {
                        LootCorpses();
                    }
                    Orion.Say("All Follow Me")
                    Orion.Wait(100);
                    break;
                }
            }
        } else {
            UpdateGUIStatus('No target available...');
            Orion.Wait(500);
        }
    }
}