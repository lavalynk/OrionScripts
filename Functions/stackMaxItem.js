//------------------------------------------------------------------------------------------------------------------------------------------
// stackMaxItem()
// Combines two stacks of the SAME item into one 60,000-sized stack.
// Prompts you to select: (1) the target stack to max (alias: maxItem) and (2) the filler stack (alias: fillItem).
//------------------------------------------------------------------------------------------------------------------------------------------
function stackMaxItem() {
    var maxStackSize = 60000;

    // Select target stack to fill
    if (!Orion.WaitForAddObject('maxItem')) {
        Orion.Print('Failed to add object with alias "maxItem".');
        return;
    }
    var maxObj = Orion.FindObject('maxItem');
    if (!maxObj) {
        Orion.Print('Failed to find the object with alias "maxItem".');
        return;
    }
    var maxCount = maxObj.Count();

    // Select filler stack
    if (!Orion.WaitForAddObject('fillItem')) {
        Orion.Print('Failed to add object with alias "fillItem".');
        return;
    }
    var fillObj = Orion.FindObject('fillItem');
    if (!fillObj) {
        Orion.Print('Failed to find the object with alias "fillItem".');
        return;
    }
    var fillCount = fillObj.Count();

    // Compute how many items to move
    var needed = maxStackSize - maxCount;
    var toMove = Math.min(needed, fillCount);

    if (toMove > 0) {
        Orion.MoveItem(fillObj.Serial(), toMove, maxObj.Serial());
        Orion.Wait(600);
        Orion.Print('Moved ' + toMove + ' items into target stack (aiming for 60,000).');
    } else {
        Orion.Print('No move needed (target full) or filler stack has 0 items.');
    }
}
//------------------------------------------------------------------------------------------------------------------------------------------
