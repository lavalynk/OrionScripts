//------------------------------------------------------------------------------------------------------------------------------------------
// SetBadLocations()
// Registers predefined “bad” map coordinates as restricted zones to avoid pathing through.  
// Highlights each bad location visually for debugging or awareness purposes.
//------------------------------------------------------------------------------------------------------------------------------------------
function SetBadLocations(){
	var id = 0;

	for (var i = 0; i < badLocations.length; i++) {
	    var loc = badLocations[i];
	    Orion.SetBadLocation(loc.x, loc.y, -1);
	    Orion.AddHighlightArea(id, -1, 'pos', '0x0490', 0, 0, 'all', loc.x, loc.y);
	    id++;
	}
}

var badLocations = [{x: 500, y: 500}]