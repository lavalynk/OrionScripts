//------------------------------------------------------------------------------------------------------------------------------------------
// RemoveHousesON()
// Toggles the “UseCustomMaxDrawZOffset” client option on or off to hide or show houses in the game world.
//------------------------------------------------------------------------------------------------------------------------------------------
function RemoveHousesON(){
  if(Orion.ClientOptionGet("UseCustomMaxDrawZOffset", 1)){
    Orion.ClientOptionSet("UseCustomMaxDrawZOffset", 0)
  }
  else{
    Orion.ClientOptionSet("UseCustomMaxDrawZOffset", 1)
  }
}