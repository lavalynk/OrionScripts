//------------------------------------------------------------------------------------------------------------------------------------------
// AddMount()
// Prompts the player to target their mount and stores it as “myMount” for later mounting.
//------------------------------------------------------------------------------------------------------------------------------------------
function AddMount() {
    Orion.Print('-1', 'Target your mount');
    Orion.AddObject('myMount');
}
//------------------------------------------------------------------------------------------------------------------------------------------
// MountAndDismount()
// Mounts the stored mount if unmounted, or dismounts if currently mounted.  
// Prompts the player to set a mount if one isn’t already stored.
//------------------------------------------------------------------------------------------------------------------------------------------
function MountAndDismount() {
    var mount = Orion.ObjAtLayer('Mount'); // Check if player is mounted

    if (!mount) { 
        if (!Orion.FindObject('myMount')) {
            Orion.Print('-1', 'Mount not set. Please target your mount.');
            AddMount(); 
        } else {
            Orion.UseObject('myMount'); // Mount up
        }
    } else {
        Orion.UseObject('self'); // Dismount
    }
}