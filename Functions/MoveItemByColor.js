//------------------------------------------------------------------------------------------------------------------------------------------
// MoveItemByColor()
// Select source container, destination container, and a sample item; moves all matching items (by color)
// into the destination using grid placement, handling “You must wait” delays between transfers.
//------------------------------------------------------------------------------------------------------------------------------------------
function MoveItemByColor() {
    Orion.UseSkill('Hiding');
    var delay = 1250;

    Orion.AddObject('fromContainer');
    Orion.Print('Select a container to move items from');
    while (Orion.HaveTarget()) {
        Orion.Wait('50');
    }

    Orion.AddObject('toContainer');
    Orion.Print('Select a container to move items to');
    while (Orion.HaveTarget()) {
        Orion.Wait('50');
    }

    Orion.AddObject('item');
    Orion.Print('Select an item to move');
    while (Orion.HaveTarget()) {
        Orion.Wait('50');
    }

    var fromContainer = Orion.FindObject('fromContainer');
    var toContainer = Orion.FindObject('toContainer');
    var item = Orion.FindObject('item');
    var itemType = item.Graphic();
    var itemColor = item.Color();

    var x = 45;
    var y = 65;
    var maxRows = 5; // Number of rows before resetting
    var currentRow = 0;
    var i = 0;

    while (true && (Player.MaxWeight() - Player.Weight()) > 15) {
        if (i <= 120) {
            var items = Orion.FindTypeEx(-1, itemColor, fromContainer.Serial());
            if (items.length) {
                Orion.MoveItem(items[0].Serial(), 1, toContainer.Serial(), x, y);
                Orion.Wait(300);
                Orion.SendPrompt('475000');
                if (Orion.InJournal('You must wait')) {
                    Orion.ClearJournal();
                    Orion.Wait(1500);
                    continue; // Move the same item again
                }

                // Adjust x and y for item placement
                x += 10;
                i++;
                if (x > 140) {
                    x = 45;
                    y += 14;
                    currentRow++;
                }

                // Reset y after maxRows and increment i
                if (currentRow >= maxRows) {
                    y = 65;
                    currentRow = 0;
                }

                Orion.Wait(delay);
            } else {
                break;
            }
        } else {
            break;
        }
    }

    Orion.RemoveObject('fromContainer');
    Orion.RemoveObject('toContainer');
    Orion.RemoveObject('item');
}