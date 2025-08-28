//-------------------------------------------------------------------------------------------------------------------------------------------------||
// Elemental Weapon Reforger
// v 1.1
// By: LavaLynk
//-------------------------------------------------------------------------------------------------------------------------------------------------||
// GLOBAL VARIABLES - ONLY CHANGE IF YOU KNOW WHAT YOU ARE DOING!!
//-------------------------------------------------------------------------------------------------------------------------------------------------||
var blacksmithGraphics = '0x0F4B|0x26BB|0x0F5E|0x1441|0x0F51|0x13FF|0x1401|0x0F61|0x13B6|0x13B9|0x27A2|0x27A4|0x27A7|0x4067|0x406C|0x406B|0x26BC|0x0F5C|0x143B|0x1439|0x26BA|0x26BD|0x26BF|0x26C0|0x1405';

var carpentryGraphics = '0x27A8|0x0E89|0x13F8|0x2D25';

var bowyerGraphics = '0x13B2|0x0F4F|0x13FD|0x26C2|0x26C3|0x27A5|0x2D1E|0x2D1F';

//-------------------------------------------------------------------------------------------------------------------------------------------------||
//-------------------------------------------------------------------------------------------------------------------------------------------------||
// GUI SETUP
//-------------------------------------------------------------------------------------------------------------------------------------------------||
function GUIReforger(){
	var g = Orion.CreateCustomGump(101069);
	g.Clear();
	g.SetCallback('OnClick');
	const width = 8;
	const cellSize = 35;
	const height = 7;
	const color = 1050;
	for (var y = 0; y < height; ++y) {
	for (var x = 0; x < width; ++x) {
      if (y == 0 && x == 0) {
        g.AddGumpPic(x * 35, y * 35, 0x9BF5, color);
      }
      else if (x == 0 && y == height-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9BFB, color);
      }
      else if (x == 0 && y > 0 && y < height-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9BF8, color);
      }
      else if (x == width-1 && y > 0 && y < height-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9BFA, color);
      }
      else if (y == height-1 && x == width-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9BFD, color);
      } 
      else if (y == 0 && x == width-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9BF7, color);
      } 
      else if (y == 0 && x > 0 && x < width-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9BF6, color);
      } 
      else if (y == height-1 && x > 0 && x < width-1) {
        g.AddGumpPic(x * 35, y * 35, 0x9BFC, color);
      }
      else {
        g.AddGumpPic(x * 35, y * 35, 0x9BF9, color);
      }
    }
  }	//End of Background Setup
		//g.AddCheckerTrans(0, 0, x*35, y*35);		     	          
						
		prompt = 50;
		arrow = 235;
		
		g.AddText(25, prompt, '60', 'Finished Container Serial: ' + GetFinishedContainer());
		g.AddButton(1001, 10, prompt+4, '0x2716', '0x2716', '0x2716',  "");
		prompt += 30;
		
		g.AddText(25, prompt, '60', 'Resource Container Serial: ' + GetResourceContainer());
		g.AddButton(1002, 10, prompt+4, '0x2716', '0x2716', '0x2716', "");
		prompt += 30;
		
		g.AddText(25, prompt, '60', 'Crafting Type: ' + GetToolType());
		g.AddButton(1003, 10, prompt + 4, '0x2716', '0x2716', '0x2716', ""); // Button for setting Tool Type
		prompt += 30;
		
		g.AddLine(53.5, prompt+5, 233.5, prompt+5, 'white', 2)//0 to 285						
		prompt+=10

		g.AddText(60, prompt+5, GetColorStatus('ForgeElemental'), 'Forge Elemental Weapons');
		g.AddButton(9999, 25, prompt, GetCheckboxStatus("ForgeElemental"), GetCheckboxStatus("ForgeElemental"), GetCheckboxStatus("ForgeElemental"), '');  		
						
		g.AddText(25, (height-1) * 35, '1152', 'Status: ')
		g.AddText(75, (height-1) * 35, '1105',Orion.GetGlobal('gui_status'));			
		  
	    var guiWidth = width * cellSize;
	    var text = "Elemental Reforging";
	    var averageCharWidth = 6; // Adjust this value based on your font and size
	    var centeredX = CalculateCenteredX(guiWidth, text, averageCharWidth);
	    g.AddText(centeredX, 10, 1152, text, 0);
		
		g.AddButton(1086, 45, 14, '0x2716', '0x2716', '0x2716', '1150')
		
		g.AddButton(868686, 225, 14, '0x2716', '0x2716', '0x2716', '1150');
	

	g.Update();
}

//-------------------------------------------------------------------------------------------------------------------------------------------------||
// GUI FUNCTIONS
//-------------------------------------------------------------------------------------------------------------------------------------------------||

function CalculateCenteredX(guiWidth, text, averageCharWidth) {
    var textWidth = text.length * averageCharWidth;
    return (guiWidth - textWidth) / 2;
}

function GetColorStatus(scriptName) {
  const scriptRunning = Orion.ScriptRunning(scriptName) > 0;
  return scriptRunning ? 63 : 1152;
}

function GetCheckboxStatus(scriptName) {
  const scriptRunning = Orion.ScriptRunning(scriptName) > 0;
  if (scriptRunning == true){
	  return 0x2602;
  }
  if (scriptRunning == false){
    return 0x2603;
  }
}

function UpdateGUIStatus(msg) {
	var currentMessage = Orion.GetGlobal('gui_status');
	
	if (currentMessage == msg) {
	 return;
	}
	
	Orion.SetGlobal('gui_status', msg);
	GUIReforger()
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

//-------------------------------------------------------------------------------------------------------------------------------------------------||
// GUI CASES
//-------------------------------------------------------------------------------------------------------------------------------------------------||
function OnClick(){
	var buttonID = CustomGumpResponse.ReturnCode();

	switch(buttonID){
	
		case 1001:
			SetFinishedContainer()
			Orion.Wait(100)
			GUIReforger()
			break;		

		case 1002:
			SetResourceContainer()
			Orion.Wait(100)			
			GUIReforger()
			break;	
			
		case 1003:
		    SetToolType();
		    Orion.Wait(100);
		    GUIReforger();
		    break;	
		    
		case 9999:
		    Orion.ToggleScript("ForgeElemental")
		    Orion.Wait(100);
		    GUIReforger();
		    break;			    							
	}
}

//-------------------------------------------------------------------------------------------------------------------------------------------------||
// SCRIPT OPERATIONS
//-------------------------------------------------------------------------------------------------------------------------------------------------||
function CheckTool() {
    var toolStorage = GetResourceContainer(); // Use the Resource Container as the tool storage
    var toolGraphic = Shared.GetVar("toolGraphic"); // Fetch tool graphic from Shared variable
    var toolColor = Shared.GetVar("toolColor"); // Fetch tool color (hue) from Shared variable

    if (!toolStorage || toolStorage === 'not selected') {
        UpdateGUIStatus("Resource Container is not set!");
        return;
    }

    var tool2 = Orion.FindTypeEx(toolGraphic, toolColor, backpack, 'items'); // Find tool in the backpack
    if (tool2.length > 0) {
        // Get the first tool's properties
        var toolObject = tool2[0];
        var toolProperties = toolObject.Properties().split("\n");

        // Extract "Uses Remaining" value
        var usesRemaining = GetUsesRemaining(toolProperties);
        if (usesRemaining !== null) {
            UpdateGUIStatus(usesRemaining + " charges left...")

            // If charges are low, recharge the tool
            if (usesRemaining < 10) {
            	UpdateGUIStatus("Recharging tool...")
                RechargeTool(toolStorage, toolGraphic, toolColor);
            }
        } else {
			UpdateGUIStatus("Error")
        }
    } else {
    	UpdateGUIStatus("No tool found...")
    }
}

// Helper function to extract "Uses Remaining" from properties
function GetUsesRemaining(properties) {
    for (var i = 0; i < properties.length; i++) {
        if (properties[i].indexOf("Uses Remaining:") > -1) {
            var parts = properties[i].split(":");
            if (parts.length > 1) {
                return parseInt(parts[1].trim(), 10);
            }
        }
    }
    return null; // Return null if not found
}

// Helper function to recharge the tool
function RechargeTool(toolStorage, toolGraphic, toolColor) {
    Orion.UseObject(toolStorage);
    Orion.Wait(1250);

    // Find the tool in storage
    var toolsInStorage = Orion.FindType(toolGraphic, toolColor, toolStorage, 'items');
    if (toolsInStorage.length > 0) {
        Orion.MoveItem(toolsInStorage[0], 1, backpack);
        Orion.Wait(1350);

        var newTool = Orion.FindTypeEx(toolGraphic, toolColor, backpack, 'items');
        if (newTool.length >= 2) {
            // Combine the tools
            Orion.UseObject(newTool[0].Serial());
            Orion.Wait(1350);
            Orion.TargetObject(newTool[1].Serial());
            Orion.Wait(1350);
            UpdateGUIStatus("Tool successfully recharged!");
        } else {
            UpdateGUIStatus("Failed to combine...")
        }
    } else {
        UpdateGUIStatus("No tools in storage...")
    }
}


function ForgeElemental() {
    var graphicsList = GetGraphicsList(); // Get the graphics list based on the tool type
    if (!graphicsList) {
        UpdateGUIStatus("Please select a valid tool.");
        return;
    }

    var toolGraphic = Shared.GetVar("toolGraphic"); // Fetch tool graphic from Shared variable
    var toolColor = Shared.GetVar("toolColor"); // Fetch tool color (hue) from Shared variable

    if (!toolGraphic || !toolColor) {
        Orion.Print(33, "Tool Graphic or Color is not set! Please set the tool first.");
        return;
    }

    WalktoSoulForge();
    Orion.Wait(1000);
    var delay = 1500;

    // Find all items in the backpack matching the graphics list
    var items = Orion.FindTypeEx(graphicsList, 'any', backpack, 'items');
    if (items.length === 0) {
        Orion.Print(33, "No matching items found in the backpack.");
        return;
    }

    items.forEach(function (x) {
        // Find the tool in the backpack
        var tool = Orion.FindTypeEx(toolGraphic, toolColor, backpack);
        if (!tool || tool.length === 0) {
            UpdateGUIStatus("Tool not found in the backpack! Aborting.");
            return;
        }

        Orion.UseObject(tool[0].Serial());
        Orion.Wait(delay);
        delay = 10;

        Orion.WaitForTarget(3000);
        var f = Orion.FindObject(x.Serial());
        if (f) {
            // Debug: Print the targeted item's serial
	        UpdateGUIStatus("Reforging: " + f.Serial());

            Orion.TargetObject(f.Serial());
            if (Orion.WaitForGump(3000)) {
                var gump0 = Orion.GetGump('last');
                if ((gump0 !== null) && (!gump0.Replayed()) && (gump0.ID() === '0x000F3EAC')) {
                    gump0.Select(Orion.CreateGumpHook(2));
                    Orion.Wait(1250);
                    ItemCheck(); // Check items after forging
                    CheckTool(); // Check and recharge the tool if needed
                }
            } else {
                Orion.Print(33, "Failed to open gump for item: " + f.Serial());
            }
        } else {
            Orion.Print(33, "Failed to find item with serial: " + x.Serial());
        }
    });

    TrashItems(); // Discard unwanted items
    Orion.ToggleScript("GUIRefresh")
}


function ItemCheck() {
    var graphicList = GetGraphicsList(); // Get the graphics list for the current tool type
    var itemStorage = GetFinishedContainer(); // Get the finished container for storage

    if (!graphicList) {
        UpdateGUIStatus("Invalid tool type! Cannot determine item graphics.");
        return;
    }

    // Find items matching the graphic list in the backpack
    var items = Orion.FindTypeEx(graphicList, 'any', backpack, 'items');
    if (!items || items.length === 0) {
        UpdateGUIStatus("No matching items found in the backpack.");
        return;
    }

    // Process each item
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemColor = item.Color(); // Get the item's color
        var itemSerial = item.Serial(); // Get item serial
        var message = ""; // Variable to hold the message
        var x = 0; // Variable to hold the x-coordinate
        var y = 0; // Variable to hold the y-coordinate

        // Debugging: Log item information
        if (itemColor == 0x04EC) {
            message = "100% Fire Weapon";
            x = 50;
            y = 50;
        } else if (itemColor == 0x04EB) {
            message = "90% Fire Weapon";
            x = 70;
            y = 50;
        } else if (itemColor == 0x04EA) {
            message = "70% Fire Weapon";
            x = 110;
            y = 50;
        } else if (itemColor == 0x04F2) {
            message = "100% Cold Weapon";
            x = 130;
            y = 50;
        } else if (itemColor == 0x04F1) {
            message = "90% Cold Weapon";
            x = 150;
            y = 50;
        } else if (itemColor == 0x04F0) {
            message = "70% Cold Weapon";
            x = 190;
            y = 50;
        } else if (itemColor == 0x04F8) {
            message = "100% Poison Weapon";
            x = 210;
            y = 50;
        } else if (itemColor == 0x04FE) {
            message = "100% Energy Weapon";
            x = 230;
            y = 50;
        } else {
            continue; // Skip to the next item if the hue does not match
        }
        UpdateGUIStatus(message);
        Orion.MoveItem(itemSerial, -1, itemStorage, x, y);
        Orion.Wait(1500)
    }
}



// Function to trash unwanted items
function TrashItems() {
	UpdateGUIStatus("Junking unwanted items...")
    // Find trash bins nearby
    var bin = Orion.FindTypeEx('0x0E77|0x2A9A', '0x0358|0x0000', ground, 'item|near', 20); // Increased range to 20
    if (!bin || bin.length === 0) {
        Orion.Print(33, "No Trash Bin Found!");
        return;
    }

    // Walk to the first trash bin
    Orion.WalkTo(bin[0].X(), bin[0].Y(), bin[0].Z(), 1, 255, 1, 1);
    Orion.Wait(1000);

    // Get the graphics list for the current tool type
    var graphicList = GetGraphicsList(); 
    if (!graphicList) {
        Orion.Print(33, "Unknown tool type! Cannot determine items to trash.");
        return;
    }

    var hues = '!0x04F2|!0x04F8|!0x04EC|!0x04FE|!0x04EB|!0x04EA|!0x04F0|!0x04F1'; // Non-matching hues

    // Find all items in the backpack matching the graphicList but not the hues
    var toss = Orion.FindTypeEx(graphicList, hues, backpack, 'items');
    if (toss.length === 0) {
        UpdateGUIStatus("No items to throw away!");
        return;
    }

    toss.forEach(function (item) {
        var f = Orion.FindObject(item.Serial());
        if (f) {
            // Move the item to the trash bin
            Orion.MoveItem(f.Serial(), -1, bin[0].Serial());
            UpdateGUIStatus("Tossing: " + f.Serial())
            Orion.Wait(1250);
        } else {
            Orion.Print(33, "Failed to find item: " + item.Serial());
        }
    });

	UpdateGUIStatus("Completed.")
}



// Function to walk to the Soul Forge
function WalktoSoulForge() {
    var forge = Orion.FindTypeEx('0x44C7', -1, ground, 'items', 10);
    if (forge.length > 0) {
        Orion.CharPrint(forge[0].Serial(), '101', 'Soul Forge!');
        Orion.WalkTo(forge[0].X(), forge[0].Y(), forge[0].Z());
    } else {
        Orion.CharPrint('self', '33', 'No soul forge found!');
    }
}

function GUIRefresh(){
	Orion.Wait(3000)
	GUIReforger()
}

function SetFinishedContainer() {
    UpdateGUIStatus('Set the Finished Container...');
    Orion.WaitForAddObject('ac_finishedContainer', 25000);
}

function GetFinishedContainer() {
    var container = Orion.FindObject('ac_finishedContainer');
    if (container) {
        return container.Serial();
    }
    return 'not selected';
}

function SetResourceContainer() {
    UpdateGUIStatus('Set the Resource Container...');
    Orion.WaitForAddObject('ac_resourceContainer', 25000);
}

function GetResourceContainer() {
    var container = Orion.FindObject('ac_resourceContainer');
    if (container) {
        return container.Serial();
    }
    return 'not selected';
}

function SetToolType() {
    UpdateGUIStatus('Set the Tool Type...');
    Orion.WaitForAddObject('ac_toolType', 25000); // Wait for user to select the tool type
}

function GetToolType() {
    var tool = Orion.FindObject('ac_toolType');
    if (tool) {
        var graphic = tool.Graphic(); // Get the graphic ID
        var color = tool.Color(); // Get the color (hue) of the tool

        // Store graphic ID and color in Shared variables
        Shared.AddVar("toolGraphic", graphic);
        Shared.AddVar("toolColor", color);

        // Map graphic IDs to tool names
        var toolMapping = {
            '0x13E3': 'Blacksmithing',
            '0x1022': 'Bowyer/Fletching', // Example graphic for Bowyer
            '0x1029': 'Carpentry' // Example graphic for Carpentry
            // Add more mappings here as needed
        };

        // Return the corresponding tool name or a default value
        return toolMapping[graphic] || 'Unknown Tool';
    }
    return 'not selected';
}

function GetGraphicsList() {
    var toolType = GetToolType(); // Retrieve the tool type using your existing logic

    if (toolType === 'Blacksmithing') {
        return blacksmithGraphics;
    } else if (toolType === 'Carpentry') {
        return carpentryGraphics;
    } else if (toolType === 'Bowyer/Fletching') {
        return bowyerGraphics;
    }

    return ''; // Return an empty string if the tool type is invalid
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


function ensureIngots(requiredCount) {
    const ingots = Orion.Count('0x1BF2', -1, 'backpack'); // Ingot Type
    if (ingots >= requiredCount) {
        return true; // Sufficient ingots available
    }

    Orion.Print('Not enough ingots in backpack. Checking resource container...');
    Orion.WalkTo(Shared.GetVar('x'), Shared.GetVar('y'), Shared.GetVar('z'));
    Orion.UseObject(GetResourceContainer());
    Orion.Wait(1250);

    const containerIngots = Orion.FindType('0x1BF2', -1, GetResourceContainer());
    if (containerIngots.length === 0) {
        Orion.Print('No ingots found in the resource container. Stopping script.');
        return false; // No ingots available in the container
    }

    const amountToMove = 600
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

function craftTongs() {
    Orion.Print('Crafting Tongs...');

    // Find Tinker Tools in the backpack
    var tools = Orion.FindType('0x1EB9', -1, 'backpack'); // Tinker Tools graphic ID
    if (tools.length === 0) {
        Orion.Print('No Tinker Tools found in the backpack. Cannot craft Tongs.');
        return false; // Stop if no Tinker Tools are available
    }

    Orion.UseObject(tools[0]); // Use the first available Tinker Tools
    Orion.Wait(1500);

    if (Orion.WaitForGump(2000)) {
        GumpAction('0x000001CC', 9003, 100, false); // Open Tinkering menu
        Orion.Wait(1000);
        GumpAction('0x000001CC', 20, 100, false); // Craft Tongs (hook ID for tongs crafting)
        Orion.Wait(5000);

        // Verify if Tongs were crafted
        const tongs = Orion.FindType('0x0FBC', -1, 'backpack'); // Tongs graphic ID
        if (tongs.length > 0) {
            Orion.Print('Tongs crafted successfully.');
            return true;
        } else {
            Orion.Print('Failed to craft Tongs.');
            return false;
        }
    }

    Orion.Print('Failed to open the crafting menu for Tongs.');
    return false;
}

function craftDoubleAxe() {
    const requiredIngots = 100;

    while (true) {
        // Check for Tongs in the backpack
        var tongs = Orion.FindType('0x0FBC', -1, 'backpack'); // Tongs
        if (tongs.length > 0) {
            Orion.UseObject(tongs[0]); // Use the first available tongs
            Orion.Wait(1500);

            // Check for Ingots
            if (!ensureIngots(requiredIngots)) {
                Orion.Print('Not enough ingots remaining. Breaking from crafting loop.');
                break; // Break the loop if not enough ingots are available
            }

            // First Gump Action
            GumpAction('0x000001CC', 9005, 300, false);

            // Second Gump Action in a loop
            while (true) {
                const currentIngots = Orion.Count('0x1BF2', -1, 'backpack');

                // Check if ingots are insufficient
                if (currentIngots < 12) {
                    Orion.Print('Not enough ingots remaining for crafting. Exiting inner loop.');
                    break; // Exit the inner loop
                }

                // Check if the tool is worn out
                if (Orion.InJournal('You have worn out your tool!', 'system')) {
                    Orion.ClearJournal('You have worn out your tool!'); // Clear the journal entry
                    Orion.Print('Your tool is worn out. Crafting new Tongs...');

                    // Craft new Tongs
                    if (!craftTongs()) {
                        Orion.Print('Failed to craft Tongs. Stopping script.');
                        return; // Stop the script if crafting new Tongs fails
                    }

                    Orion.Print('New tongs crafted. Resuming crafting.');
                    break; // Exit the inner loop to restart with new tongs
                }

                // Perform the crafting action
                GumpAction('0x000001CC', 61, 300, false);
            }
        } else {
            Orion.Print('No tongs found in backpack. Crafting Tongs...');
            if (!craftTongs()) {
                Orion.Print('Failed to craft Tongs. Stopping script.');
                return; // Stop the script if crafting new Tongs fails
            }
        }

        // Check again for ingots after the inner loop
        if (Orion.Count('0x1BF2', -1, 'backpack') < requiredIngots) {
            Orion.Print('Not enough ingots remaining to continue crafting. Exiting outer loop.');
            break; // Break the outer loop if remaining ingots are insufficient
        }
    }

    Orion.Print('Crafting complete or insufficient ingots remaining.');
}



function main() {
    while (true) {
        Orion.Print('Starting main loop...');
		WalktoSoulForge()
        // Step 1: Check Tinker Tools
        if (!checkTinkerTools()) {
            Orion.Print('Failed to ensure Tinker Tools. Stopping script.');
            return; // Stop if Tinker Tools cannot be ensured
        }

        // Step 2: Craft Double Axes
        craftDoubleAxe();

        // Step 3: Use Forged Elemental
        ForgeElemental();

        Orion.Print('Main loop iteration complete.');
    }
}

function Wait(delay) {
    Orion.AddDisplayTimer('wait', delay, 'AboveChar', 'circle|bar', 'Waiting', 0, 100, '1151', 4, '0x90FF90FF');
    Orion.Wait(delay);
}