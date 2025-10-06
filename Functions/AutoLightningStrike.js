//------------------------------------------------------------------------------------------------------------------------------------------
// AutoLightningStrike()
// Continuously monitors for the Lightning Strike buff and automatically casts it when not active,  
// as long as the player has more than 10 mana and is alive.
//------------------------------------------------------------------------------------------------------------------------------------------
function AutoLightningStrike(){
	while (!Player.Dead()){
		if (!Orion.BuffExists('Lightning Strike') && Player.Mana() > 10){
			Orion.Cast('Lightning Strike')
			Orion.Wait(500)
		}
		Orion.Wait(500)
	}
}