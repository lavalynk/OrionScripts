//------------------------------------------------------------------------------------------------------------------------------------------
// auto_CrossHealBandage()
// Maintains cross-healing: opens belt if present, prioritizes poisoned allies, then weighted heal targeting, else self-heal.
//------------------------------------------------------------------------------------------------------------------------------------------
function auto_CrossHealBandage() {
    // Open the backpack
    openContainer(backpack);
    Orion.Wait(1250);
    
    // Check for First Aid Belt in the backpack and open if found
    var firstAidBelt = Orion.FindTypeEx('0xA1F6', '0x0000', backpack);
    if (firstAidBelt.length > 0) {
        openContainer(firstAidBelt[0].Serial());
        Orion.Wait(1250);
    }

    while (!Player.Dead()) {
        // First, check and treat any poisoned target
        if (auto_PoisonBandage()) {
            continue;
        }
        
        // Check for bandages in the backpack for healing
        var bandages = Orion.FindType('0x0E21', -1, backpack, 'item', ' ', ' ', true);
        if (bandages.length === 0) {
            Orion.PrintFast('self', 33, 4, 'No bandages found!');
            Orion.Wait(1000);
            continue;
        }
        
        // Find potential targets for healing: live targets within 2 tiles
        var potentialTargets = Orion.FindType(playerGraphics, "-1", 'ground', "ignoreself", 2, "green");
        // Always include self as an option
        potentialTargets.push(Player.Serial());
        
        // Use the weighted random selection to choose a target based on health buckets.
        var finalTarget = weightedRandomHealTarget(potentialTargets, 2);
        Orion.Wait(100);
        if (finalTarget) {
            // Check that target needs healing and bandaging isn't in progress.
            if (finalTarget.Hits() < finalTarget.MaxHits() && finalTarget.Distance() <= 2 && !IsApplyingBandages()) {
                Orion.BandageTarget(finalTarget.Serial());
                Orion.Wait(500);
                Orion.AddDisplayTimer('bandageFriend', Orion.BuffTimeRemaining('0x7596'), 'UnderChar', 'Rectangle|Bar', 'Heal', 0, 0, 126, 4, '0xFF00FF00');
                Orion.DisplayTimerSetSize('bandageFriend', 200, 20);
                Orion.PrintFast('self', 1151, 4, 'Bandaging: ' + finalTarget.Name());
                Orion.Wait(750);
            }
        } else {
            Orion.Wait(200);
            // If no suitable target, try bandaging self if needed.
            if (Player.Hits() < Player.MaxHits() && !IsApplyingBandages()) {
                Orion.BandageSelf();
                Orion.Wait(500);
                Orion.AddDisplayTimer('bandageFriend', Orion.BuffTimeRemaining('0x7596'), 'UnderChar', 'Rectangle|Bar', 'Heal', 0, 0, 126, 4, '0xFF00FF00');
                Orion.DisplayTimerSetSize('bandageFriend', 200, 20);
                Orion.PrintFast('self', 1151, 4, 'Bandaging: Self');
                Orion.Wait(750);
            }
        }
    }
}
//------------------------------------------------------------------------------------------------------------------------------------------
// weightedRandomHealTarget(potentialTargets, dist)
// Picks a heal target within distance using weighted health buckets (low HP gets higher weight).
//------------------------------------------------------------------------------------------------------------------------------------------
function weightedRandomHealTarget(potentialTargets, dist) {
    var weightedTargets = [];
    if (potentialTargets && potentialTargets.length > 0) {
        potentialTargets.forEach(function(targetId) {
            var targetObj = Orion.FindObject(targetId);
            if (!targetObj) return;
            // Only consider targets within the given distance.
            if (targetObj.Distance() > dist) return;
            Orion.GetStatus(targetObj.Serial());
            var currentHits = targetObj.Hits();
            var maxHits = targetObj.MaxHits();
            var healthPct = (currentHits / maxHits) * 100;
            // Only add if target is not at full health.
            if (healthPct < 100) {
                if (healthPct < 40) {
                    weightedTargets.push(targetId, targetId, targetId);
                } else if (healthPct < 80) {
                    weightedTargets.push(targetId, targetId);
                } else {
                    weightedTargets.push(targetId);
                }
            }
        });
    }
    if (weightedTargets.length > 0) {
        var randomIndex = Math.floor(Math.random() * weightedTargets.length);
        return Orion.FindObject(weightedTargets[randomIndex]);
    }
    return null;
}

//------------------------------------------------------------------------------------------------------------------------------------------
// IsApplyingBandages()
// Returns true if a bandage (healing/veterinary) action is already in progress based on buffs/timers.
//------------------------------------------------------------------------------------------------------------------------------------------
function IsApplyingBandages() {
    return (Orion.BuffExists('0x7596') && Orion.BuffTimeRemaining('healing skill') > 0) ||
           (Orion.BuffExists('veterinary') && Orion.BuffTimeRemaining('veterinary') > 0);
}

//------------------------------------------------------------------------------------------------------------------------------------------
// auto_PoisonBandage()
// Scans nearby allies (and self) for poison within 2 tiles and bandages them first, showing a timer.
//------------------------------------------------------------------------------------------------------------------------------------------
function auto_PoisonBandage() {
    // Check if there are any bandages in the backpack
    var bandages = Orion.FindType('0x0E21', -1, backpack, 'item', ' ', ' ', true);
    if (bandages.length === 0) {
        Orion.PrintFast('self', 33, 4, 'No bandages found for poison!');
        Orion.Wait(1000);
        return false;
    }   
    // Find potential targets on the ground (and include self)
    var potentialTargets = Orion.FindType(playerGraphics, "-1", 'ground', "live|ignoreself", 2, "green");
    potentialTargets.push(Player.Serial());
    
    // Check each target for poison and proximity
    for (var i = 0; i < potentialTargets.length; i++) {
        var currentTarget = Orion.FindObject(potentialTargets[i]);
        if (!currentTarget) continue;
        
        Orion.GetStatus(currentTarget.Serial());
        if (currentTarget.Poisoned() && currentTarget.Distance() <= 2) {
            // Check if bandaging is already in progress
            if (!IsApplyingBandages()) {
                Orion.BandageTarget(currentTarget.Serial());
                Orion.Wait(500);
                Orion.AddDisplayTimer('poisonBandage', Orion.BuffTimeRemaining('0x7596'), 'UnderChar', 'Rectangle|Bar', 'Poison', 0, 0, 126, 4, '0xFFFF0000');
                Orion.DisplayTimerSetSize('poisonBandage', 200, 20);
                Orion.PrintFast('self', 1151, 4, 'Bandaging on Poison: ' + currentTarget.Name());
                Orion.Wait(750);
                return true;
            }
        }
    }
    return false;
}