// ======================================
// Roof Orchard Auto Complete
// Entry point - sets pet, scans all sides, and records tree data
// ======================================
function SG_Orchard() { 
    // Ask player to target the pet and store the pet serial in Shared vars
    Orion.Print("Target your pet.");
    Orion.WaitForAddObject("pet");
    var pet = Orion.FindObject("pet");
    if (!pet) {
        Orion.Print("No pet targeted, aborting RoofOrchardAutoComplete.");
        return;
    }
    Shared.AddVar("petSerial", pet.Serial());

    // Initialize shared arrays for all tree sides
    Shared.AddVar('topTrees', []);
    Shared.AddVar('leftTrees', []);
    Shared.AddVar('bottomTrees', []);
    Shared.AddVar('rightTrees', []);

    // Capture starting coordinates and move to each corner to scan trees
    var initialCoords = Coordinates();
    var myX = initialCoords[0];
    var myY = initialCoords[1];
    var myZ = initialCoords[2];

    // Top side scan
    Orion.WalkTo((myX - 13), (myY - 13), myZ, -1, -1, 1);
    var topTrees = CheckTrees();
    Shared.AddVar('topTrees', topTrees);

    // Left side scan
    Orion.WalkTo((myX - 13), (myY + 13), myZ, -1, -1, 1);
    var leftTrees = CheckTrees();
    Shared.AddVar('leftTrees', leftTrees);

    // Bottom side scan
    Orion.WalkTo((myX + 13), (myY + 13), myZ, -1, -1, 1);
    var bottomTrees = CheckTrees();
    Shared.AddVar('bottomTrees', bottomTrees);

    // Right side scan
    Orion.WalkTo((myX + 13), (myY - 13), myZ, -1, -1, 1);
    var rightTrees = CheckTrees();
    Shared.AddVar('rightTrees', rightTrees);

    // Final pass around the roof to complete apple collection and matching
    Orion.WalkTo((myX - 13), (myY - 13), myZ, -1, -1, 1);
    var topTrees = CheckTrees();

    Orion.WalkTo((myX - 13), (myY + 13), myZ, -1, -1, 1);
    var leftTrees = CheckTrees();

    Orion.WalkTo((myX + 13), (myY + 13), myZ, -1, -1, 1);
    var bottomTrees = CheckTrees();

    Orion.WalkTo((myX + 13), (myY - 13), myZ, -1, -1, 1);
    var rightTrees = CheckTrees();
}

// ======================================
// Coordinates
// Returns current player coordinates as [X, Y, Z] and prints them
// ======================================
function Coordinates() { 
    var myX = Player.X();
    var myY = Player.Y();
    var myZ = Player.Z();
    var coords = [myX, myY, myZ];
    Orion.Print('X: ' + coords[0] + ', Y: ' + coords[1] + ' Z: ' + coords[2]);
    return coords;
}

// ======================================
// CheckTrees
// Walks to nearby trees, grabs apples, records data, and checks for matches
// ======================================
function CheckTrees() { 
    // Reset pet commands so it stays with the player
    Orion.UseObject(self);
    Orion.Wait(300);
    Orion.Say('all stop');
    Orion.Wait(100);
    Orion.Say('all follow me');
    Orion.Wait(600);

    // Get stored pet serial from Shared
    var myPet = Shared.GetVar('petSerial');

    // List structure: [Virtue, Serial, X, Y, Z, ...]
    var appleList = [];

    // Find trees near the player
    var trees = Orion.FindType('0x0D01', '0x0000', ground, ' ', '10');
    Orion.Print('Tree Amount: ' + trees.length);

    if (trees.length != 0) {
        for (var i = 0; i < trees.length; i++) {
            var thisTree = Orion.FindObject(trees[i]);
            if (thisTree !== null) {
                Orion.ClearJournal();
                Orion.Print('Walking to Tree ' + i+1 + ' - X: ' + thisTree.X() + ', Y: ' + thisTree.Y() + ' Z: ' + thisTree.Z());

                // Move to tree and grab apple
                Orion.WalkTo(thisTree.X(), thisTree.Y(), thisTree.Z());
                Orion.Print('Grabbing apple');
                Orion.UseObject(thisTree.Serial());
                Orion.Wait(1000);

                // Check for cursed apple in backpack
                var cursedApple = Orion.FindType('0x09D0', '0x0000', backpack);
                if (cursedApple.length != 0) {
                    var appleVirtue = GetVirtue(cursedApple[0]);
                    Orion.Wait(1000);
                    Orion.Print('Adding data to list:');
                    Orion.Print(appleVirtue + ', ' + thisTree.Serial() + ', ' + thisTree.X() + ', ' + thisTree.Y() + ', ' + thisTree.Z());

                    // Store virtue and tree location data
                    appleList.push(appleVirtue, thisTree.Serial(), thisTree.X(), thisTree.Y(), thisTree.Z());

                    // Search for opposite virtue to throw at
                    Orion.Print('Checking for Opposite');
                    var check = CheckForOpposite(appleVirtue);

                    if (check[0]) {
                        // Opposite found - move pet, throw apple, and return
                        Orion.Print('Heading to match');
                        var currentCoords = [Player.X(), Player.Y(), Player.Z()];
                        Orion.UseObject(myPet);
                        Orion.Wait(1200);
                        Orion.WalkTo(check[2], check[3], check[4]);
                        Orion.UseObject(cursedApple[0]);
                        Orion.WaitForTarget();
                        Orion.Print('Throwing apple');
                        Orion.TargetObject(check[1]);
                        Orion.Print('Returning to previous location');
                        Orion.WalkTo(currentCoords[0], currentCoords[1], currentCoords[2]);
                        Orion.Wait(1000);
                        Orion.UseObject(self);
                        Orion.Wait(150);
                        Orion.Say('all stop');
                        Orion.Wait(150);
                        Orion.Say('all follow me');
                        Orion.Wait(900);
                    } else {
                        // No match found - load apple onto pet and continue
                        Orion.Print('No match');
                        Orion.MoveItem(cursedApple[0], 0, myPet);
                        Orion.Wait(1000);
                        Orion.Say('all stop');
                        Orion.Wait(100);
                        Orion.Say('all follow me');
                    }
                }
            }
            Orion.Wait(1100);
        }
    }

    // Mount or interact with pet again before returning
    Orion.UseObject(myPet);
    return appleList;
}

// ======================================
// GetVirtue
// Extracts virtue name from an apple's item name
// ======================================
function GetVirtue(a) { 
    Orion.Print('Getting Virtue');
    var thisApple = Orion.FindObject(a);
    var appleName = thisApple.Name();
    var nameArray = appleName.split(' ');
    return nameArray[4];
}

// ======================================
// CheckForOpposite
// Looks across all stored tree lists for an opposite virtue
// Returns [true, Serial, X, Y, Z] on match or [false] if none
// ======================================
function CheckForOpposite(v) { 
    // Check top side trees
    var topTrees = Shared.GetVar('topTrees');
    var result = SearchOpposite(v, topTrees);

    if (!result[0]) {
        Orion.Print('No matches in top');

        // Check left side trees
        var leftTrees = Shared.GetVar('leftTrees');
        result = SearchOpposite(v, leftTrees);

        if (!result[0]) {
            Orion.Print('No matches in left');

            // Check bottom side trees
            var bottomTrees = Shared.GetVar('bottomTrees');
            result = SearchOpposite(v, bottomTrees);

            if (!result[0]) {
                Orion.Print('No matches in bottom');

                // Check right side trees
                var rightTrees = Shared.GetVar('rightTrees');
                result = SearchOpposite(v, rightTrees);

                if (!result[0]) {
                    Orion.Print('No matches in right');
                    return ([false]);
                }
            }
        }
    }

    return (result);
}

// ======================================
// SearchOpposite
// Scans a single tree list for the opposite virtue pairing
// Tree list entries are in chunks of 5: [Virtue, Serial, X, Y, Z]
// ======================================
function SearchOpposite(v, treeList) { 
    for (var i = 0; i < treeList.length; i += 5) {
        Orion.Print(v + '-' + treeList[i]);

        if ((v === 'Justice' && treeList[i] === 'Wrong') || (v === 'Wrong' && treeList[i] === 'Justice')) {
            Orion.Print('MATCH FOUND');
            return ([true, treeList[i+1], treeList[i+2], treeList[i+3], treeList[i+4]]);
        } else if ((v === 'Compassion' && treeList[i] === 'Despise') || (v === 'Despise' && treeList[i] === 'Compassion')) {
            Orion.Print('MATCH FOUND');
            return ([true, treeList[i+1], treeList[i+2], treeList[i+3], treeList[i+4]]);
        } else if ((v === 'Spirituality' && treeList[i] === 'Hythloth') || (v === 'Hythloth' && treeList[i] === 'Spirituality')) {
            Orion.Print('MATCH FOUND');
            return ([true, treeList[i+1], treeList[i+2], treeList[i+3], treeList[i+4]]);
        } else if ((v === 'Sacrifice' && treeList[i] === 'Covetous') || (v === 'Covetous' && treeList[i] === 'Sacrifice')) {
            Orion.Print('MATCH FOUND');
            return ([true, treeList[i+1], treeList[i+2], treeList[i+3], treeList[i+4]]);
        } else if ((v === 'Honor' && treeList[i] === 'Shame') || (v === 'Shame' && treeList[i] === 'Honor')) {
            Orion.Print('MATCH FOUND');
            return ([true, treeList[i+1], treeList[i+2], treeList[i+3], treeList[i+4]]);
        } else if ((v === 'Valor' && treeList[i] === 'Destard') || (v === 'Destard' && treeList[i] === 'Valor')) {
            Orion.Print('MATCH FOUND');
            return ([true, treeList[i+1], treeList[i+2], treeList[i+3], treeList[i+4]]);
        } else if ((v === 'Honesty' && treeList[i] === 'Deceit') || (v === 'Deceit' && treeList[i] === 'Honesty')) {
            Orion.Print('MATCH FOUND');
            return ([true, treeList[i+1], treeList[i+2], treeList[i+3], treeList[i+4]]);
        } else if ((v === 'Humility' && treeList[i] === 'Pride') || (v === 'Pride' && treeList[i] === 'Humility')) {
            Orion.Print('MATCH FOUND');
            return ([true, treeList[i+1], treeList[i+2], treeList[i+3], treeList[i+4]]);
        }
    }

    return ([false]);
}
