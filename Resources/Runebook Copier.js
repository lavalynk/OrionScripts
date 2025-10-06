//--------------------------------------------------------------------------------------------------------------------------------
// Runebook Copier
// Created By: LavaLynk
// Version: 1.00
//--------------------------------------------------------------------------------------------------------------------------------

function GUICopy(){
	var g = Orion.CreateCustomGump(101021);
	g.Clear();
	g.SetCallback('OnClick');
	const width = 8;
	const cellSize = 35;
	const height = 6;
	const color = 110040;
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
		
		g.AddText(25, prompt, '60', 'Master Runebook: ' + GetOld() );
		g.AddButton(1001, 10, prompt+4, '0x2716', '0x2716', '0x2716',  "");
		prompt += 30;
		
		g.AddText(25, prompt, '60', 'Target Runebook: ' + GetNew());
		g.AddButton(1002, 10, prompt+4, '0x2716', '0x2716', '0x2716', "");
		prompt += 30;
				
		g.AddLine(53.5, prompt+5, 233.5, prompt+5, 'white', 2)//0 to 285						
		prompt+=10

		g.AddText(60, prompt+5, GetColorStatus('CopyRunebookProcess'), 'Copy Runebook');
		g.AddButton(9999, 25, prompt, GetCheckboxStatus("CopyRunebookProcess"), GetCheckboxStatus("CopyRunebookProcess"), GetCheckboxStatus("CopyRunebookProcess"), '');  		
						
		g.AddText(25, (height-1) * 35, '1152', 'Status: ')
		g.AddText(75, (height-1) * 35, '1105',Orion.GetGlobal('gui_status'));			
		  
	    var guiWidth = width * cellSize;
	    var text = "Runebook Copier";
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
	GUICopy()
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
			SelectOldRunebook() 
			Orion.Wait(100)
			GUICopy()
			break;		

		case 1002:
			SelectNewRunebook() 
			Orion.Wait(100)			
			GUICopy()
			break;	
					    
		case 9999:
		    Orion.ToggleScript("CopyRunebookProcess")
		    Orion.Wait(100);
		    GUICopy();
		    break;			    							
	}
}

//-------------------------------------------------------------------------------------------------------------------------------------------------||
// SCRIPT OPERATIONS
//-------------------------------------------------------------------------------------------------------------------------------------------------||

function CopyRunebookProcess() {
    var oldBookSerial = GetOld();
    if (!oldBookSerial) {
        UpdateGUIStatus("Aborting: No old book selected.");
        return;
    }

    var newBookSerial = GetNew();
    if (!newBookSerial) {
        UpdateGUIStatus("Aborting: No new book selected.");
        return;
    }

    var locations = GetRunebookLocations(oldBookSerial);
    if (locations.length === 0) {
        UpdateGUIStatus("Aborting: No valid locations found in the old runebook.");
        return;
    }

    CopyAndMarkRunes(oldBookSerial, newBookSerial, locations);
}


function CopyRunesToNewBook(masterBookSerial, targetBookSerial, locations) {
    if (locations.length === 0) {
        UpdateGUIStatus("Error: No locations to copy.");
        return;
    }

    Orion.Print("Copying " + locations.length + " runes to new book...");

    for (var i = 0; i < locations.length; i++) {
        UpdateGUIStatus("Dropping Rune: " + locations[i]);

        // Open the Master Runebook and Drop Rune (Button ID 200)
        Orion.UseObject(masterBookSerial);
        Orion.Wait(500);
        if (Orion.WaitForGump(1000)) {
            var gump = Orion.GetGump('last');
            if (gump) {
                gump.Select(Orion.CreateGumpHook(200)); // Drop Rune Button
                Orion.Wait(1000);
            }
        }

        // Pick Up the Rune and Drop it into the Target Runebook
        var rune = Orion.FindType('0x1F14', -1, 'ground'); // Rune Object
        if (rune.length > 0) {
            Orion.MoveItem(rune[0], 1, targetBookSerial);
            Orion.Wait(1000);
        } else {
		 UpdateGUIStatus("Error. No drop.");
        }
    }

    Orion.Print("Rune Copying Complete!");
}


function DropRuneFromRunebook(runebookSerial, initialRunes) {
    Orion.UseObject(runebookSerial);
    Orion.Wait(500); // Open the runebook
    Orion.Wait(1000);

    if (!Orion.WaitForGump(1000)) {
        UpdateGUIStatus("Runebook gump did not appear.");
        return null;
    }

    var gump = Orion.GetGump('last');
    if (!gump) {
        Orion.Print("Error: No gump found.");
        return null;
    }

    // Drop Rune from the Runebook
    gump.Select(Orion.CreateGumpHook(200));
    Orion.Wait(1000);

    // Find the newly dropped rune (ignoring initial runes)
    var timeout = 10;
    var newRuneSerial = null;

    while (timeout > 0) {
        var allRunes = Orion.FindType('0x1F14', -1, 'backpack');

        for (var j = 0; j < allRunes.length; j++) {
            if (initialRunes.indexOf(allRunes[j]) === -1) { 
                // Found a newly dropped rune not in the original list
                newRuneSerial = allRunes[j];
                break;
            }
        }

        if (newRuneSerial) {
            break;
        }

        Orion.Wait(100);
        timeout--;
    }

    // Verify and return the new rune
    if (newRuneSerial) {
        var runeObj = Orion.FindObject(newRuneSerial);
        if (runeObj) {
			UpdateGUIStatus("Dropped Rune: " + runeObj.Name());
            return { serial: runeObj.Serial(), name: runeObj.Name() }; // Return new rune serial and name
        }
    }

    UpdateGUIStatus("Warning: Rune not found in backpack.");
    return null;
}


function RecallToRune(runeSerial) {    
    var startX = Player.X();
    var startY = Player.Y();
    for (var i = 0; i < 5; i++) {
        UpdateGUIStatus("Attempting Recall (" + (i + 1) + "/5)...");
        Orion.Cast('Recall', runeSerial);

        Orion.Wait(5000); // Wait for teleportation to process
        var newX = Player.X();
        var newY = Player.Y();

        if (newX !== startX || newY !== startY) {
            UpdateGUIStatus("Recall success!");
            return true;
        }
    }

    UpdateGUIStatus("Recall failed...");
    return false;
}

function MarkNewRune(oldRuneName, initialRunes) {
    // Find the first rune in the initial array
    if (initialRunes.length === 0) {
        Orion.Print("No available runes to mark.");
        return null;
    }

    var newRuneSerial = initialRunes.shift(); // Get the first available blank rune

    // Target the rune and cast Mark
    Orion.WaitTargetObject(newRuneSerial);
    Orion.Cast('Mark');

    if (Orion.WaitForTarget(10000)) {
        Orion.TargetObject(newRuneSerial);
    }

    // Wait for spell processing
    Orion.Wait(3000);

    if (!Orion.InJournal("You have not yet recovered")) {
        UpdateGUIStatus("Mark successful. Renaming...");

        // Ensure the correct rune is used
        var runeObj = Orion.FindObject(newRuneSerial);
        if (!runeObj) {
	        UpdateGUIStatus("Error: Rune object not found.");
            return null;
        }

        // Use the rune and rename it **only once**
        Orion.Wait(3000)
        Orion.UseObject(newRuneSerial);
        Orion.Wait(1250);
        Orion.SendPrompt(Shared.GetVar('locationName'));
        UpdateGUIStatus("Rune renamed successfully.");

        return newRuneSerial; // Return the marked rune serial
    } else {
        UpdateGUIStatus("Mark failed.");
        return null;
    }
}


function ReturnRunesToBooks(oldRuneSerial, newRuneSerial, oldBookSerial, newBookSerial) {
    if (oldRuneSerial) {
        Orion.MoveItem(oldRuneSerial, 1, oldBookSerial);
        Orion.Wait(1250);
    }
    if (newRuneSerial) {
        Orion.MoveItem(newRuneSerial, 1, newBookSerial);
        Orion.Wait(1250);
    }
	UpdateGUIStatus("Runes returned to books.");
}

function CopyAndMarkRunes(oldBookSerial, newBookSerial, locations) {
    if (locations.length === 0) {
        UpdateGUIStatus("Error: No locations to copy.");
        return;
    }

    Orion.Print("Starting rune duplication...");
    
    // Capture initial runes in backpack
    var initialRunes = GetInitialRunes();

    for (var i = 0; i < locations.length; i++) {
        Shared.AddVar("locationName", locations[i])
        Orion.Wait(1250);
        
        var droppedRune = DropRuneFromRunebook(oldBookSerial, initialRunes);
        Orion.Wait(2000);
        if (!droppedRune) {
	        UpdateGUIStatus("Skipping rune due to drop failure.");
            continue;
        }

        if (!RecallToRune(droppedRune.serial)) {
	        UpdateGUIStatus("Skipping rune due to recall failure.");
            continue;
        }

        var newRune = MarkNewRune(droppedRune.name, initialRunes);
        Orion.Wait(2000);        
        if (!newRune) {
	        UpdateGUIStatus("Skipping rune due to mark failure.");
            continue;
        }

        ReturnRunesToBooks(droppedRune.serial, newRune, oldBookSerial, newBookSerial);
    }
    UpdateGUIStatus("Process complete...");
}


function GetRunebookLocations(runebookSerial) {
    Orion.UseObject(runebookSerial);
    Orion.Wait(500); // Allow time for the gump to open

    var gump = Orion.GetGump('last');

    if (!gump) {
        Orion.Print("Error: No gump found.");
        return [];
    }

    var detectedGumpID = gump.ID();

    if (!Orion.GumpExists('generic', runebookSerial, detectedGumpID)) {
        UpdateGUIStatus("Error: Runebook gump did not appear.");
        return [];
    }

    var locations = [];

    // Extract valid rune names (Skipping "Empty" slots)
    for (var i = 2; i < 18; i++) {
        var textEntry = gump.Text(i);
        if (textEntry && textEntry !== "Empty") {
            locations.push(textEntry);
        }
    }
    return locations; // Returns the array of locations
}



function SelectOldRunebook() {
    Orion.PrintFast("self", '85', 3, "Target the OLD (Master) Runebook...");
    Orion.WaitForAddObject("oldBook", 10000);

    if (Orion.ObjectExists("oldBook")) {
        var oldBookSerial = Orion.FindObject("oldBook").Serial();
        Orion.Print("Old Runebook Selected: " + oldBookSerial);
        return oldBookSerial;
    } else {
        Orion.Print("Error: No runebook selected.");
        return null;
    }
}

function SelectNewRunebook() {
    Orion.PrintFast("self", '85', 3, "Target the NEW (Target) Runebook...");
    Orion.WaitForAddObject("newBook", 10000);

    if (Orion.ObjectExists("newBook")) {
        var newBookSerial = Orion.FindObject("newBook").Serial();
        Orion.Print("New Runebook Selected: " + newBookSerial);
        return newBookSerial;
    } else {
        Orion.Print("Error: No runebook selected.");
        return null;
    }
}

function GetOld(){
    if (Orion.ObjectExists("oldBook")) {
        var oldBookSerial = Orion.FindObject("oldBook").Serial();
        return oldBookSerial;
    } else {
        return 'None Selected';
    }
}

function GetNew(){
    if (Orion.ObjectExists("newBook")) {
        var newBookSerial = Orion.FindObject("newBook").Serial();
        return newBookSerial;
    } else {
        return 'None Selected';
    }
}
function GetInitialRunes() {
    var initialRunes = Orion.FindType('0x1F14', -1, 'backpack');
    return initialRunes; // Returns an array of all rune serials in the backpack at start
}

