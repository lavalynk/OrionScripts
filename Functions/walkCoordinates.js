//------------------------------------------------------------------------------------------------------------------------------------------
// walkCoordinates(coords)
// Walks sequentially through a list of X/Y coordinate pairs.
// Each pair represents a movement waypoint. The function prints progress to the player.
// Parameters:
//    coords – an array of coordinate pairs [x1, y1, x2, y2, ...]
//------------------------------------------------------------------------------------------------------------------------------------------
function walkCoordinates(coords) {
    for (var i = 0; i < coords.length; i += 2) {
        Orion.WalkTo(coords[i], coords[i + 1], 0, 3, 255, 1, 1, 25000);
        Orion.CharPrint('self', 92, 'Walking to: [' + coords[i] + ', ' + coords[i + 1] + ']');
    }
}