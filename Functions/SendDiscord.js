//------------------------------------------------------------------------------------------------------------------------------------------
// SendDiscord(theMessage)
// Sends a formatted message to the specified Discord webhook.
// Automatically includes the player's name and shard in the message header.
//------------------------------------------------------------------------------------------------------------------------------------------
function SendDiscord(theMessage){
  // Get player name and shard name
  var charName = Player.Name();
  var shardName = Orion.ShardName();
  
  // Combine both to form the username
  var combinedName = charName + " [" + shardName + "]";
  
  // Prepare the message parameter
  var paramText = "username=" + combinedName + "&content= " + theMessage;
  
  // Send the HTTP POST request
  Orion.Wait(200);
  Orion.HttpPost(discordHook, paramText);
}