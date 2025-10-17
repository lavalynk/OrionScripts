//------------------------------------------------------------------------------------------------------------------------------------------
// GoToAndAttackTarget()
// Validates target, starts an engage timer, path-checks, approaches using targetSpacing(), attacks, then
// cleans up highlights/timers.
//------------------------------------------------------------------------------------------------------------------------------------------
function GoToAndAttackTarget(target) {
    if (!target || !Orion.ObjectExists(target.Serial())) {
        Orion.PrintFast(Player.Serial(), 33, 0, "Target does not exist.");
        return false;
    }

    const lastTarget = Orion.GetGlobal("lastTarget");
    if (lastTarget !== target.Serial()) {
        Orion.AddDisplayTimer("engageID", engageTime, "AboveChar", "Circle|Bar", "Engage");
    }
    Orion.Wait(50);

    // Check the path to the target before entering the loop
    const pathArray = Orion.GetPathArray(target.X(), target.Y(), target.Z(), 1, 10);
    if (target.Distance() > 1 && pathArray.length === 0) {
		Orion.PrintFast(Player.Serial(), 33, 0, "Target is unreachable. Adding to ignore list.");
        Orion.AddIgnoreList("AutoTargetIgnore", target.Serial());
        return false;
    }

    Orion.PrintFast(target.Serial(), 33, 0, "***Target***")
    // Main attack loop
    if (pathArray.length < 10) {
        while (Orion.ObjectExists(target.Serial()) && Orion.DisplayTimerExists("engageID")) {
            Orion.AddHighlightCharacter(target.Serial(), colorID, true);
            Orion.WalkTo(target.X(), target.Y(), target.Z(), targetSpacing, 0, 1);
            Orion.Attack(target.Serial());
            Orion.Wait(100); // Adjust based on responsiveness
        }
    }

    // Clear highlights and timers after the loop
    Orion.ClearHighlightCharacters();
    Orion.RemoveDisplayTimer("engageID");
    Orion.AddIgnoreList("AutoTargetIgnore", target.Serial());
    return true;
}