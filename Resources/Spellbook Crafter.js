//*************************************
//SPELLBOOK CRAFTER AND FILLER
//Created By:  LavaLynk
//Version 1.1
//*************************************
//Just to make sure that you set your resource
//container and set the spellbook before you 
//try to use the filler.
//
//Everything else should be pretty self explanatory.
//v1.1 - I had the Mystic and Necro buttons switched.
//*************************************


function Autostart(){
	Orion.ToggleScript('GUI')
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
	prompt = 50
	arrow = 235    
	
	g.AddCheckerTrans(0, 0, x*35, y*35);		
	
	g.AddText(60, prompt+5, ResourceColor(), 'Set Resource: ' + GetResource());
	g.AddButton(1001, 25, prompt, ResourceCheckBox(), ResourceCheckBox(), ResourceCheckBox(), '');  
	g.AddTooltip('Set Resource Container')
	prompt+=30
	
	g.AddText(60, prompt+5, SpellBookColor(), 'Set Spellbook: ' + GetSpellBook());
	g.AddButton(1002, 25, prompt, SpellBookCheckBox(), SpellBookCheckBox(), SpellBookCheckBox(), '');  
	g.AddTooltip('Set Spellbook Target')
	prompt+=30
//	g.AddText(60, prompt+5, GetColorStatus('AutoConWeap'), 'Set Resource:');
//	g.AddButton(1001, 25, prompt, GetCheckboxStatus("AutoConWeap"), GetCheckboxStatus("AutoConWeap"), GetCheckboxStatus("AutoConWeap"), '');  
//	prompt+=30
			
	g.AddLine(53.5, prompt+5, 233.5, prompt+5, 'white', 2)//0 to 285		
	prompt+=10  

	g.AddText(60, prompt+5, 70, 'Craft Runebook');
	g.AddButton(1003, 25, prompt+3, '0x481', '0x482', '0x483', '')
	g.AddTooltip('Craft Runebook')  
	prompt+=30

	g.AddText(60, prompt+5, 70, 'Craft Magery Spellbook');
	g.AddButton(1004, 25, prompt+3, '0x481', '0x482', '0x483', '');  
	g.AddTooltip('Craft Magery Spellbook')
	prompt+=30
	
	g.AddText(60, prompt+5, 70, "Craft Scrapper's Compendium");
	g.AddButton(1005, 25, prompt+3, '0x481', '0x482', '0x483', '');  
	g.AddTooltip("Craft Scrapper's Compendium")
	prompt+=30	
	
	g.AddText(60, prompt+5, 70, 'Craft Necromancy Book');
	g.AddButton(1007, 25, prompt+3, '0x481', '0x482', '0x483', '');  
	g.AddTooltip('Craft Necromancy Book')	
	prompt+=30

	g.AddText(60, prompt+5, 70, 'Craft Mysticism Spellbook');
	g.AddButton(1006, 25, prompt+3, '0x481', '0x482', '0x483', '');  
	g.AddTooltip('Craft Mysticism Spellbook')	
	prompt+=30
	
	g.AddText(60, prompt+5, 70, 'Craft Runic Atlas');
	g.AddButton(1008, 25, prompt+3, '0x481', '0x482', '0x483', '');  
	g.AddTooltip('Craft Runic Atlas')
	prompt+=30	
		
		
	g.AddLine(53.5, prompt+5, 233.5, prompt+5, 'white', 2)//0 to 285		
	prompt+=10  
	
				
	g.AddText(60, prompt+5, GetColorStatus('SpellbookFiller'), "Spellbook Filler");
	g.AddButton(1099, 25, prompt, GetCheckboxStatus("SpellbookFiller"), GetCheckboxStatus("SpellbookFiller"), GetCheckboxStatus("SpellbookFiller"), '');  
	g.AddTooltip('Fill Target Spellbook')
	prompt+=30		
	
	g.AddText(25, prompt+10, '72', 'Scribing: ')
	g.AddText(78, prompt+10, '55',Orion.GetGlobal('gui_status'));	

	  
	g.AddText(25,10,89,"Spellbook Filler - Lav #5921",0);

	g.Update();
}
	  
function OnClick(){
	var buttonID = CustomGumpResponse.ReturnCode();

	switch(buttonID){
		case 1001:
			SetResource()
			Orion.Wait(100)
			GUI()
			break;
			
		case 1002:
			SetSpellBook()
			Orion.Wait(100)
			GUI()
			break;	
		
		case 1003:
			MakeItem('runebook')
			Orion.Wait(100)
			GUI()
			break;
		
		case 1004:
			MakeItem('spellbook')
			Orion.Wait(100)
			GUI()
			break;
		
		case 1005:
			MakeItem('scrappers')
			Orion.Wait(100)
			GUI()
			break;
		
		case 1006:
			MakeItem('mystic')
			Orion.Wait(100)
			GUI()
			break;
		
		case 1007:
			MakeItem('necro')
			Orion.Wait(100)
			GUI()
			break;
			
		case 1008:
			MakeItem('runic atlas')
			Orion.Wait(100)
			GUI()
			break;
			
		case 1099:
			Orion.ToggleScript('SpellbookFiller')
			Orion.Wait(100)
			GUI()
			break;		
		}	
		}  
		
function UpdateGUIStatus(msg) {
	var currentMessage = Orion.GetGlobal('gui_status');
	if (currentMessage == msg) {
		return;
	}
	Orion.SetGlobal('gui_status', msg);
	GUI()
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

function SetResource(){
	UpdateGUIStatus('Set Resource Container...')
	Orion.WaitForAddObject('ac_resource',25000);
}

function GetResource(){
	var bb = Orion.FindObject('ac_resource');
	if(bb){
		return bb.Serial();
	}
	return 'not selected';
}

function GUIRefresh(){
	Orion.Wait(5000)
	GUI()
}

function SetSpellBook(){
	UpdateGUIStatus('Set Spellbook...')
	Orion.WaitForAddObject('ac_spellbook',25000);
}

function GetSpellBook(){
	var bb = Orion.FindObject('ac_spellbook');
	if(bb){
		return bb.Serial();
	}
	return 'not selected';
}

function ResourceColor(){
if (GetResource() == 'not selected'){
	return 33
}
else{
	return 70
}
}

function SpellBookColor(){
if (GetSpellBook() == 'not selected'){
	return 33
}
else{
	return 70
}
}

function ResourceCheckBox(){
if (GetResource() == 'not selected'){
	return 0x2603
}
else{
	return 0x2602	
}
}
function SpellBookCheckBox(){
if (GetSpellBook() == 'not selected'){
	return 0x2603
}
else{
	return 0x2602	
}
}

const spellbooks = [
    {
        name: "magery",
        book: "0x0EFA",
        spells: ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"] // Magery covers all 8 circles of spells
    },
    {
        name: "mystic",
        book: "0x2D9D",
        spells: ["mystic"] // Assuming "mystic" stands for a specific set or type of mystic spells
    },
    {
        name: "necro",
        book: "0x2253",
        spells: ["necro"] // Assuming "necro" stands for a specific set or type of necromancy spells
    }
];

const reagents = [
    { name: "mandrake root", code: "0x0F86" },
    { name: "bloodmoss", code: "0x0F7B" },
    { name: "sulfurous ash", code: "0x0F8C" },
    { name: "nightshade", code: "0x0F88" },
    { name: "black pearl", code: "0x0F7A" },
    { name: "spiders silk", code: "0x0F8D" },
    { name: "ginseng", code: "0x0F85" },
    { name: "garlic", code: "0x0F84" },
    { name: "pig iron", code: "0x0F8A" },
    { name: "daemon blood", code: "0x0F7D" },
    { name: "nox crystal", code: "0x0F8E" },
    { name: "grave dust", code: "0x0F8F" },
    { name: "batwing", code: "0x0F78" },
    { name: "blank scrolls", code: "0x0EF3" },
    { name: "daemon bone", code: "0x0F80" },
    { name: "bone", code: "0x0F7E" },
    { name: "dragon blood", code: "0x4077" },
    { name: "fertile dirt", code: "0x0F81" },
    { name: "recall rune", code: "0x1F14" },
    { name: "gate travel", code: "0x1F60" },
    { name: "recall", code: "0x1F4C" },
    { name: "taint", code: "0x3187" },
    { name: "dread horn", code: "0x318A" },
    { name: "corruption", code: "0x3184" }
    
]

const misc = [
	{ name: "runebook", graphic: "0x22C5", reagents:["Blank Scrolls", "Recall Rune", "Gate Travel", "Recall"], code: "0x000001CC", id: 9006, index: 200 },
	{ name: "spellbook", graphic: "0x0EFA", reagents:["Blank Scrolls"], code: "0x000001CC", id: 9006, index: 202 },
	{ name: "scrappers", graphic: "0x0EFA", reagents: ["Taint", "Dread Horn", "Corruption","Blank Scrolls"], code: "0x000001CC", id: 9006, index: 204 },
	{ name: "mystic", graphic: "0x0451", reagents: ["Blank Scrolls"], code: "0x000001CC", id: 9006, index: 206 },	
	{ name: "necro", graphic: "0x0451", reagents: ["Blank Scrolls"], code: "0x000001CC", id: 9006, index: 207 },		
	{ name: "runic atlas", graphic: "0x0451", reagents: ["Blank Scrolls", "Recall", "Gate Travel", "Recall Rune","Recall Rune","Recall Rune"], code: "0x000001CC", id: 9006, index: 694 },		
	]
	
const spells = [
    { bname: "magery", circle: "1st", name: "Clumsy", reagents: ["Bloodmoss", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 1, scrollId: "0x1F2E" },
    { bname: "magery",  circle: "1st", name: "Create Food", reagents: ["Garlic", "Ginseng", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 2, scrollId: "0x1F2F" },
    { bname: "magery", circle: "1st", name: "Feeblemind", reagents: ["Ginseng", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 3, scrollId: "0x1F30" },
    { bname: "magery", circle: "1st", name: "Heal", reagents: ["Garlic", "Ginseng", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 4, scrollId: "0x1F31" },
    { bname: "magery",  circle: "1st", name: "Magic Arrow", reagents: ["Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 5, scrollId: "0x1F32" },
    { bname: "magery",  circle: "1st", name: "Night Sight", reagents: ["Sulfurous Ash", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 6, scrollId: "0x1F33" },
    { bname: "magery",  circle: "1st", name: "Reactive Armor", reagents: ["Garlic", "Sulfurous Ash", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 7, scrollId: "0x1F2D" },
    { bname: "magery",  circle: "1st", name: "Weaken", reagents: ["Garlic", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 8, scrollId: "0x1F34" },
    { bname: "magery",  circle: "2nd", name: "Agility", reagents: ["Bloodmoss", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 9, scrollId: "0x1F35" },
    { bname: "magery",  circle: "2nd", name: "Cunning", reagents: ["Mandrake Root", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 10, scrollId: "0x1F36" },
    { bname: "magery",  circle: "2nd", name: "Cure", reagents: ["Garlic", "Ginseng", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 11, scrollId: "0x1F37" },
    { bname: "magery",  circle: "2nd", name: "Harm", reagents: ["Nightshade", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 12, scrollId: "0x1F38" },
    { bname: "magery",  circle: "2nd", name: "Magic Trap", reagents: ["Garlic", "Sulfurous Ash", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 13, scrollId: "0x1F39" },
    { bname: "magery",  circle: "2nd", name: "Magic Untrap", reagents: ["Bloodmoss", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 14, scrollId: "0x1F3A" },
    { bname: "magery",  circle: "2nd", name: "Protection", reagents: ["Garlic", "Ginseng", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 15, scrollId: "0x1F3B" },
    { bname: "magery",  circle: "2nd", name: "Strength", reagents: ["Mandrake Root", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9001, index: 16, scrollId: "0x1F3C" },
    { bname: "magery",  circle: "3rd", name: "Bless", reagents: ["Garlic", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 17, scrollId: "0x1F3D" },
    { bname: "magery",  circle: "3rd", name: "Fireball", reagents: ["Black Pearl", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 18, scrollId: "0x1F3E" },
    { bname: "magery",  circle: "3rd", name: "Magic Lock", reagents: ["Sulfurous Ash", "Bloodmoss", "Garlic", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 19, scrollId: "0x1F3F" },
    { bname: "magery",  circle: "3rd", name: "Poison", reagents: ["Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 20, scrollId: "0x1F40" },
    { bname: "magery",  circle: "3rd", name: "Telekinesis", reagents: ["Bloodmoss", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 21, scrollId: "0x1F41" },
    { bname: "magery",  circle: "3rd", name: "Teleport", reagents: ["Bloodmoss", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 22, scrollId: "0x1F42" },
    { bname: "magery",  circle: "3rd", name: "Unlock", reagents: ["Bloodmoss", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 23, scrollId: "0x1F43" },
    { bname: "magery",  circle: "3rd", name: "Wall of Stone", reagents: ["Bloodmoss", "Garlic", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 24, scrollId: "0x1F44" },
    { bname: "magery",  circle: "4th", name: "Arch Cure", reagents: ["Garlic", "Ginseng", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 25, scrollId: "0x1F45" },
    { bname: "magery",  circle: "4th", name: "Arch Protection", reagents: ["Garlic", "Ginseng", "Mandrake Root", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 26, scrollId: "0x1F46" },
    { bname: "magery",  circle: "4th", name: "Curse", reagents: ["Garlic", "Nightshade", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 27, scrollId: "0x1F47" },
    { bname: "magery",  circle: "4th", name: "Fire Field", reagents: ["Black Pearl", "Spiders Silk", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 28, scrollId: "0x1F48" },
    { bname: "magery",  circle: "4th", name: "Greater Heal", reagents: ["Garlic", "Ginseng", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 29, scrollId: "0x1F49" },
    { bname: "magery",  circle: "4th", name: "Lightning", reagents: ["Mandrake Root", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 30, scrollId: "0x1F4A" },
    { bname: "magery",  circle: "4th", name: "Mana Drain", reagents: ["Black Pearl", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 31, scrollId: "0x1F4B" },
    { bname: "magery",  circle: "4th", name: "Recall", reagents: ["Black Pearl", "Bloodmoss", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9002, index: 32, scrollId: "0x1F4C" },
    { bname: "magery",  circle: "5th", name: "Blade Spirits", reagents: ["Black Pearl", "Mandrake Root", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 33, scrollId: "0x1F4D" },
    { bname: "magery",  circle: "5th", name: "Dispel Field", reagents: ["Garlic", "Black Pearl", "Spiders Silk", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 34, scrollId: "0x1F4E" },
    { bname: "magery",  circle: "5th", name: "Incognito", reagents: ["Bloodmoss", "Garlic", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 35, scrollId: "0x1F4F" },
    { bname: "magery",  circle: "5th", name: "Magic Reflection", reagents: ["Garlic", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 36, scrollId: "0x1F50" },
    { bname: "magery",  circle: "5th", name: "Mind Blast", reagents: ["Black Pearl", "Mandrake Root", "Nightshade", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 37, scrollId: "0x1F51" },
    { bname: "magery",  circle: "5th", name: "Paralyze", reagents: ["Garlic", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 38, scrollId: "0x1F52" },
    { bname: "magery",  circle: "5th", name: "Poison Field", reagents: ["Black Pearl", "Nightshade", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 39, scrollId: "0x1F53" },
    { bname: "magery",  circle: "5th", name: "Summon Creature", reagents: ["Bloodmoss", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 40, scrollId: "0x1F54" },
    { bname: "magery",  circle: "6th", name: "Dispel", reagents: ["Garlic", "Mandrake Root", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 41, scrollId: "0x1F55" },
    { bname: "magery",  circle: "6th", name: "Energy Bolt", reagents: ["Black Pearl", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 42, scrollId: "0x1F56" },
    { bname: "magery",  circle: "6th", name: "Explosion", reagents: ["Bloodmoss", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 43, scrollId: "0x1F57" },
    { bname: "magery",  circle: "6th", name: "Invisibility", reagents: ["Bloodmoss", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 44, scrollId: "0x1F58" },
    { bname: "magery",  circle: "6th", name: "Mark", reagents: ["Black Pearl", "Bloodmoss", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 45, scrollId: "0x1F59" },
    { bname: "magery",  circle: "6th", name: "Mass Curse", reagents: ["Garlic", "Mandrake Root", "Nightshade", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 46, scrollId: "0x1F5A" },
    { bname: "magery",  circle: "6th", name: "Paralyze Field", reagents: ["Black Pearl", "Ginseng", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 47, scrollId: "0x1F5B" },
    { bname: "magery",  circle: "6th", name: "Reveal", reagents: ["Bloodmoss", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9003, index: 48, scrollId: "0x1F5C" },
    { bname: "magery",  circle: "7th", name: "Chain Lightning", reagents: ["Black Pearl", "Mandrake Root", "Bloodmoss", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 49, scrollId: "0x1F5D" },
    { bname: "magery",  circle: "7th", name: "Energy Field", reagents: ["Black Pearl", "Mandrake Root", "Spiders Silk", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 50, scrollId: "0x1F5E" },
    { bname: "magery",  circle: "7th", name: "Flame Strike", reagents: ["Spiders Silk", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 51, scrollId: "0x1F5F" },
    { bname: "magery",  circle: "7th", name: "Gate Travel", reagents: ["Black Pearl", "Mandrake Root", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 52, scrollId: "0x1F60" },
    { bname: "magery",  circle: "7th", name: "Mana Vampire", reagents: ["Black Pearl", "Bloodmoss", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 53, scrollId: "0x1F61" },
    { bname: "magery",  circle: "7th", name: "Mass Dispel", reagents: ["Black Pearl", "Garlic", "Mandrake Root", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 54, scrollId: "0x1F62" },
    { bname: "magery",  circle: "7th", name: "Meteor Swarm", reagents: ["Bloodmoss", "Spiders Silk", "Mandrake Root", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 55, scrollId: "0x1F63" },
    { bname: "magery",  circle: "7th", name: "Polymorph", reagents: ["Bloodmoss", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 56, scrollId: "0x1F64" },
    { bname: "magery",  circle: "8th", name: "Earthquake", reagents: ["Bloodmoss", "Ginseng", "Mandrake Root", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 57, scrollId: "0x1F65" },
    { bname: "magery",  circle: "8th", name: "Energy Vortex", reagents: ["Black Pearl", "Bloodmoss", "Mandrake Root", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 58, scrollId: "0x1F66" },
    { bname: "magery",  circle: "8th", name: "Resurrection", reagents: ["Bloodmoss", "Garlic", "Ginseng", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 59, scrollId: "0x1F67" },
    { bname: "magery",  circle: "8th", name: "Air Elemental", reagents: ["Bloodmoss", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 60, scrollId: "0x1F68" },
    { bname: "magery",  circle: "8th", name: "Summon Daemon", reagents: ["Bloodmoss", "Mandrake Root", "Spiders Silk", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 61, scrollId: "0x1F69" },
    { bname: "magery",  circle: "8th", name: "Earth Elemental", reagents: ["Bloodmoss", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 62, scrollId: "0x1F6A" },
    { bname: "magery",  circle: "8th", name: "Fire Elemental", reagents: ["Bloodmoss", "Mandrake Root", "Spiders Silk", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 63, scrollId: "0x1F6B" },
    { bname: "magery",  circle: "8th", name: "Water Elemental", reagents: ["Bloodmoss", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9004, index: 64, scrollId: "0x1F6C" },    
    { bname: "necro", circle: "necro", name: "Animate Dead", reagents: ["Daemon Blood", "Grave Dust", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 101, scrollId: "0x2260" },
    { bname: "necro", circle: "necro", name: "Blood Oath", reagents: ["Daemon Blood", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 102, scrollId: "0x2261" },
    { bname: "necro", circle: "necro", name: "Corpse Skin", reagents: ["Batwing", "Grave Dust", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 103, scrollId: "0x2262" },
    { bname: "necro", circle: "necro", name: "Curse Weapon", reagents: ["Pig Iron", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 104, scrollId: "0x2263" },
    { bname: "necro", circle: "necro", name: "Evil Omen", reagents: ["Batwing", "Nox Crystal", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 105, scrollId: "0x2264" },
    { bname: "necro", circle: "necro", name: "Horrific Beast", reagents: ["Batwing", "Daemon Blood", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 106, scrollId: "0x2265" },
    { bname: "necro", circle: "necro", name: "Lich Form", reagents: ["Nox Crystal", "Daemon Blood", "Grave Dust", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 107, scrollId: "0x2266" },
    { bname: "necro", circle: "necro", name: "Mind Rot", reagents: ["Batwing", "Daemon Blood", "Pig Iron", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 108, scrollId: "0x2267" },
	{ bname: "necro", circle: "necro", name: "Pain Spike", reagents: ["Grave Dust", "Pig Iron", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 109, scrollId: "0x2268" },   
    { bname: "necro", circle: "necro", name: "Poison Strike", reagents: ["Nox Crystal", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 110, scrollId: "0x2269" },
    { bname: "necro", circle: "necro", name: "Strangle", reagents: ["Nox Crystal", "Daemon Blood", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 111, scrollId: "0x226A" },
    { bname: "necro", circle: "necro", name: "Summon Familiar", reagents: ["Batwing", "Grave Dust", "Daemon Blood", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 112, scrollId: "0x226B" },
	{ bname: "necro", circle: "necro", name: "Vampiric Embrace", reagents: ["Batwing", "Nox Crystal", "Pig Iron", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 113, scrollId: "0x226C" },    
    { bname: "necro", circle: "necro", name: "Vengeful Spirit", reagents: ["Batwing", "Grave Dust", "Pig Iron", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 114, scrollId: "0x226D" },
    { bname: "necro", circle: "necro", name: "Wither", reagents: ["Nox Crystal", "Grave Dust", "Pig Iron", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 115, scrollId: "0x226E" },
    { bname: "necro", circle: "necro", name: "Wraith Form", reagents: ["Nox Crystal", "Pig Iron", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 116, scrollId: "0x226F" },
	{ bname: "necro", circle: "necro", name: "Exorcism", reagents: ["Nox Crystal", "Grave Dust", "Blank Scrolls"], code: "0x000001CC", id: 9005, index: 117, scrollId: "0x2270" },    		                         	
    { bname: "mystic", circle: "mystic", name: "Nether Bolt", reagents: ["Black Pearl", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 678, scrollId: "0x2D9E", clicloc: "1031678" },
    { bname: "mystic", circle: "mystic", name: "Healing Stone", reagents: ["Bone", "Garlic", "Ginseng", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 679, scrollId: "0x2D9F", clicloc: "1031679" },    
    { bname: "mystic", circle: "mystic", name: "Purge Magic", reagents: ["Fertile Dirt", "Garlic", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 680, scrollId: "0x2DA0", clicloc: "1031680" },
    { bname: "mystic", circle: "mystic", name: "Enchant", reagents: ["Spiders Silk", "Mandrake Root", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 681, scrollId: "0x2DA1", clicloc: "1031681" },
    { bname: "mystic", circle: "mystic", name: "Sleep", reagents: ["Nightshade", "Spiders Silk", "Black Pearl", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 682, scrollId: "0x2DA2", clicloc: "1031682" },
    { bname: "mystic", circle: "mystic", name: "Eagle Strike", reagents: ["Bloodmoss", "Bone", "Spiders Silk", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 683, scrollId: "0x2DA3", clicloc: "1031683" },
    { bname: "mystic", circle: "mystic", name: "Animated Weapon", reagents: ["Bone", "Black Pearl", "Mandrake Root", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 684, scrollId: "0x2DA4", clicloc: "1031684" },
    { bname: "mystic", circle: "mystic", name: "Stone Form", reagents: ["Bloodmoss", "Fertile Dirt", "Garlic", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 685, scrollId: "0x2DA5", clicloc: "1031685" },
    { bname: "mystic", circle: "mystic", name: "Spell Trigger", reagents: ["Dragon Blood", "Garlic", "Mandrake Root", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 686, scrollId: "0x2DA6", clicloc: "1031686" },
    { bname: "mystic", circle: "mystic", name: "Mass Sleep", reagents: ["Ginseng", "Nightshade", "Spiders Silk", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 687, scrollId: "0x2DA7", clicloc: "1031687" },
    { bname: "mystic", circle: "mystic", name: "Cleansing Winds", reagents: ["Dragon Blood", "Garlic", "Ginseng", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 688, scrollId: "0x2DA8", clicloc: "1031688" },
    { bname: "mystic", circle: "mystic", name: "Bombard", reagents: ["Bloodmoss", "Dragon Blood ", "Garlic", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 689, scrollId: "0x2DA9", clicloc: "1031689" },
    { bname: "mystic", circle: "mystic", name: "Spell Plague", reagents: ["Daemon Bone", "Dragon Blood", "Nightshade", "Sulfurous Ash", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 690, scrollId: "0x2DAA", clicloc: "1031690" },
    { bname: "mystic", circle: "mystic", name: "Hail Storm", reagents: ["Dragon Blood", "Bloodmoss", "Black Pearl", "Mandrake Root", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 691, scrollId: "0x2DAB", clicloc: "1031691" },
    { bname: "mystic", circle: "mystic", name: "Nether Cyclone", reagents: ["Mandrake Root", "Nightshade", "Sulfurous Ash", "Bloodmoss", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 692, scrollId: "0x2DAC", clicloc: "1031692" },
    { bname: "mystic", circle: "mystic", name: "Rising Colossus", reagents: ["Daemon Bone", "Dragon Blood", "Fertile Dirt", "Nightshade", "Blank Scrolls"], code: "0x000001CC", id: 9007, index: 693, scrollId: "0x2DAD", clicloc: "1031693" },                                    
];


var Ingots = '0x1BF2';
var Iron = '0x0000'; //Iron Ingot Hue
var TinkerTools = '0x1EB9|0x1EB8'; //categoryIndex, itemIndex = (9003, 11)

function SpellbookFiller() {
    var currentSpellbookType = GetCurrentSpellbook();

    if (!currentSpellbookType) {
        Orion.Print('No valid spellbook found or spellbook type is unknown.');
        return;
    }

    currentSpellbookType = currentSpellbookType.toLowerCase(); // Normalize the spellbook type
    UpdateGUIStatus(currentSpellbookType + ' spellbook')


    var applicableSpells = [];
    for (var i = 0; i < spells.length; i++) {
        var spellType = spells[i].bname.toLowerCase();
//        Orion.Print('Checking if ' + spellType + ' matches ' + currentSpellbookType); // Debugging line

        if (spellType === currentSpellbookType) {
            applicableSpells.push(spells[i]);
        }
    }

    if (applicableSpells.length === 0) {
        Orion.Print('No spells are applicable for the ' + currentSpellbookType + ' spellbook.');
        return;
    }

    Orion.Print('Found ' + applicableSpells.length + ' applicable spells for ' + currentSpellbookType);
    for (var j = 0; j < applicableSpells.length; j++) {
        var spell = applicableSpells[j];

        var output = 'Spell: ' + spell.name + ', Circle: ' + spell.circle + ', Reagents: ' + spell.reagents.join(', ') +
                     ', Code: ' + spell.code + ', ID: ' + spell.id + ', Index: ' + spell.index + ', ScrollID: ' + spell.scrollId;

		EnsureManaForScribing()
		GetPen()
//		Orion.Print(output)
        Scribe(spell.name, spell.code, spell.id, spell.index, spell.reagents, spell.scrollId);
    }
	DropReagent()
	Orion.AddObject('ac_spellbook', 'not selected')
    UpdateGUIStatus('Spellbook Filled!!!');
    Orion.ToggleScript('GUIRefresh')
}


function EnsureManaForScribing() {
    while (Player.Mana() < 70) {
        if (!Orion.BuffExists('Meditation')) {
            Orion.UseSkill('Meditation');
            Orion.AddDisplayTimer('med', 14000, 'AboveChar', 'Circle|Bar', 'Meditation')
            Orion.Wait(12000);
        }
        Orion.Wait(2000); // Adjust wait time if needed
    }
}

function GetCurrentSpellbook() {
    var spellbookId = GetSpellBook(); // Assuming GetSpellBook() returns the ID of the spellbook.
    var book = Orion.FindObject(spellbookId);

    if (book && book.Graphic) {
        Orion.Print('Current Spellbook Graphic ID: ' + book.Graphic());
        switch (book.Graphic()) {
            case "0x0EFA":
                Orion.Print('Magery');
                return 'Magery';
            case "0x2D9D":
                Orion.Print('Mystic');
                return 'Mystic';
            case "0x2253":
                Orion.Print('Necro');
                return 'Necro';
            default:
                Orion.Print('Error: Spellbook graphic ID does not match known types.');
                return null;  // Handling unexpected cases.
        }
    } else {
        Orion.Print('Error: No valid spellbook object found or missing graphic property.');
        return null;
    }
}

function DropReagent() {
    var resourceContainer = GetResource();  // Get the resource container's ID
	UpdateGUIStatus('Dropping Reagents')
    reagents.forEach(function(reagent) {

        var foundReagents = Orion.FindType(reagent.code, -1, 'backpack');
        
        foundReagents.forEach(function(item) {
            Orion.MoveItem(item, 0, resourceContainer);  // Move all of one type of reagent
            Orion.Wait(1250);  
        });

    //    Orion.Print("Moved all " + reagent.name + " to the resource container.");
    });
}

function Scribe(spellname, code, id, index, reagentNames, scrollId) {
    var pen = Orion.FindType('0x0FBF', -1, 'backpack');
    UpdateGUIStatus(spellname)
    if (pen.length > 0) {
        Orion.UseObject(pen[0]);
        Orion.Wait(1500);

        var resourceContainer = GetResource();

        for (var i = 0; i < reagentNames.length; i++) {
            var reagentName = reagentNames[i];
            var reagentCode = getReagentCode(reagentName);
            if (reagentCode) {
                Orion.Print(52, "Checking reagent: " + reagentName + " (" + reagentCode + ")");
                var foundReagents = Orion.FindType(reagentCode, -1, resourceContainer);
                if (Orion.Count(reagentCode, -1, 'backpack') < 10) {
                    Orion.Print("Restocking " + reagentName);
                    Orion.MoveItem(foundReagents[0], 100, backpack);
                    Orion.Wait(1500);
                } else {
                    Orion.Print(66, "Sufficient " + reagentName + " available.");
                    Orion.Wait(100)
                }
            } else {
                Orion.Print(33, "Error: Reagent code for " + reagentName + " not found.");
            }
        }

        GumpAction(code, id, 1000, false);
        GumpAction(code, index, 1000, false);
        Orion.WaitForGump(3000);

        var scrolls = Orion.FindType(scrollId, -1, 'backpack');
        if (scrolls.length > 0) {
            Orion.Wait(500);
            Orion.DragItem(scrolls[0], 1);
            Orion.Wait(500);
            Orion.DropDraggedItem(GetSpellBook());
            Orion.Wait(1500);
        } else {
            Orion.Print(33, "No scroll found to move. Attempting to rescribe...");
            Orion.Wait(1000);
            Scribe(spellname, code, id, index, reagentNames, scrollId);
        }
    } else {
        Orion.Print("No pen found in backpack.");
    }
}

function getReagentCode(reagentName) {
//    Orion.Print("Searching for reagent code for: " + reagentName);  // Output using Orion.Print for debugging
    for (var i = 0; i < reagents.length; i++) {
        if (reagents[i].name.toLowerCase() === reagentName.toLowerCase()) {
//            Orion.Print("Match found: " + reagents[i].code);  // Debugging output if match is found
            return reagents[i].code;
        }
    }
//    Orion.Print("No match found for: " + reagentName);  // Output if no match is found
    return undefined;
}

function MakeItem(itemName) {
    var item = findItemByName(itemName);
    if (!item) {
        Orion.Print('Item not found: ' + itemName);
        return;
    }

	if (itemName == "necro"){
		UpdateGUIStatus('Necromancy Spellbook')
	} 
	if (itemName == "runic atlas"){
		UpdateGUIStatus('Runic Atlas')
	} 
	if (item.name == "mystic"){
		UpdateGUIStatus('Mysticism Spellbook')
	} 
	if (itemName == "scrappers"){
		UpdateGUIStatus("Scrapper's Compendium")
	} 
	if (itemName == "spellbook"){
		UpdateGUIStatus('Magery Spellbook')
	} 
	if (itemName == "runebook"){
		UpdateGUIStatus('Runebook')
	} 					

    handleItemCreation(item);
}

function findItemByName(name) {
    for (var i = 0; i < misc.length; i++) {
        if (misc[i].name.toLowerCase() === name.toLowerCase()) {
            return misc[i];
        }
    }
    return null;
}

function handleItemCreation(item) {
    Orion.Print('Creating ' + item.name + ' with graphic ' + item.graphic);

    var resourceContainer = GetResource(); // This should return the ID of your resource container

    item.reagents.forEach(function(reagentName) {
        var reagentCode = getReagentCode(reagentName);
        if (reagentCode) {
            Orion.Print("Using reagent: " + reagentName + " (" + reagentCode + ")");
            var foundReagents = Orion.FindType(reagentCode, -1, 'backpack'); // Find reagents in the backpack            
            // Further logic to handle reagents based on their code
            if (Orion.Count(reagentCode, -1, 'backpack') < 10) { // Ensure sufficient reagents are available
                Orion.Print("Restocking " + reagentName);
                foundReagents = Orion.FindType(reagentCode, -1, resourceContainer)
                if (foundReagents.length > 0) {
                    Orion.MoveItem(foundReagents[0], 100, backpack); // Move reagents if found
                }
                Orion.Wait(1500); // Wait for operations to complete
            } else {
                Orion.Print("Sufficient " + reagentName + " available.");
            }            
        } else {
            Orion.Print("Error: Reagent code for " + reagentName + " not found.");
        }
    });
	pen = Orion.FindType('0x0FBF', -1, backpack)
	Orion.UseObject(pen[0])
	Orion.Wait(1500)
//    Orion.Print('Use Code: ' + item.code + ', ID: ' + item.id + ', Index: ' + item.index);	
    GumpAction(item.code, item.id, 3000, false)
    GumpAction(item.code, item.index, 3000, false)
    DropReagent()
    UpdateGUIStatus('Created...')
}

function GetPen() {
    var TinkerTools = '0x1EB8'; // Assuming this is the correct graphic for Tinker Tools
    var tinker = Orion.FindType(TinkerTools, -1, backpack);
    var iron = Orion.FindType('0x1BF2', '0x0000', GetResource()); // Ensure this finds iron correctly

    if (Orion.SkillValue('tinkering', 'real') >= 500) {
        if (tinker.length > 0) {
            if (Orion.Count('0x1BF2', '0x0000', backpack) < 20) {
                if (iron.length > 0) {
                    Orion.Print("Moving iron to backpack...");
                    Orion.MoveItem(iron[0], 20, backpack); // Move 20 irons, not 25
                    Orion.Wait(1250);
                } else {
                    Orion.Print("Not enough iron available in resource storage.");
                    return; // Exit if not enough resources
                }
            }

            Orion.UseObject(tinker[0]);
            Orion.Print("Attempting to create a pen...");
            while (Orion.Count('0x0FBF', -1, backpack) === 0) {
                GumpAction('0x000001CC', 9003, 1000, false); // Assumed codes for the gump actions
                GumpAction('0x000001CC', 30, 3000, false);
            }
            Orion.Print("Pen created successfully.");
        } else {
            Orion.Print("No tinker tools found in backpack.");
        }
    } else {
		if (Orion.Count('0x0FBF', -1, backpack) === 0){
			pen = Orion.FindType('0x0FBF', -1, GetResource())
			Orion.MoveItem(pen, 1, backpack)
			Orion.Wait(1250)
		}
    }
}