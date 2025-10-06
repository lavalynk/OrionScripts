//*************************************
//RAIL RECORDER
//Created By:  LavaLynk
//Version 1.0
//*************************************
//This will create a .txt file in the directory that
//the script is located in.  It will record as the
// following format:  X, Y,
//
//*************************************

function RailRecorderGUI(){
	if (Shared.GetVar('placeholder') == null){
		Shared.AddVar('placeholder', 'Enter Rail File Name')
		}
	Orion.Wait(100)
	var g = Orion.CreateCustomGump(101099);
	g.Clear();
	g.SetCallback('OnClick');
	const width = 8;
	const height = 5;
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

	g.AddResizepic(25, prompt, '0x0BB8', 200, 20);
	g.AddTextEntry(1005, 25, prompt, '0x0052', '', 190, 20);
	g.SetTextEntryPlaceholderText(Shared.GetVar('placeholder'));
	g.AddButton(1000,230, prompt, '0x481', '0x482', '0x483', ' ')
	g.AddTooltip('Set Rail File Name')

	g.AddButton(2000, 250, 12, '0xA94', '0xA94', '0xA95', 0);
	g.AddTooltip('Close');	
	
	prompt+=30	

	over = 85
	g.AddButton(1099, over, prompt, '0x2A30', '0x2A30', '0x2A30', ' ')
	g.AddText(over+22, prompt+4, '0x796', "Add Coords");	
	g.AddTooltip('Add Coords')

	prompt+=30					
	g.AddText(25, prompt+10, '72', 'Status: ')
	g.AddText(75, prompt+10, '55',Orion.GetGlobal('gui_status'));		
  
	g.AddText(25,10,89,"Rail Recorder - Lav#5921",0);

	g.SetNoClose(true);

	g.Update();
}
	  
function OnClick(_internal){
	var buttonID = CustomGumpResponse.ReturnCode();

	switch(buttonID){
		case 1000:
			Shared.AddVar('dir', '/' + CustomGumpResponse.Text(1005)  + ".txt")
			Shared.AddVar('placeholder',  CustomGumpResponse.Text(1005))
			UpdateGUIStatus(Shared.GetVar('dir') + ' selected.')						
			break;
			
		case 1099:
			addCoords()		
			break;
		
		case 2000:
			g = Orion.CreateCustomGump(101099)
			Shared.AddVar('placeholder', 'Enter Rail File Name')
			g.Close()
		}	
		}  
	
function UpdateGUIStatus(msg) {
	var currentMessage = Orion.GetGlobal('gui_status');
	if (currentMessage == msg) {
		return;
	}
	Orion.SetGlobal('gui_status', msg);
	RailRecorderGUI()
	}		
	
function addCoords(_internal) {
    Orion.ClearJournal();
	var filePath = Orion.CurrentScriptDirPath() + Shared.GetVar('dir')
	var file = Orion.NewFile()
	file.Open(filePath, true)
	Orion.Wait(50)
	file.Append(filePath)
	file.Write('[' + Player.X() + ',' + Player.Y() + ',' + Player.Z() + '], ')
	file.Close(); // Ensure the file is properly closed after writing
	UpdateGUIStatus('[' + Player.X() + ',' + Player.Y() + ',' + Player.Z() + '] added.');
}