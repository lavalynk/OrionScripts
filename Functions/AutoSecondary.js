//------------------------------------------------------------------------------------------------------------------------------------------
// AutoSecondary()
// Activates and maintains the player's Secondary Weapon Ability automatically.
// Terminates AutoPrimary if running, then re-arms Secondary whenever mana > 25
// and the player is not frozen or dead.
//------------------------------------------------------------------------------------------------------------------------------------------
function AutoSecondary(_internal){
	if (Orion.ScriptRunning('AutoPrimary')) {
		Orion.Terminate('AutoPrimary');
	}
	while (!Player.Dead()){
		if (!Orion.AbilityStatus('Secondary') && Player.Mana() > 25 && !Player.Frozen()){
			Orion.UseAbility('Secondary')			
			Orion.Wait(500)
			UpdateGUIStatus('Secondary Armed!')
		}
		Orion.Wait(1000)
	}
	Orion.Wait(1000)
}