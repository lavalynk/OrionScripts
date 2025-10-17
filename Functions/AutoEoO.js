//------------------------------------------------------------------------------------------------------------------------------------------
// AutoEoO(_internal)
// Continuously checks for nearby enemies and automatically casts “Enemy of One” 
// when targets are detected and sufficient mana is available.
//------------------------------------------------------------------------------------------------------------------------------------------
function AutoEoO(_internal){
	while (!Player.Dead()){
        var arr = Orion.FindTypeEx(targetGraphics, 'any', 'ground', targetFlags, targetRange, targetNoto)
		if (arr.length != 0 && Player.Mana() > 20){
			if (!Orion.BuffExists('Enemy of One')){
				Orion.Cast('Enemy Of One')
				Orion.Wait(5000)
			}
		}
	Orion.Wait(3000)
	}			
}