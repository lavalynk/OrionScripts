//-------------------------------------------------------------------------------------------------------------------------------------------------||
// Gardening Assistant
// Created By: LavaLynk
// Version 1.3
//-------------------------------------------------------------------------------------------------------------------------------------------------||
// This Gardening Assistant automates the process of harvesting,
// planting, clipping, and dropping off resources for your garden.
// It dynamically scans for plants and other resources within a 
// user-defined range, making the process more flexible.
//
// Key Features:
// 1. **Dynamic Plant Bed Scanning**: 
//    - The script dynamically searches for plants within a 4-tile radius 
//      (or other user-defined range) around the player. It does not rely 
//      on predefined coordinates, allowing more flexibility.
//
// 2. **Harvesting**:
//    - The script searches for harvestable plants based on specific 
//      item types (plant types like seeds or clippings).
//    - The script will automatically walk to the found plants, use 
//      clippers if necessary, and collect the resources.
//
// 3. **Planting Seeds**:
//    - Automatically plants seeds if the player has them in their 
//      backpack and the proper soil or dirt is found on the ground.
//    - Handles delays and retries if necessary.
//
// 4. **Clippers and Tool Handling**:
//    - If the player doesn't have clippers, the script will retrieve 
//      them from a designated resource container.  If player has
//      at least 70 tinkering skill, it will try to craft clippers.
//
// 5. **Resource Drop-off**:
//    - When the player's backpack becomes full, the script automatically 
//      walks to the pre-designated resource container and drops off 
//      collected items (e.g., seeds, clippings, plants).
//    - Items are dynamically managed based on their type, and feedback 
//      is provided to the user via the GUI.
//
// 6. **Weight Management**:
//    - The script monitors the player's weight. If the player is close 
//      to the maximum weight, it will automatically drop items at the 
//      designated container before resuming harvesting or planting.
//
// 7. **Real-Time GUI Feedback**:
//    - The script offers a GUI to provide real-time feedback and control.
//    - The GUI includes buttons for toggling the script’s different 
//      functions (such as harvesting or planting) and shows the current 
//      status, such as seed count, resource containers set, and harvesting status.
//
// 8. **Gump Handling**:
//    - The script handles the in-game gumps (user interfaces) for actions 
//      like plant harvesting or cutting clippings.
//    - Gump actions are automated, including handling gump interaction for 
//      harvesting resources or handling seeds.
//
// 9. **Bad Locations**:
//    - The script supports setting "bad locations" to avoid certain areas 
//      (e.g., blocked paths, traps, or places with dangerous NPCs).
//    - These locations are highlighted, and the script will avoid them during 
//      the automated walking process.
//
// Requirements:
// - Make sure to add your plant bed coordinates if needed.
// - The script will dynamically pick up plants within a 4-tile radius, 
//   but it is recommended to have enough space between plant beds.
// - You must have clippers available in the drop-off chest for cutting clippings. 
//   The script will not attempt to craft new tools, but will check the designated 
//   resource container for additional clippers if none are found in the backpack.
// - If you want to manage the drop-off chest or planting beds, use the 
//   GUI to set resource containers and toggle script functionality.
//
// Use the GUI to easily manage the gardening assistant and control its 
// functionality on the fly.
//-------------------------------------------------------------------------------------------------------------------------------------------------||
// GLOBAL VARIABLES - ONLY CHANGE IF YOU KNOW WHAT YOU ARE DOING!!
//-------------------------------------------------------------------------------------------------------------------------------------------------||
var plantTypes = '0x0CA5|0x0CA9|0x0D26|0x1A9A|0x0913|0x0C86'; // Types of plants to harvest
var clippers = '0x0DFD|0x0DFC';  // Clippers item type
var dropGoods = '0x5736|0x0DCF|0x0F42|0x1021|0x1A9C|0x4022'
var seedType = '0x0DCF|0x5736'
var seedColor = '0x002B|0x0042|0x0000'
var plantType = '0x0CA5|0x0CA9|0x0D26|0x1A9A|0x0913|0x0C86'

var badLocations = 	[
							[4006, 208],
							[4007, 208],
							[4008, 208],
							[4006, 207],
							[4007, 207],
							[4008, 207]					
							]

//-------------------------------------------------------------------------------------------------------------------------------------------------||
function Autostart(){
	Orion.ToggleScript('GUI')
}

function GUI(){
	Wait(100)
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

	g.AddText(60, prompt+5, 70, 'Seed Count: ');
	g.AddText(145, prompt+5, 70, seedCounter());	
	g.AddButton(1003, 25, prompt+3, '0x481', '0x482', '0x483', '')
	g.AddTooltip('Reset Seed Counter')  
	prompt+=30
			
	g.AddLine(53.5, prompt+5, 233.5, prompt+5, 'white', 2)//0 to 285		
	prompt+=10  
	
	g.AddText(60, prompt+5, GetColorStatus('startHarvest'), "Harvest Plants");
	g.AddButton(1099, 25, prompt, GetCheckboxStatus("startHarvest"), GetCheckboxStatus("startHarvest"), GetCheckboxStatus("startHarvest"), '');  
	g.AddTooltip('Harvest Garden Beds')
	prompt+=30	

	g.AddText(60, prompt+5, GetColorStatus('startPlanter'), "Plant Seeds");
	g.AddButton(1098, 25, prompt, GetCheckboxStatus("startPlanter"), GetCheckboxStatus("startPlanter"), GetCheckboxStatus("startPlanter"), '');  
	g.AddTooltip('Plant Seeds')
	prompt+=30				
	
	g.AddText(25, prompt+10, '72', 'Status: ')
	g.AddText(78, prompt+10, '55',Orion.GetGlobal('gui_status'));	

	g.AddText(25,10,89,"Gardening Assistant",0);

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
			seedCounter()
			Orion.Wait(100)
			GUI()
			break;	
			
		case 1098:
			Orion.ToggleScript('startPlanter')
			Orion.Wait(200)
			GUI()
			break;					
			
		case 1099:
			Orion.ToggleScript('startHarvest')
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
            Wait(waitTime);
            
            if (closeGump)
            {
                gump.Select(Orion.CreateGumpHook(0)); //Close Gump
                Wait(300);
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
	Wait(5000)
	GUI()
}

//---------------------------------SCRIPT------------------------------------||
function plantStats(_internal) {
    var gump = Orion.GetLastGump();
    var text = gump.TextList();

    var numbers = [];

    for (var i = 0; i < text.length; i++) {
        if (text[i].indexOf('/') !== -1) {  // Check if the string contains '/'
            var number = text[i].split('/')[0]; // Split the string at '/' and get the first element
            numbers.push(number); // Add the extracted number to the array
        }
    }
    if (numbers.length > 0) {
        if (numbers.length >= 1) {
            Shared.AddVar('resources', numbers[0]); // Storing the first extracted number
        }
        if (numbers.length >= 2) {
            Shared.AddVar('seeds', numbers[1]); // Storing the second extracted number        
        }
    } else {
        Orion.Print('No numbers found');
    }
}

function startHarvest() {
    UpdateGUIStatus('Scanning for plants...');
    
    if (!Orion.ScriptRunning('tooFar')) {
        Orion.ToggleScript('tooFar');
    }

    var id = 0;

    // Set bad locations (avoidance zones)
    badLocations.forEach(function(loc) {
        Orion.SetBadLocation(loc[0], loc[1]);
        Orion.AddHighlightArea(id, -1, 'pos', '0x0490', 0, 0, 'all', loc[0], loc[1]);
        id++;
    });

    // Dynamically scan for plants within a 4-tile radius (or other desired range)
    var plants = Orion.FindType(plantTypes, -1, 'ground', 'items', 25);

    if (plants.length > 0) {
        UpdateGUIStatus('Found ' + plants.length + ' plants. Harvesting...');
        handleFoundItems(plants);
    } else {
        UpdateGUIStatus('No plants found within range.');
        Orion.RemoveHighlightArea('all');
    }

    Orion.Terminate('tooFar');
    Orion.RemoveHighlightArea('all');    
    DropItems()
    GUIRefresh();
}


function tooFar(_internal){
	while (true){
		if (Orion.InJournal('too far')){
			Orion.Terminate('startHarvest')
			Wait(200)
			Orion.Exec('startHarvest')
			Orion.ClearJournal()
		}
	}		
}

function handleFoundItems(items) {
    items.forEach(function(item) {
        UpdateGUIStatus('Harvesting...');
        var itemObj = Orion.FindObject(item);

        if (itemObj) {
            Orion.CharPrint(itemObj.Serial(), 33, 'Harvesting Plant...');
            Orion.WalkTo(itemObj.X(), itemObj.Y(), itemObj.Z(), 3, 255, 1);
            Orion.UseObject(itemObj.Serial());
            Wait(1250);

            // Call clippers or any tools necessary
            if (!getClippers()) {
                UpdateGUIStatus('No Clippers! Stopping script.');
                Orion.Terminate('all'); // Stops the script
                return; // Exit from the current iteration
            }
            handleGumps();
			cutClippings()

            // Check if inventory is full and drop items if needed
            if (weightCheck()) {
                DropItems();
            }
        }
    });
}

function handleGumps(_internal) {
	GumpAction('0x00007492', 1, 500, false)
	plantStats()	
    for (var i = 0; i < Shared.GetVar('resources'); i++) {
		GumpAction('0x000056CE', 8, 100, false)
    }
    for (var i = 0; i < Shared.GetVar('seeds'); i++) {
		GumpAction('0x000056CE', 6, 100, false)
    }    
}

function returnToStart(x, y) {
    Orion.CharPrint(self, 59, 'Going to waiting spot.');
    Orion.WalkTo(x, y, Player.Z(), 1, 5, false);
	DropItems()
    Wait(10000);
//    Orion.CloseUO();
}


function getClippers() {
    const clippers = Orion.FindType('0x0DFC|0x0DFD', -1, 'backpack'); // Clippers in backpack
    if (clippers.length > 0) {
        return true; // Clippers found in backpack
    }

    // Record the player's current position
    const playerX = Player.X();
    const playerY = Player.Y();
    const playerZ = Player.Z();

    Orion.Print('No clippers found in backpack. Checking tinkering skill...');
    const tinkeringSkill = Orion.SkillValue('Tinkering');

    if (tinkeringSkill >= 700) {
        // Ensure at least 25 ingots in the backpack before proceeding
        if (!ensureIngots(25)) {
            Orion.Print('Not enough ingots to craft clippers or Tinker Tools. Proceeding to resource container...');
        } else if (!checkTinkerTools()) {
            Orion.Print('Failed to craft Tinker Tools. Proceeding to resource container...');
        } else if (craftClippers()) {
            Orion.Print('Successfully crafted clippers.');
            returnToPosition(playerX, playerY, playerZ); // Return to recorded position
            return true; // Successfully crafted clippers
        } else {
            Orion.Print('Failed to craft clippers. Proceeding to resource container...');
        }
    } else {
        Orion.Print('Tinkering skill below required level. Proceeding to resource container...');
    }

    // Walk to resource container and open it
    Orion.WalkTo(Shared.GetVar('x'), Shared.GetVar('y'), Shared.GetVar('z'));
    Orion.UseObject(GetResource());
    Orion.Wait(1250);

    // Check for Clippers in the resource container
    const containerClippers = Orion.FindType('0x0DFC|0x0DFD', -1, GetResource());
    if (containerClippers.length > 0) {
        Orion.Print('Clippers found in resource container. Retrieving...');
        Orion.MoveItem(containerClippers[0], 1, 'backpack'); // Move clippers to backpack
        Orion.Wait(1250);

        // Verify Clippers are now in the backpack
        const updatedClippers = Orion.FindType('0x0DFC|0x0DFD', -1, 'backpack');
        if (updatedClippers.length > 0) {
            Orion.Print('Successfully retrieved clippers from resource container.');
            returnToPosition(playerX, playerY, playerZ); // Return to recorded position
            return true; // Successfully retrieved clippers
        } else {
            Orion.Print('Failed to retrieve clippers from resource container.');
        }
    } else {
        Orion.Print('No clippers found in resource container.');
    }

    // If no clippers are available, stop the script
    Orion.Print('No clippers available. Stopping script.');
    UpdateGUIStatus('No clippers available. Stopping script.');
    Orion.Terminate('startHarvest');
    return false;
}

// Helper function to return the player to their original position
function returnToPosition(x, y, z) {
    Orion.Print('Returning to original position: ' + x + ', ' + y + ', ' + z);
    Orion.WalkTo(x, y, z, 0, 255, false); // Walk back to the recorded position
    Wait(1500); // Pause after returning
}



function ensureIngots(requiredCount) {
    const ingots = Orion.Count('0x1BF2', -1, 'backpack'); // Ingot Type
    if (ingots >= requiredCount) {
        return true; // Sufficient ingots available
    }

    Orion.Print('Not enough ingots in backpack. Checking resource container...');
    Orion.WalkTo(Shared.GetVar('x'), Shared.GetVar('y'), Shared.GetVar('z'));
    Orion.UseObject(GetResource());
    Orion.Wait(1250);

    const containerIngots = Orion.FindType('0x1BF2', -1, GetResource());
    if (containerIngots.length === 0) {
        Orion.Print('No ingots found in the resource container. Stopping script.');
        return false; // No ingots available in the container
    }

    const amountToMove = 100
    Orion.MoveItem(containerIngots[0], amountToMove, 'backpack');
    Orion.Wait(1250);

    const updatedIngots = Orion.Count('0x1BF2', -1, 'backpack');
    if (updatedIngots >= requiredCount) {
        return true; // Successfully retrieved enough ingots
    } else {
        Orion.Print('Failed to retrieve enough ingots. Stopping script.');
        return false;
    }
}


function craftClippers() {
    Orion.Print('Crafting Clippers...');
    
	var tools = Orion.FindType('0x1EB9', -1, 'backpack');
	
	Orion.UseObject(tools)
    
    if (Orion.WaitForGump(2000)) {
        GumpAction('0x000001CC', 9003, 100, false); // Open Tinkering menu
        Orion.Wait(1000);
        GumpAction('0x000001CC', 506, 100, false); // Craft Clippers
        Wait(5000);

        // Verify if Clippers were crafted
        const clippers = Orion.FindType('0x0DFC|0x0DFD', -1, 'backpack');
        return clippers.length >= 1;
    }

    return false; // Failed to craft clippers
}

function checkTinkerTools() {
    const tinkerTools = Orion.FindType('0x1EB9', -1, 'backpack'); // Tinker Tools
    if (tinkerTools.length >= 2) {
        return true; // At least 2 Tinker Tools available
    }

    Orion.Print('Crafting Tinker Tools...');
    return craftTinkerTools();
}

function craftTinkerTools() {
	var tools = Orion.FindType('0x1EB9', -1, 'backpack');
	
	Orion.UseObject(tools)
    if (Orion.WaitForGump(1000)) {
        GumpAction('0x000001CC', 9003, 100, false); // Gump action for crafting Tinker Tools
        Orion.Wait(1000);
        GumpAction('0x000001CC', 11, 100, false);
        Wait(5000);

        // Verify if Tinker Tools were crafted
        const tinkerTools = Orion.FindType('0x1EB9', -1, 'backpack');
        return tinkerTools.length >= 1;
    }

    return false; // Failed to craft Tinker Tools
}

function weightCheck(_internal) {
    if (Player.Weight() > Player.MaxWeight() - 75) {
        Orion.Print('Inventory approaching max weight limit. Dropping items...');
        return true;
    }
    return false;
}

function DropItems(_internal) {
    UpdateGUIStatus('Dropping items at resource container...');
    
    var dropItems = Orion.FindType(dropGoods, -1, 'backpack');
    if (dropItems.length > 0) {
        Orion.WalkTo(Shared.GetVar('x'), Shared.GetVar('y'), Shared.GetVar('z'));
        Orion.UseObject(GetResource());
        Wait(1500);

        dropItems.forEach(function(item) {
            Orion.MoveItem(item, 0, GetResource());
            Wait(1250);
        });

        UpdateGUIStatus('Items dropped off successfully.');
    }
}


function seedCounter(_internal){
	dirt = Orion.FindType('0x4B25|0x4B28|0x4B23|0x4B24|0x4B29|0x4B25|0x4B26|0x4B2A|0x4B27|0x4B22', any, ground, 'items', 20)  
	return dirt.length
}

function startPlanter() {
    var dirt = '0x4B25|0x4B28|0x4B23|0x4B24|0x4B29|0x4B25|0x4B26|0x4B2A|0x4B27|0x4B22';
    Orion.ClearJournal();
    while (true) {
        if (Player.Dead()) return false;

        // look for dirt once per cycle
        var found = Orion.FindType(dirt, 'any', 'ground', 'items', 20);
        if (!found || found.length === 0) {
            UpdateGUIStatus('No dirt found...');
            return false;
        }
        
        UpdateGUIStatus('Planting seeds...');
        Orion.CharPrint(self, 69, 'Found: ' + found.length);

        for (var i = 0; i < found.length; i++) {
            var dSerial = found[i];

            // re-fetch seed stack each time
            var seeds = Orion.FindType(seedType, seedColor, 'backpack', 'items');
            if (!seeds || seeds.length === 0) {
                UpdateGUIStatus('Out of seeds...');
                return false;
            }
            var seedSerial = seeds[0];

            Orion.ClearJournal();
            Orion.CharPrint(dSerial, 33, 'Target to be planted!');
            Orion.UseObject(seedSerial);
            Orion.Wait(1250);
            Orion.Print(dSerial);
            Orion.TargetObject(dSerial);

            if (Orion.InJournal('must wait')) {
                Orion.Print('Delay encountered, retrying...');
                Orion.Wait(1250);
                Orion.UseObject(seedSerial);
                Orion.TargetObject(dSerial);
                Orion.Wait(1250);
            }
        }
        // once done planting all found dirt, loop back to look for more
    }
}

function cutClippings(_internal){
	clippers = Orion.FindType('0x0DFC|0x0DFD', -1, backpack)
	GumpAction('0x000056CE', 2, 1000, false)
	GumpAction('0x0000A5B6', 1, 1000, true)
	Wait(500)
	while(Orion.Count(plantType, -1, backpack) != 0){	
		plants = Orion.FindType(plantType, -1, backpack)	
        getClippers()		
		Orion.UseObject(clippers[0])	
		Orion.WaitForTarget(1000)
		Orion.TargetObject(plants[0])
		Wait(1500)
		plants = Orion.FindType(plantType, -1, backpack)		
	}	
		GumpAction('0x000056CE', 0, 100, true)    	
}


function getResourceContainerCoordinates(_internal) {
    Orion.Print('Please target the resource container.');
    Orion.WaitForAddObject('container', 60000);  // Wait for user to target the container
    
    var container = Orion.FindObject('container');
    if (container) {
        Orion.Print('Container targeted successfully.');
        Shared.AddVar('resourceContainerSerial', container.Serial());
        Shared.AddVar('resourceContainerX', container.X());
        Shared.AddVar('resourceContainerY', container.Y());
        Shared.AddVar('resourceContainerZ', container.Z());
        return true;
    } else {
        Orion.Print('Error: Could not find the container object.');
    }
    
    return false;
}

function handleBarrelSponges() {
    if (!getResourceContainerCoordinates()) {
        return;
    }

    var resourceContainerSerial = Shared.GetVar('resourceContainerSerial');
    var resourceContainerX = Shared.GetVar('resourceContainerX');
    var resourceContainerY = Shared.GetVar('resourceContainerY');
    var resourceContainerZ = Shared.GetVar('resourceContainerZ');

//    Orion.Print('Resource container coordinates: X=' + resourceContainerX + ', Y=' + resourceContainerY + ', Z=' + resourceContainerZ);

    var items = Orion.FindTypeEx('0x4C30', -1, 'ground', 'item', 15);
//    Orion.Print('Barrel Sponges found: ' + items.length);

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        // Walk to the item
        Orion.WalkTo(item.X(), item.Y(), item.Z());
        Wait(1250);  // Add a small delay to ensure walking is completed

        // Save player's current coordinates
        Shared.AddVar('playerX', Player.X());
        Shared.AddVar('playerY', Player.Y());
        Shared.AddVar('playerZ', Player.Z());

        while (true) {
            var properties = item.Properties();
//            Orion.Print('Barrel Sponge ' + (i + 1) + ' properties: ' + properties);

            if (properties) {
                if (properties.toLowerCase().indexOf('potions:') !== -1) {
                    var potionsMatch = properties.match(/potions:\s*(\d+)/i);

                    if (potionsMatch) {
                        var potionsCount = parseInt(potionsMatch[1]);
                        //Orion.Print('Potions found: ' + potionsCount);

                        if (potionsCount > 0) {
                            Orion.UseObject(item.Serial());
                            Orion.Print('Using Barrel Sponge: ' + item.Serial());
                            Wait(1250);  // Add a small delay to avoid too rapid actions
                            
                            // Walk to the resource container
                            //Orion.Print('Walking to resource container at X=' + resourceContainerX + ', Y=' + resourceContainerY + ', Z=' + resourceContainerZ);
                            Orion.WalkTo(resourceContainerX, resourceContainerY, resourceContainerZ);
                            Wait(1250);  // Add a small delay to ensure walking is completed

                            // Drop off potions into the container
                            var potions = Orion.FindType('0x0F0D|0x0F0A|0x0F06', -1, 'backpack');
                            //Orion.Print('Potions in backpack: ' + potions.length);
                            for (var j = 0; j < potions.length; j++) {
                                if (potions[j]) {
                                    //Orion.Print('Moving potion: ' + potions[j]);
                                    while (true) {
                                        Orion.MoveItem(potions[j], 0, resourceContainerSerial);
                                        Wait(1250);  // Add a small delay to ensure item is moved
                                        if (Orion.InJournal('You must wait to perform')) {
                                            Orion.ClearJournal();
                                            Orion.Print('Retrying to move potion: ' + potions[j]);
                                            Wait(1250)
                                        } else {
                                            break;
                                        }
                                    }
                                } else {
                                    Orion.Print('Error: Potion at index ' + j + ' is undefined.');
                                }
                            }

                            // Move back to the player's previous position
                            var playerX = Shared.GetVar('playerX');
                            var playerY = Shared.GetVar('playerY');
                            var playerZ = Shared.GetVar('playerZ');
                            Orion.Print('Walking back to player position at X=' + playerX + ', Y=' + playerY + ', Z=' + playerZ);
                            Orion.WalkTo(playerX, playerY, playerZ);
                            Wait(1250);  // Add a small delay to ensure walking is completed

                        } else {
                            break; // Exit while loop if no more potions
                        }
                    } else {
                        Orion.Print('Potions match failed for Barrel Sponge ' + (i + 1));
                        break; // Exit while loop if no potions match
                    }
                } else {
                    Orion.Print('No potions found in Barrel Sponge ' + (i + 1));
                    break; // Exit while loop if no 'potions' property
                }
            } else {
                Orion.Print('No properties found for Barrel Sponge ' + (i + 1));
                break; // Exit while loop if no properties
            }
        }
    }
}

function petalsTrinsic() {
    var items = Orion.FindTypeEx('0x234D', -1, 'ground', 'item', 15);
    Orion.Print('Items found: ' + items.length);

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        // Clear the journal before interacting with the item
        Orion.ClearJournal();

        // Walk to the item
        Orion.WalkTo(item.X(), item.Y(), item.Z());
        Wait(1000);  // Add a small delay to ensure walking is completed

        while (true) {
            var properties = item.Properties();
            Orion.Print('Item ' + (i + 1) + ' properties: ' + properties);

            // Check the journal for "You are not allowed"
            if (Orion.InJournal('You are not allowed')) {
                Orion.Print('Access denied to item ' + (i + 1));
                Orion.ClearJournal();  // Clear the journal before moving on
                break; // Skip this item and move to the next
            }

            if (properties) {
                if (properties.toLowerCase().indexOf('petals:') !== -1) {
                    var petalsMatch = properties.match(/petals:\s*(\d+)/i);

                    if (petalsMatch) {
                        var petalsCount = parseInt(petalsMatch[1]);
                        Orion.Print('Petals found: ' + petalsCount);

                        if (petalsCount > 0) {
                            Orion.UseObject(item.Serial());
                            Orion.Print('Using item: ' + item.Serial());
                            Wait(1000);  // Add a small delay to avoid too rapid actions
                        } else {
                            break; // Exit while loop if no more petals
                        }
                    } else {
                        Orion.Print('Petals match failed for item ' + (i + 1));
                        break; // Exit while loop if no petals match
                    }
                } else {
                    Orion.Print('No petals found in item ' + (i + 1));
                    break; // Exit while loop if no 'petals' property
                }
            } else {
                Orion.Print('No properties found for item ' + (i + 1));
                break; // Exit while loop if no properties
            }
        }
    }
}

function Wait(delay) {
    Orion.AddDisplayTimer('wait', delay, 'AboveChar', 'circle|bar', 'Waiting', 0, 100, '1151', 4, '0x90FF90FF');
    Orion.Wait(delay);
}