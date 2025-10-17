//------------------------------------------------------------------------------------------------------------------------------------------
// HidePlayers()
// Continuously hides nearby player and summon mobiles within a 24-tile radius to reduce screen clutter or visual targeting noise.
//------------------------------------------------------------------------------------------------------------------------------------------


function HidePlayers(){
  while(true)
     {
     var peeps = Orion.FindType(any, any, ground, 'live|ignoreself', 24,"blue")
     for(i=0;i<peeps.length;i++)
         {
         Orion.Hide(peeps[i])
         }//End For
	var summons = Orion.FindType('0x033D|0x00A4|0x004F', -1, ground, 'live|ignoreself', 24, 'red')
     for(i=0;i<summons.length;i++)
         {
         Orion.Hide(summons[i])
         }//End For	
     Orion.Wait(100);
     }//End While
     Orion.Wait(50);
}