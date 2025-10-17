//------------------------------------------------------------------------------------------------------------------------------------------
// FormRevert()
// Reverts the player from any active transformation form (Necromancy, Ninjitsu, or Mysticism) or Gargoyle flight.  
// Iteratively checks for each possible form and repeatedly casts its corresponding spell until the form is removed.
//------------------------------------------------------------------------------------------------------------------------------------------
function FormRevert(){
	if (Orion.BuffExists('Horrific Beast')){;while (Orion.BuffExists('Horrific Beast')){;Orion.Print(90, "Removing the current form.");Orion.Cast('Horrific Beast');Orion.Wait(3000);}}
	if (Orion.BuffExists('Wraith Form')){;while (Orion.BuffExists('Wraith Form')){;Orion.Print(90, "Removing the current form.");Orion.Cast('Wraith Form');Orion.Wait(3000);}}
	if (Orion.BuffExists('Lich Form')){;while (Orion.BuffExists('Lich Form')){;Orion.Print(90, "Removing the current form.");Orion.Cast('Lich Form');Orion.Wait(3000);}}
	if (Orion.BuffExists('Vampiric Embrace')){;while (Orion.BuffExists('Vampiric Embrace')){;Orion.Print(90, "Removing the current form.");Orion.Cast('Vampiric Embrace');Orion.Wait(3000);}}			
	if (Orion.BuffExists('Animal Form')){;while (Orion.BuffExists('Animal Form')){;Orion.Print(90, "Removing the current form.");Orion.Cast('Animal Form');Orion.Wait(3000);}}		
	if (Orion.BuffExists('Stone Form')){;while (Orion.BuffExists('Stone Form')){;Orion.Print(90, "Removing the current form.");Orion.Cast('Stone Form');Orion.Wait(3000);}}		
	if (Player.Flying()){;Orion.ToggleGargoyleFlying();Orion.Wait(3000);}
}