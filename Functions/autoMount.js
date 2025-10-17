//------------------------------------------------------------------------------------------------------------------------------------------
// autoMount()
// Automatically mounts the player if not already mounted by using an ethereal mount found in the backpack.  
// Waits until the mounting animation completes before resuming.
//------------------------------------------------------------------------------------------------------------------------------------------

function autoMount(_internal) {
	var mountID = '0x2D9C|0x20F6'
	
    // Check if the player is already mounted by looking at the Mount layer
    if (Orion.ObjAtLayer('Mount') !== null) {
        UpdateGUIStatus('Already mounted.');
        return;
    }

    // Find the ethereal mount in the backpack with the specified graphic ID
    var etherealMount = Orion.FindType(mountID, any, 'backpack');

    if (etherealMount.length > 0) {
        // Use the ethereal mount
        Orion.UseObject(etherealMount[0]);
        UpdateGUIStatus('Mounting ethereal...');
        while (Player.Frozen()){
	        Orion.Wait(1000); // Wait to ensure mount action completes
	    }
    } else {
        UpdateGUIStatus('No ethereal mount found in backpack.');
    }
}