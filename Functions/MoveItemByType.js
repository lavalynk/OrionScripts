//------------------------------------------------------------------------------------------------------------------------------------------
// MoveItemByType()
// Moves all items of a selected type and color from one container to another.
//------------------------------------------------------------------------------------------------------------------------------------------
function MoveItemByType()
{
    var delay = 600;
    Orion.AddObject('fromContainer');
    Orion.Print('Select a container to move items from');
    while(Orion.HaveTarget()){
        Orion.Wait('50');
    }
    Orion.AddObject('toContainer');
    Orion.Print('Select a container to move items to');
    while(Orion.HaveTarget()){
        Orion.Wait('50');
    }
    Orion.AddObject('item');
    Orion.Print('Select an item to move');
    while(Orion.HaveTarget()){
        Orion.Wait('50');
    }
    var fromContainer = Orion.FindObject('fromContainer');
    var toContainer = Orion.FindObject('toContainer');
    var item = Orion.FindObject('item');
    var itemType = item.Graphic();
    var itemColor = item.Color();
    
    while(true){
        var items = Orion.FindTypeEx(itemType, itemColor, fromContainer.Serial());
        if(items.length){
            Orion.MoveItem(items[0].Serial(), 1, toContainer.Serial());
            Orion.Wait(delay);    
        }
        else
            break;
    }
    Orion.RemoveObject('fromContainer');
    Orion.RemoveObject('toContainer');
    Orion.RemoveObject('item');    
}