//------------------------------------------------------------------------------------------------------------------------------------------
// AutoGate + AutoHide System — v1.00
// Author: LavaLynk
// Description: A lightweight dual-function utility script designed to automate travel and concealment.  
//              The Autogate function listens for alliance chat keywords (“gate me”, “gate hub”)  
//              and automatically opens the correct runebook and casts a gate to predefined locations.  
//              The Autohide function continuously ensures the player remains hidden, refreshing periodically.
//
// Core Functions:
//   • Autostart()  – Launches both Autogate and Autohide modules.
//   • Autogate()   – Detects chat triggers and sends gates via runebook gump actions.
//   • Autohide()   – Keeps the player hidden automatically between travel or idle cycles.
//   • GumpAction() – Handles dynamic gump responses for runebook travel execution.
//
// Requirements:
//   • A runebook (0x22C5) with gate destinations preconfigured for “South of Luna Stables” and “Hub.”
//   • Alliance chat enabled to detect gate requests.
//   • Adequate Magery skill for Gate Travel.
//
// Notes:
//   – Safe for idle operation near banks, vendors, or hubs.
//   – Adjust alliance messages or gump hook IDs as needed for custom runebooks.
//   – Best used alongside city defense or transport macros.
//
// Last Updated: 2025-10-05
//------------------------------------------------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------------------------------------------------
// Autostart()
// Toggles the Autogate and Autohide helper scripts on startup.
//------------------------------------------------------------------------------------------------------------------------------------------
function Autostart(){
	Orion.ToggleScript('Autogate')
	Orion.ToggleScript('Autohide')	
}

//------------------------------------------------------------------------------------------------------------------------------------------
// Autogate()
// Listens for alliance chat cues (“gate me”, “gate hub”), opens runebook, fires the proper gump button, and announces destination.
//------------------------------------------------------------------------------------------------------------------------------------------
function Autogate(){
	runebook = Orion.FindType('0x22C5', -1, backpack)
	
	while (!Player.Dead()){
		if (Orion.InJournal('gate me')){
			Orion.UseObject(runebook[0])
			GumpAction('0x00000059', 100, 1000, true)
			Orion.ClearJournal()
			Orion.SayAlliance('Gate sent South of Luna Stables from Fish Market.')
			Orion.Wait(3000)		
			}
		if (Orion.InJournal('gate hub')){
			Orion.UseObject(runebook[0])
			GumpAction('0x00000059', 101, 1000, true)
			Orion.ClearJournal()
			Orion.SayAlliance('Gate sent to Hub')
			Orion.Wait(3000)		
			}		
		Orion.Wait(3000)
	}
		Orion.Wait(3000)
}

//------------------------------------------------------------------------------------------------------------------------------------------
// Autohide()
// Keeps the character hidden by periodically using the Hiding skill when not concealed; refreshes backpack view between cycles.
//------------------------------------------------------------------------------------------------------------------------------------------
function Autohide(){
	while (!Player.Dead()){
		if (!Player.Hidden()){
			Orion.UseSkill('Hiding')
			Orion.Wait(12000)
		}
	 Orion.Wait(30000)
	 Orion.UseObject(backpack)
	}
}

//------------------------------------------------------------------------------------------------------------------------------------------
// GumpAction(gumpID, hookID, waitTime, closeGump)
// Waits for a specific gump, executes the hook action, waits, and optionally closes the gump/clears target.
//------------------------------------------------------------------------------------------------------------------------------------------
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