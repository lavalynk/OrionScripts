//------------------------------------------------------------------------------------------------------------------------------------------
// getPlayerNameWithoutTitle()
// Returns the player’s name with “Lady” or “Lord” titles removed for cleaner display or variable use.
//------------------------------------------------------------------------------------------------------------------------------------------
function getPlayerNameWithoutTitle()
    var name = Player.Name().replace("Lady ", "");
    return name.replace("Lord ", "");
}
