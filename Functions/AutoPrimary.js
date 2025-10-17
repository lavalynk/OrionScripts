//------------------------------------------------------------------------------------------------------------------------------------------
// AutoPrimary()
// Automatically activates and maintains the player's Primary Weapon Ability.
// If AutoSecondary is active, it will terminate that script before proceeding.
// Continuously re-arms the Primary ability when mana > 25 and the player is not frozen or dead.
//------------------------------------------------------------------------------------------------------------------------------------------
function AutoPrimary(){
	if (Orion.ScriptRunning('AutoSecondary')) {
		Orion.Terminate('AutoSecondary');
	}
	while (!Player.Dead()){
		if (!Orion.AbilityStatus('Primary') && Player.Mana() > 25 && !Player.Frozen()){
			Orion.UseAbility('Primary')			
			Orion.Wait(500)
			UpdateGUIStatus('Primary Armed!')
		}
		Orion.Wait(1000)
	}
	Orion.Wait(1000)
}