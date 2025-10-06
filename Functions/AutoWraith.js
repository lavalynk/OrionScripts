//------------------------------------------------------------------------------------------------------------------------------------------
// AutoWraith()
// Automatically maintains Wraith Form while alive.  
// Cancels Gargoyle Flight if active, repeatedly casts Wraith Form until successful,  
// and rechecks every few seconds to ensure the buff remains active.
//------------------------------------------------------------------------------------------------------------------------------------------
function AutoWraith(){
	while (!Player.Dead()){
		if (Player.Flying()){;Orion.ToggleGargoyleFlying();Orion.Wait(3000);}	
		while (!Player.Dead() && !Orion.BuffExists('Wraith Form')){
			UpdateGUIStatus('Casting Wraith Form...')
			Orion.Cast('Wraith Form')
			Orion.Wait(3000)
				if (Orion.BuffExists('Wraith Form')){
					UpdateGUIStatus('Wraith Form Successful!')
				}
			}//End Wraith While
	Orion.Wait(5000)
	}//End !Player.Dead
}//End Function