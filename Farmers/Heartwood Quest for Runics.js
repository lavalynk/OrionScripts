//------------------------------------------------------------------------------------------------------------------------------------------
// Heartwood Runics — AutoQuest GUI v1.00
// Author: LavaLynk
// Builds a custom gump to manage Heartwood questing: sets NPC/beetle, shows resource/tool counts,
// and toggles AutoQuest flow (take quest → gather mats → craft stools → mark → turn-in → accept reward).
// Includes charge readers (saw/tinker), beetle inventory movers, loot filters, and gump helpers.
//------------------------------------------------------------------------------------------------------------------------------------------
function Autostart(){
	GUI()
}
const Choices = {
  AutoQuest: 1004
}

function GUI(){
	Orion.Wait(100)
	var g = Orion.CreateCustomGump(101099);
	g.Clear();
	g.SetCallback('OnClick');
	const width = 8;
	const height = 11;
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
		g.AddCheckerTrans(0, 0, x*35, y*35);		  

		prompt = 40
		arrow = 235  
		g.AddText(25, prompt, '60', 'Quest NPC Serial: ' + GetQuestNPC());
		g.AddButton(1001, arrow, prompt, 0x603, 0x603, 0x604, "");
		prompt+=30
		
		g.AddText(25, prompt, '60', 'Beetle Serial: ' + GetBeetle());
		g.AddButton(1002, arrow, prompt, 0x603, 0x603, 0x604, "");	 
		prompt+=30
		
		g.AddLine(53.5, prompt, 233.5, prompt, 'white', 2)//0 to 285		
		prompt+=10

		g.AddTilePic(25,prompt,0x1029,0x07DA);
		g.AddText(55, prompt, '60', ' - ' + Orion.Count('0x1029', '0x07DA', backpack))//Oak Runic				
		g.AddTilePic(155,prompt,0x1029,0x04A8);
		g.AddText(185, prompt, '60', ' - ' + Orion.Count('0x1029', '0x04A8', backpack))//Yew
	
		prompt+=30
		
		g.AddTilePic(25, prompt, 0x1029, 0x04A7)
		g.AddText(55, prompt, '60', ' - ' + Orion.Count('0x1029', '0x04A7', backpack))	//Ash
		g.AddTilePic(155, prompt, 0x1029, 0x04A9)
		g.AddText(185, prompt, '60', ' - ' + Orion.Count('0x1029', '0x04A9', backpack))//Heartwood			
		prompt+=30		
		
		g.AddLine(53.5, prompt, 233.5, prompt, 'white', 2)//0 to 285		
		prompt+=10  
		
		g.AddTilePic(25,prompt,0x1BD7, 0);
		g.AddText(55, prompt, '60', ' - ' + Orion.Count('0x1BD7', -1, GetBeetle()) + ' boards in beetle.')		
		if(Orion.Count('0x1BD7',-1, GetBeetle()) < 90){;g.AddText(55, prompt, '33', ' - ' + Orion.Count('0x1BD7',-1,GetBeetle()) + ' boards in beetle.')}						
		prompt+=30

		g.AddTilePic(25,prompt, 0x1BF2, 0);
		g.AddText(55, prompt, '60', ' - ' + Orion.Count('0x1BF2',-1,GetBeetle()) + ' ingots in beetle.')	
		if(Orion.Count('0x1BF2',-1,GetBeetle()) < 10){;g.AddText(55, prompt, '33', ' - ' + Orion.Count('0x1BF2',-1,GetBeetle()) + ' ingots in beetle.')}				
		prompt+=30			
		  	  	  
		g.AddTilePic(25,prompt,0x1034, 0);
		g.AddText(55, prompt, '60', ' - ' + SawCharges() + ' charges.')
		if(SawCharges() < 10){;g.AddText(55, prompt, '33', ' - ' + SawCharges() + ' charges.')}		
		prompt+=30
	
		g.AddTilePic(25,prompt,0x1EB9, 0);
		g.AddText(55, prompt, '60', ' - ' + TinkerCharges() + ' charges.')	
		if(TinkerCharges() < 10){;g.AddText(55, prompt, '33', ' - ' + TinkerCharges() + ' charges.')}				
		prompt+=30	

		g.AddLine(53.5, prompt, 233.5, prompt, 'white', 2)//0 to 285		
		prompt+=10  


  var functionName = Orion.GetGlobal('gui_function_name')
  if (functionName == null || functionName == '') {
    functionName = "AutoQuest";
  }  
  			
		g.AddText(60, prompt+5, '75', "Run Script");
		g.AddButton(1004, 25, prompt, GetCheckboxStatus("AutoQuest"), GetCheckboxStatus("AutoQuest"), GetCheckboxStatus("AutoQuest"), '');  
		prompt+=30
				
		g.AddText(25, prompt+10, '72', 'Status: ')
		g.AddText(75, prompt+10, '55',Orion.GetGlobal('gui_status'));		
			  
		g.AddText(25,10,89,"Heartwood Runics - Lav#5921",0);
	
		g.Update();
}

function OnClick(){
  var functionName = Orion.GetGlobal('gui_function_name')
  if (functionName == null || functionName == '') {
    functionName = "AutoQuest";
  }
 
  var buttonID = CustomGumpResponse.ReturnCode();	
	switch(buttonID){
		case 1001:
			SetQuestNPC()
			GUI()
			break;
		
		case 1002:
			SetBeetle()
			GUI()
			break;
		
		case 1003:
			SetVendor()
			GUI()
			break;
		
		case 1004:
		    Orion.ToggleScript('AutoQuest')
		    GUI()
			break;
			
	    case Choices.Run:
	      ToggleScript(functionName, "Paused");
	      GUI();
	      break;
      					
	}
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

drop_saw = [0x1034]
drop_list = [0x0E75]
keep = [0x1029,0x2F59,0x2F58, 0x1096,0x2F5B]
//0x1029 - Runic Saw
//0x2F59 - Dragon Talisman
//0x2F58 - Circle Talisman

function AutoQuest(){
	sawuses = SawCharges()
	if (Orion.Count('0x1034', -1, backpack) == 0){
	CraftSaw()
	}
	while (sawuses < 10){	
	DropSaw()
	}
	while (sawuses >= 10){
	TakeQuest()
	GetWood()
	GetIngots()
	CraftStools()
	MarkQuestItem()
	TurnInQuest()
	AcceptReward()
	CheckLoot()
	while (Orion.Count('0x0E75', -1,backpack) != 0){
		DropBag()
		DropSaw()
		GetWood()
		GetIngots()
		sawuses = SawCharges()
		GUI()
	}
}
}
function CraftSaw(){
TinkerTools()
UpdateGUIStatus('Crafting Saw...')
ingot = Orion.Count('0x1BF2', -1, backpack)

while (Orion.Count('0x1034', -1, backpack) == 0){
		tinkertools = Orion.FindType('0x1EB9', -1, backpack)
		Orion.UseObject(tinkertools)
		GumpAction('0x000001CC', 1015, 500, false)
		GumpAction('0x000002AD', 15, 500, true)	
		Orion.Wait(1250)
}
}

function SawCharges() {
    var saw = Orion.FindTypeEx('0x1034', -1, 'backpack');
    if (saw.length > 0) {
        var sawProps = saw[0].Properties();
        var lines = sawProps.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf('Uses Remaining:') !== -1) {
                var chargesLine = lines[i];
                var charges = chargesLine.split(':')[1].trim().split(' ')[0];
                Orion.Print(charges);
                return charges;
            }
        }
    } else {
        Orion.Print('No tinker tool found.');
        return 0; 
    }
}

function TinkerCharges() {
    var tinker = Orion.FindTypeEx('0x1EB9', -1, 'backpack');
    if (tinker.length > 0) {
        var tinkerProps = tinker[0].Properties();
        var lines = tinkerProps.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf('Uses Remaining:') !== -1) {
                var chargesLine = lines[i];
                var charges = chargesLine.split(':')[1].trim().split(' ')[0];
                Orion.Print(charges);
                return charges;
            }
        }
    } else {
        Orion.Print('No tinker tool found.');
        return 0; // Return 0 if no tinker tool is found
    }
}

function GetWood(){

    var beetle = GetBeetle();
	var beetlebackpack = Orion.ObjAtLayer('backpack', GetBeetle()).Serial()
	    
    Orion.Print('Beetle Serial: ' + beetle);

    UpdateGUIStatus('Moving boards to backpack...');

    Orion.RequestContextMenu(beetle);
    Orion.WaitContextMenuID(beetle, 508); 
    Orion.Wait(1250);  

    var wood = Orion.FindType('0x1BD7', -1, beetlebackpack);
    Orion.Print('Number of wood pieces: ' + wood.length);

    if (Orion.Count('0x1BD7', -1, beetle) < 90) {
        UpdateGUIStatus('Not enough wood...');
        Orion.Terminate('AutoQuest');
        return;  
    }

    if (wood.length > 0) {
        Orion.MoveItem(wood, 90, backpack);
        Orion.Wait(1250);
    }

    Orion.Wait(1250); 
}

function GetIngots() {

    var beetle = GetBeetle();
    var beetlebackpack = Orion.ObjAtLayer('backpack', beetle).Serial();
    
    Orion.Print('Beetle Serial: ' + beetle);

    if (Orion.Count('0x1BF2', -1, backpack) < 20) {
        UpdateGUIStatus('Moving ingots to backpack...');
        Orion.RequestContextMenu(beetle);
        Orion.WaitContextMenuID(beetle, 508);  
        Orion.Wait(1250);  

        var ingots = Orion.FindType('0x1BF2', -1, beetlebackpack);
        Orion.Print('Number of ingot pieces: ' + ingots.length);

        if (Orion.Count('0x1BF2', -1, beetle) < 20) {
            UpdateGUIStatus('Not enough ingots...');
            Orion.Terminate('AutoQuest');
            return;  
        }

        if (ingots.length > 0) {
            Orion.MoveItem(ingots, 20, backpack);
            Orion.Wait(1250);  
        }
    }
    Orion.Wait(1250);  
}

function TakeQuest(){
	UpdateGUIStatus('Accepting Quest...')
    var txt = ' xmfhtmltok 130 68 220 48 0 0 10000 1114513 @@#1073882' // Arch Support
    while(true){
        Orion.UseObject(GetQuestNPC()); // quest npc
        Orion.Wait(300);
        var g = Orion.GetLastGump();
        var t =g.CommandList();
        for (i in t){
            if (Orion.Contains(t[i], txt)){
                g.Select(Orion.CreateCustomGump(1));
                Orion.Wait(1250)
                return;
            }
        }
        Orion.Wait(1250);
    }
}

function SetQuestNPC(){
	UpdateGUIStatus('Set the Quest NPC...')
	Orion.WaitForAddObject('ac_npc',25000);
}

function GetQuestNPC(){
	var npc = Orion.FindObject('ac_npc');
	if(npc){
		return npc.Serial();
	}
	return 'not selceted';
}

function SetBeetle(){
	UpdateGUIStatus('Set your beetle...')
	Orion.WaitForAddObject('ac_beetle',25000);
}

function GetBeetle(){
	var beetle = Orion.FindObject('ac_beetle');
	if(beetle){
		return beetle.Serial();
	}
	return 'not selceted';
}

function CraftStools(){
UpdateGUIStatus('Crafting Stools...')
delay = 1250
saw = Orion.FindType('0x1034', -1, backpack)
	if (saw.length > 0 && Orion.Count('0x0B5E', -1, backpack) < 10){
		Orion.UseObject(saw)
		Orion.Wait(500)
		GumpAction('0x000001CC', 9002, 500, false)
		GumpAction('0x000001CC', 1082, 500, false)
		GumpAction('0x000002AD', 10082, 500, true)
			if (Orion.WaitForPrompt(500))
				Orion.Wait(1500)
				Orion.SendPrompt('10');				
	}//End Create Stools
	while (Orion.Count('0x0B5E', -1, backpack) < 10){
		Orion.Wait(1250)
		GUI()
		}
}//End Function

function MarkQuestItem(){
i = 0
delay = 1250
stool = Orion.FindType('0x0B5E', -1, backpack)
	UpdateGUIStatus('Marking Quest items...')
	Orion.Print(stool.length)
	while (stool.length >= 10){
	Orion.RequestContextMenu(Player.Serial());
	Orion.WaitContextMenuID(Player.Serial(), 801);
	if (Orion.WaitForTarget(1000)){
		Orion.TargetObject(stool[i]);}
		i++
		if (i == 10){
		Orion.Wait(delay)
        Orion.CancelTarget();
		Orion.Wait(1250)        
		break;
		}		
	}
}

function TurnInQuest(){
UpdateGUIStatus('Completing Quest...')
Orion.UseObject(GetQuestNPC())
Orion.Wait(1250)
    var txt = 'xmfhtmltok 130 68 220 48 0 0 10000 1114513 @@#1073882' // Arch Support
    while(true){
        Orion.UseObject(GetQuestNPC); // quest npc
        Orion.Wait(700);
        var g = Orion.GetLastGump();
        var t =g.CommandList();
        for (i in t){
            if (Orion.Contains(t[i], txt)){
                g.Select(Orion.CreateCustomGump(4));             
                return;                
                }                
        }
        Orion.Wait(1000);
    }
}

function AcceptReward(){
	UpdateGUIStatus('Accepting Reward...')
    var txt = 'xmfhtmltok 130 68 220 48 0 0 10000 1114513 @@#1073882' // Arch Support
    while(true){
        Orion.UseObject(GetQuestNPC); // quest npc
        Orion.Wait(700);
        var g = Orion.GetLastGump();
        var t =g.CommandList();
        for (i in t){
            if (Orion.Contains(t[i], txt)){
                g.Select(Orion.CreateCustomGump(1));                            
                return;                
                }                
        }
        Orion.Wait(1000);
    }
}

function CheckLoot(){
	UpdateGUIStatus('Checking Loot...')
	Orion.Wait(1250)
	bag = Orion.FindTypeEx('0x0E75', -1, backpack)	
	Orion.UseObject(bag[0].Serial())
	Orion.Wait(1250)
	for (i in keep)
	{
		var f = Orion.FindType(keep[i],-1,bag[0].Serial());
		if (f.length <= 0 ) { continue; }
		f.forEach(
			function (x)
			{
			Orion.MoveItem(f, 0, backpack);
			Orion.Wait(1250)
			UpdateGUIStatus('ITEM FOUND!!!')
			}
					);
	}

}
function DropBag()
{
	UpdateGUIStatus('Dropping Bag...')
	for (i in drop_list)
	{
		var f = Orion.FindType(drop_list[i],-1,backpack);
		if (f.length <= 0 ) { continue; }
		f.forEach(
			function (x)
			{
			var distance = 1;
			var x = Player.X() + (Orion.Random(distance + 1) - distance);
			var y = Player.Y() + (Orion.Random(distance + 1) - distance);
			Orion.Drop(f, 0, x, y, Player.Z());
			Orion.Wait(1250)
			}
					);
	}
}
function DropSaw()
{
sawuses = SawCharges()

while (Orion.Count('0x1034', -1, backpack) != 0 && sawuses < 10){
	UpdateGUIStatus('Dropping Saw...')
	for (i in drop_saw)
	{
		var f = Orion.FindType(drop_saw[i],-1,backpack);
		if (f.length <= 0 ) { continue; }
		f.forEach(
			function (x)
			{
			var distance = 1;
			var x = Player.X() + (Orion.Random(distance + 1) - distance);
			var y = Player.Y() + (Orion.Random(distance + 1) - distance);
			Orion.Drop(f, 0, x, y, Player.Z());
			Orion.Wait(1250)
			}
					);
	}
}
while (Orion.Count('0x1034', -1, backpack) == 0){
	CraftSaw()
	sawuses = SawCharges()
	Orion.Wait(2500)
}
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

function UpdateGUIStatus(msg) {
  var currentMessage = Orion.GetGlobal('gui_status');
  if (currentMessage == msg) {
    return;
  }
  Orion.SetGlobal('gui_status', msg);
  GUI();
}

function ToggleScript(scriptName, status) {
  if (Orion.ScriptRunning(scriptName) > 0) {
    Orion.PauseScript(scriptName);
    status && UpdateGUIStatus(status);
  }
  else {
    if (Orion.ScriptRunning(scriptName) == 0) {
      Orion.ToggleScript(scriptName, true);
    } else {
      Orion.ResumeScript(scriptName);
    }
  }
}

function TinkerTools(){

while (Orion.Count('0x1EB9', -1, backpack) != 2){
	UpdateGUIStatus("Crafting Tinker's Tools...")
	GetIngots()
	Orion.Wait(5000)
	Orion.UseObject(Orion.FindType('0x1EB9', -1, backpack))
	GumpAction('0x000001CC', 11, 1500, true)		
	Orion.Wait(2500)
	}
	Orion.Wait(5000)
}