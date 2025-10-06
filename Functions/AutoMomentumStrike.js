//------------------------------------------------------------------------------------------------------------------------------------------
// AutoMomentumStrike()
// Continuously checks for the Momentum Strike buff and auto-casts it whenever missing,  
// provided the player has sufficient mana and is alive.
//------------------------------------------------------------------------------------------------------------------------------------------
function AutoMomentumStrike(){
	while (!Player.Dead()){
		if (!Orion.BuffExists('Momentum Strike') && Player.Mana() > 10){
			Orion.Cast('Momentum Strike')
			Orion.Wait(500)
		}
		Orion.Wait(500)
	}
}