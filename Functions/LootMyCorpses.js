//------------------------------------------------------------------------------------------------------------------------------------------
// LootMyCorpses()
// Searches nearby for the player’s own corpse(s) by matching the “a corpse of <player>” tag.  
// Walks to each matching corpse and opens it for manual looting within a 10-tile range.
//------------------------------------------------------------------------------------------------------------------------------------------

function LootMyCorpses() {
    var strPlayerName = Player.Name().toLowerCase();
    var expectedTag = "a corpse of " + strPlayerName;

    // Include alternate corpse colors just in case (0x0ECB = sometimes used)
    var corpses = Orion.FindTypeEx('0x2006|0x0ECB', -1, 'ground', 'item', 10);

    if (!corpses || corpses.length === 0) {
        Orion.SayParty("No corpses found nearby.");
        return;
    }

    for (var i = 0; i < corpses.length; i++) {
        var serial = corpses[i].Serial();
        Orion.Print(serial)
        var corpse = Orion.FindObject(serial);
        if (!corpse) continue;

        var tooltip = corpse.Properties();
        Orion.Print("Checking " + serial + ": " + tooltip);

        if (tooltip && tooltip.toLowerCase().indexOf(expectedTag) !== -1) {
            Orion.Print("→ Found matching corpse: " + serial);
            Orion.WalkTo(corpse.X(), corpse.Y(), corpse.Z(), 1, 255, 1, 2);
            Orion.Wait(600);
            Orion.UseObject(serial);
            Orion.Wait(1250);
        }
    }
}