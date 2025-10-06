//------------------------------------------------------------------------------------------------------------------------------------------
// step(direction, times)
// Moves the player a specified number of steps in the given direction.
// Parameters:
//    direction – movement direction (e.g., 'North', 'South', 'East', 'West').
//    times – number of steps to take.
//------------------------------------------------------------------------------------------------------------------------------------------
function step(direction, times) {
    for (var g = 0; g < times; g++) {
        Orion.Print('Stepping ' + direction + '!');
        Orion.Step(direction);
        Orion.Wait(200);
    }
}