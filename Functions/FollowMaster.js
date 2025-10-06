//------------------------------------------------------------------------------------------------------------------------------------------
// FollowMaster()
// Continuously follows a designated master character within range.  
// Automatically checks for null objects, missing serials, and distance > 6 before following.
//--------------------------------------------------------------------------
// SetMaster()
// Prompts the user to target and store the person to follow as “ac_master.”
//--------------------------------------------------------------------------
// GetMaster()
// Retrieves the stored master object if available; returns “not selected” if none is set.
//--------------------------------------------------------------------------
// GetMasterName()
// Returns the stored master’s name, or “not selected” if none is defined.
//------------------------------------------------------------------------------------------------------------------------------------------

function FollowMaster() {
  while (true) {
      var master = GetMaster();
      if (!master) {
          // If master is null or undefined, wait for 1000 milliseconds before checking again
          Orion.Wait(1000);
          continue;
      }

      var masterSerial;
      try {
          masterSerial = master.Serial();
      } catch (e) {
          // If there's an error retrieving the master serial, wait and try again
          Orion.Wait(1000);
          continue;
      }

      if (!Orion.ObjectExists(masterSerial)) {
          // If master object does not exist, wait and try again
          Orion.Wait(1000);
          continue;
      }

      var distance;
      try {
          distance = master.Distance();
      } catch (e) {
          // If there's an error retrieving the master distance, wait and try again
          Orion.Wait(1000);
          continue;
      }

      // If the distance is greater than 3, follow the master
      if (distance > 6) {
          Orion.Follow(masterSerial);
      }

      // Wait for 1000 milliseconds before checking again
      Orion.Wait(100);
  }    
}

function SetMaster(){
	Orion.Print(55, 'Set the person to follow!')
	Orion.WaitForAddObject('ac_master',25000);
}

function GetMaster(){
	var bb = Orion.FindObject('ac_master');
	if(bb){
		return bb;
	}
	return 'not selected';
}

function GetMasterName(){
	var bb = Orion.FindObject('ac_master');
	if(bb){
		return bb.Name();
	}
	return 'not selected';
}