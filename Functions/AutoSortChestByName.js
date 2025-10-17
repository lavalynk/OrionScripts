//------------------------------------------------------------------------------------------------------------------------------------------
// AutoSortChestbyName()
// Groups items by their display name, then moves them into the destination container in
// frequency-sorted columns with grid placement. Handles “You must wait” delays and retries.
//------------------------------------------------------------------------------------------------------------------------------------------
function AutoSortChestbyName() {
    var delay = 1500;
	Orion.ClearJournal();    
    Orion.AddObject('fromContainer');
    Orion.Print('Select a container to move items from');
    while (Orion.HaveTarget()) {
        Orion.Wait(50);
    }
    Orion.AddObject('toContainer');
    Orion.Print('Select a container to move items to');
    while (Orion.HaveTarget()) {
        Orion.Wait(50);
    }
    var fromContainer = Orion.FindObject('fromContainer');
    var toContainer = Orion.FindObject('toContainer');

    var xStart = 45; // Starting x position
    var yStart = 65; // Starting y position
    var xIncrement = 50; // Increment for x position when starting a new item type

    var items = Orion.FindTypeEx(-1, -1, fromContainer.Serial()); // Find all items in fromContainer
    var itemCounts = {}; // Object to store item names and their counts

	Orion.Wait(1500);
    // Populate itemCounts object with the unique item names and their counts
    for (var i = 0; i < items.length; i++) {
        var itemName = GetItemName(items[i]); // Get item name using the function below
        if (!itemCounts[itemName]) {
            itemCounts[itemName] = 0;
        }
        itemCounts[itemName]++;
    }

    // Create an array from the itemCounts object and sort it by count in descending order
    var sortedItemNames = Object.keys(itemCounts).sort(function(a, b) {
        return itemCounts[b] - itemCounts[a];
    });

    // Iterate through each unique item name in sorted order
    for (var index = 0; index < sortedItemNames.length; index++) {
        var itemName = sortedItemNames[index];
        var x = xStart;
        var y = yStart;
        var count = 0; // Reset count to 0 for each new item type

        // Iterate through all items of the current item name
        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            var currentName = GetItemName(item); // Get item name
            if (currentName === itemName) {
                // Check if y position exceeds 250
                if (y >= 250) {
                    x += 30; // Increment x by 30
                    y = 65; // Reset y to 65
                    count++;
                    Orion.Print("Reset count to 0 for new column. Current count: " + count);
                }
                Orion.MoveItem(item.Serial(), 0, toContainer.Serial(), x, y); // Move item to toContainer
                Orion.Wait(100);
                if (Orion.InJournal('You must wait')) {
                    Orion.ClearJournal();
                    Orion.Wait(1500);
	                Orion.MoveItem(item.Serial(), 0, toContainer.Serial(), x, y); // Move item to toContainer                    
	                Orion.Wait(delay);
                    continue;
                }
                Orion.Print("Moved item " + itemName + " to x: " + x + ", y: " + y); // Print x and y coordinates
                Orion.Wait(delay);
                y += 20; // Increment y for the next item
            }
        }

        // Increment x position for the next item name
        xStart += xIncrement + (count * 25); // Adjust x position for the next item name
    }

    Orion.RemoveObject('fromContainer');
    Orion.RemoveObject('toContainer');
}

// Function to extract the item name
function GetItemName(item) {
    var props = item.Properties();
    if (props) {
        var lines = props.split("\n"); // Split the properties by line
        return lines[0]; // Return the first line which should be the item name
    }
    return "Unknown Item"; // Fallback if properties not found
}