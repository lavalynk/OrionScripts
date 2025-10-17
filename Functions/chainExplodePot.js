//------------------------------------------------------------------------------------------------------------------------------------------
// chainExplodePot()
// Continuously throws explosion potions at a manually targeted enemy until out of potions or the target is gone.
// Waits for user to select a target, verifies range, and maintains a timed throwing loop with customizable delay.
//------------------------------------------------------------------------------------------------------------------------------------------
function chainExplodePot() {
	var potionGraphic = 0x0F0D;
	var potionColor = 0x0000;
	var potionDistance = 10;
	var throwDelay = 1200;

	Orion.Print(1191, "[ChainExplodePot] Script Started!");
	Orion.Print("Please target your enemy...");

	// Wait for user to select a target and bind it to alias 'explodetarget'
	Orion.WaitForAddObject('explodetarget');

	var target = Orion.FindObject('explodetarget');
	if (!target || !Orion.ObjectExists(target.Serial())) {
		Orion.Print("No valid target selected.");
		return;
	}

	while (true) {
		if (Orion.Count(potionGraphic, potionColor, 'self', potionDistance, true) <= 0) {
			Orion.Print('No more explosion potions!');
			break;
		}

		if (!Orion.ObjectExists(target.Serial())) {
			Orion.Print('Target no longer exists!');
			break;
		}

		if (target.Distance() <= potionDistance) {
			Orion.UseType(potionGraphic, potionColor);
			Orion.WaitForTarget(1000);
			Orion.TargetObject(target.Serial());
			Orion.Print('Threw potion at: ' + target.Name());
		} else {
			Orion.Print('Target out of range.');
		}
		Orion.Wait(throwDelay);
	}
}
