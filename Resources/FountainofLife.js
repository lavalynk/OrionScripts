//*************************************
// Fountain of Life Assistant
// Created By: LavaLynk
// Version 1.2
//*************************************
//
// This script manages fountains of life and bandages 
// through two main functions:
//
// 1. **main()**: 
//    - Highlights all fountains of life within a 25-tile radius and stores their locations.
//    - For each fountain, it grabs bandages from a resource location, walks to the fountain, 
//      drops the bandages into the fountain, and highlights the fountain in green when the 
//      bandages are transferred.
//    - The process repeats until all fountains have been visited.
//
// 2. **mainRetrieve()**: 
//    - Highlights all fountains of life within a 25-tile radius and stores their locations.
//    - For each fountain, it retrieves bandages of a specific color (0x08A5) from the fountain, 
//      carries as many as the player can hold, and drops them off at a designated resource location.
//    - Once a fountain is emptied of the colored bandages, it is highlighted in green.
//
// Ensure that your drop-off location coordinates are set correctly and that any specific 
// resources (such as bandages or tools) are in place before running the script.
//
//*************************************

function Autostart(_internal){
	Orion.ToggleScript('GUI')
}

function GUI(){
	Orion.Wait(100)
	var g = Orion.CreateCustomGump(101099);
	g.Clear();
	g.SetCallback('OnClick');
	const width = 8;
	const height = 7;
	for (var y = 0; y < height; ++y) {
	for (var x = 0; x < width; ++x) {
      if (y == 0 && x == 0) {
        g.AddGumpPic(x * 35, y * 35, 0x9C40);
      }
      else if (x == 0 && y == height-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9C46);
      }
      else if (x == 0 && y > 0 && y < height-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9C43);
      }
      else if (x == width-1 && y > 0 && y < height-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9C45);
      }
      else if (y == height-1 && x == width-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9C48);
      } 
      else if (y == 0 && x == width-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9C42);
      } 
      else if (y == 0 && x > 0 && x < width-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9C41);
      } 
      else if (y == height-1 && x > 0 && x < width-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9C47);
      }
      else {
        g.AddGumpPic(x * 35, y * 35, 0x9C44);
      }
    }
  }	//End of Background Setup
	prompt = 50
	arrow = 235    
	
	g.AddCheckerTrans(0, 0, x*35, y*35);		
	
	g.AddText(60, prompt+5, ResourceColor(), 'Set Resource: ' + GetResource());
	g.AddButton(1001, 25, prompt, ResourceCheckBox(), ResourceCheckBox(), ResourceCheckBox(), '');  
	g.AddTooltip('Set Resource Container')
	prompt+=30
				
	g.AddLine(53.5, prompt+5, 233.5, prompt+5, 'white', 2)//0 to 285		
	prompt+=10  

	g.AddText(60, prompt+5, 70, 'Fountain Count: ' + fountainCounter());
	g.AddButton(1003, 25, prompt+3, '0x481', '0x482', '0x483', '')
	g.AddTooltip('Reset Fountain Counter')  
	prompt+=30
			
	g.AddLine(53.5, prompt+5, 233.5, prompt+5, 'white', 2)//0 to 285		
	prompt+=10  
	
	g.AddText(60, prompt+5, GetColorStatus('main'), "Stock Fountains");
	g.AddButton(1098, 25, prompt, GetCheckboxStatus("main"), GetCheckboxStatus("main"), GetCheckboxStatus("main"), '');  
	g.AddTooltip('Place bandages in Fountains.')
	prompt+=30	

	g.AddText(60, prompt+5, GetColorStatus('mainRetrieve'), "Retrieve Bandages");
	g.AddButton(1099, 25, prompt, GetCheckboxStatus("mainRetrieve"), GetCheckboxStatus("mainRetrieve"), GetCheckboxStatus("mainRetrieve"), '');  
	g.AddTooltip('Retrieve enhanced bandages.')
	prompt+=30				
	
	g.AddText(25, prompt+10, '72', 'Status: ')
	g.AddText(78, prompt+10, '55',Orion.GetGlobal('gui_status'));	

	g.AddText(25,10,89,"Fountains of Life - Lav #5921",0);

	g.Update();
}
//-------------------------------------------CASES------------------------------------------||	  
function OnClick(_internal){
	var buttonID = CustomGumpResponse.ReturnCode();

	switch(buttonID){
		case 1001:
			SetResource()
			Orion.Wait(100)
			GUI()
			break;
					
		case 1003:
			fountainCounter()
			Orion.Wait(100)
			GUI()
			break;	
			
		case 1098:
			Orion.ToggleScript('main')
			Orion.Wait(200)
			GUI()
			break;					
			
		case 1099:
			Orion.ToggleScript('mainRetrieve')
			Orion.Wait(200)
			GUI()
			break;		
		}	
		}  
//--------------------------------------GUI MODULES-------------------------------||		
function UpdateGUIStatus(msg) {
	var currentMessage = Orion.GetGlobal('gui_status');
	if (currentMessage == msg) {
		return;
	}
	Orion.SetGlobal('gui_status', msg);
	GUI()
	}		


function ResourceColor(_internal){
	if (GetResource() == 'not selected'){
		return 33
	}
	else{
		return 70
	}
}

function ResourceCheckBox(_internal){
	if (GetResource() == 'not selected'){
		return 0x2603
	}
	else{
		return 0x2602	
	}
}

function GetCheckboxStatus(scriptName) {
  const scriptRunning = Orion.ScriptRunning(scriptName) > 0;
  return scriptRunning ? 0x2602 : 0x2603;
}

function GetColorStatus(scriptName) {
	const scriptRunning = Orion.ScriptRunning(scriptName) > 0;
	return scriptRunning ? 70 : 33;
}

function GumpAction(gumpID, hookID, waitTime, closeGump)
{
    if (Orion.WaitForGump(1000))
    {
        var gump = Orion.GetGump('last');
        if ((gump !== null) && (!gump.Replayed()) && (gump.ID() === gumpID))
        {
            gump.Select(Orion.CreateGumpHook(hookID));
            Orion.Wait(waitTime);
            
            if (closeGump)
            {
                gump.Select(Orion.CreateGumpHook(0)); //Close Gump
                Orion.Wait(300);
                Orion.CancelTarget();
            }
        }
    }
}

function SetResource(_internal){
	UpdateGUIStatus('Set Resource Container...')
	Orion.WaitForAddObject('ac_resource',25000)
	Shared.AddVar('x', Orion.FindObject('ac_resource').X())
	Shared.AddVar('y', Orion.FindObject('ac_resource').Y())
	Shared.AddVar('z', Orion.FindObject('ac_resource').Z())			
}

function GetResource(_internal){
	var bb = Orion.FindObject('ac_resource');
	if(bb){
		return bb.Serial();
	}
	return 'not selected';
}

function GUIRefresh(_internal){
	Orion.Wait(5000)
	GUI()
}

function fountainCounter(_internal){
	fountain = Orion.FindType('0x2AC0', any, ground, 'items', 20)  
	return fountain.length
}

//------------------------------------------------------------------------------------------------------------------
// Main Functions
//------------------------------------------------------------------------------------------------------------------

function maxWeight(_internal){

	var weight = (Player.MaxWeight()- Player.Weight()) * 10
	return weight

}

function highlightFountain(_internal) {
    var fountains = Orion.FindType('0x2AC0', -1, 'ground', 'items', 25);
    var fountainData = []; // Array to store fountain info

    if (fountains.length > 0) {
        for (var i = 0; i < fountains.length; i++) {
            var fountainId = fountains[i];
            var fountainInfo = Orion.FindObject(fountainId);
            if (fountainInfo) {
                var x = fountainInfo.X();
                var y = fountainInfo.Y();

                // Highlight the area around the fountain
                Orion.AddHighlightArea(fountainId, -1, 'pos', '16113', 0, 0, 'all', x, y); //16116 Green
                //Orion.Print('Fountain found and highlighted at (' + x + ',' + y + ')');

                // Store the fountain's serial, x, and y in an object and add to the array
                fountainData.push({serial: fountainId, x: x, y: y});
            }
            Orion.Wait(1);
        }

        // Store the fountain data in a shared variable
        Shared.AddVar('fountainLocations', fountainData);
        //Orion.Print('Fountain data stored in shared variable.');
        UpdateGUIStatus('Fountain data stored...')
    } else {
	    UpdateGUIStatus('No fountains found...')
        //Orion.Print("No fountains found.");
    }
}
function Wait(delay){
	Orion.AddDisplayTimer('wait', delay, 'AboveChar', 'circle|bar', 'Waiting', 0, 100, '1151', 4, '0x90FF90FF' )
	Orion.Wait(delay)
}

function grabBandages() {
    // Walk to the resource location
    Orion.WalkTo(Shared.GetVar('x'), Shared.GetVar('y'), Shared.GetVar('z'));
    Wait(1250);

    // Find bandages in the resource location
    var bandages = Orion.FindType('0x0E21', '!0x08A5', GetResource());
	Orion.UseObject(GetResource())
	Wait(1250)
    // Check if any bandages are found
    if (bandages.length === 0) {
        UpdateGUIStatus("No bandages found.");	
        GUIRefresh()        
        Orion.Terminate('main');  // Stop the script
        return;
    }

    // Move the bandages to the player's backpack
    if (bandages.length > 0 && maxWeight() != 0) {
        //Orion.Print(bandages[0]);
        UpdateGUIStatus('Grabbing Bandages')
        Orion.MoveItem(bandages[0], maxWeight(), 'backpack');
        Wait(1500);  // Wait for the move action to complete
    }
}

function main(_internal) {
    // Highlight the fountains and store their locations
    highlightFountain();

    // Get stored fountain locations from the shared variable
    var fountainLocations = Shared.GetVar('fountainLocations');

    if (fountainLocations && fountainLocations.length > 0) {
        for (var i = 0; i < fountainLocations.length; i++) {
            // Execute grabBandages function
            grabBandages();

            // Get the current fountain's coordinates
            var fountain = fountainLocations[i];
            var x = fountain.x;
            var y = fountain.y;

            // Walk to the fountain's location
            Orion.WalkTo(x, y, 0); // Assuming z=0 for ground level, adjust as needed
			Wait(100)
			
            // Drop bandages from the backpack into the fountain
            var bandages = Orion.FindType('0x0E21', 0, 'backpack');
            if (bandages.length > 0) {
            UpdateGUIStatus('Dropping Bandages...')
                Orion.MoveItem(bandages[0], 0, fountain.serial); // Move all bandages to the fountain
                Wait(1500); // Wait for the move action to complete
            }

            // Highlight the fountain again with the 16116 (Green) code
            Orion.AddHighlightArea(fountain.serial, -1, 'pos', '16116', 0, 0, 'all', x, y);
            //Orion.Print('Bandages dropped at fountain (' + x + ',' + y + ') and highlighted.');
            UpdateGUIStatus('Success!')

            // Go back to the initial resource location to grab more bandages
            Orion.WalkTo(Shared.GetVar('x'), Shared.GetVar('y'), Shared.GetVar('z'));
        }
    } else {
        UpdateGUIStatus("No fountains found.");
    }
    Orion.RemoveHighlightArea('all')
    UpdateGUIStatus('Completed.')  
    GUIRefresh()  
}

function mainRetrieve(_internal) {
    // Highlight the fountains and store their locations
    highlightFountain();

    // Get stored fountain locations from the shared variable
    var fountainLocations = Shared.GetVar('fountainLocations');

    if (fountainLocations && fountainLocations.length > 0) {
        for (var i = 0; i < fountainLocations.length; i++) {
            // Get the current fountain's coordinates and serial
            var fountain = fountainLocations[i];
            var x = fountain.x;
            var y = fountain.y;
            var fountainId = fountain.serial;

            // Walk to the fountain's location
            Orion.WalkTo(x, y, 0); // Assuming z=0 for ground level, adjust as needed
            Wait(1000); // Wait for the player to arrive

            // Use the fountain object
            Orion.UseObject(fountainId);
            Wait(1500);

            // Find the bandages with color 0x08A5 in the fountain
            var bandages = Orion.FindType('0x0E21', '0x08A5', fountainId);

            // While there are bandages in the fountain, collect up to maxWeight and drop them off
            while (bandages.length > 0 && maxWeight() > 0) {
                // Move up to maxWeight bandages from the fountain to the player's backpack
                UpdateGUIStatus('Retrieving Bandages...')
                Orion.MoveItem(bandages[0], maxWeight(), 'backpack');
                Wait(1500); // Wait for the move action to complete

                // Walk to the resource location
                Orion.WalkTo(Shared.GetVar('x'), Shared.GetVar('y'), Shared.GetVar('z'));
				Wait(100)
				
                // Drop the bandages at the resource location
                var backpackBandages = Orion.FindType('0x0E21', '0x08A5', 'backpack');
                if (backpackBandages.length > 0) {
                    Orion.MoveItem(backpackBandages[0], 0, GetResource());
                    Wait(1500); // Wait for the move action to complete
                }

                // Walk back to the fountain and check for more bandages
                Orion.WalkTo(x, y, 0);
                Wait(1000); 

                // Refresh the list of bandages in the fountain
				Orion.UseObject(fountainId);
				Wait(1500)
                bandages = Orion.FindType('0x0E21', '0x08A5', fountainId);
            }

            // Once the fountain is empty of the colored bandages, highlight it green (16116)
            Orion.AddHighlightArea(fountainId, -1, 'pos', '16116', 0, 0, 'all', x, y);
            //Orion.Print('Fountain at (' + x + ',' + y + ') is now empty and highlighted green.');
            UpdateGUIStatus('Fountain is empty...')
        }
    } else {
        Orion.Print("No fountains found in the shared variable.");
    }
        Orion.RemoveHighlightArea('all')
        UpdateGUIStatus('Completed.')
        GUIRefresh()
}

function GUIRefresh(_internal){
	Wait(100)
	Orion.Exec('GUI')
	Orion.RemoveHighlightArea('all')
}