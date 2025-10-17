//------------------------------------------------------------------------------------------------------------------------------------------
// AddMoongatesAsBadPoints()
// Continuously scans for moongates nearby and flags their coordinates as “bad locations” to avoid pathing through them.
// Excludes specific safe moongates (Isamu Jima & Makoto Jima). Automatically ignores their serials.
//------------------------------------------------------------------------------------------------------------------------------------------
function AddMoongatesAsBadPoints() {
	while (true) {
		// Find nearby moongates (both types)
		var moongates = Orion.FindTypeEx("0x0F6C|0x0DDB", 'any', 'ground', '', 20);

		// Process each moongate found
		moongates.forEach(function (moongate) {
			// Skip specific moongates (safe zones)
			if (moongate.X() === 1169 && moongate.Y() === 998) return;   // Isamu Jima Moongate
			if (moongate.X() === 802 && moongate.Y() === 1204) return;   // Makoto Jima Moongate

			// Mark as bad location for 30 seconds (30 * 1000 ms)
			Orion.SetBadLocation(moongate.X(), moongate.Y(), 30 * 1000);

			// Ignore the moongate object
			Orion.Ignore(moongate.Serial());
		});

		// Wait 1 second before scanning again
		Orion.Wait(1000);
	}
}
