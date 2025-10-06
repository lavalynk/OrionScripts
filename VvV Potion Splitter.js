//------------------------------------------------------------------------------------------------------------------------------------------
// autoBarrelManager()
// Pulls kegs from a secure container, splits potions from each keg, and returns finished potions to the secure.
//------------------------------------------------------------------------------------------------------------------------------------------
function autoBarrelManager(){
    // <<< replace with your secure-container serial >>>
    var secureContainer = 0x41470B6D;
    
    Orion.UseObject(secureContainer)
    Orion.Wait(3000)
    while(true){
        // 1) find next barrel in secure container
        var barrels = Orion.FindTypeEx(0x1940, -1, secureContainer);
        if(!barrels.length){
            return;
        }
        // fetch barrel
        Orion.MoveItem(barrels[0].Serial(), 1, backpack);
        Orion.Wait(1250);

        // 2) split its potions
        barrelSplit();

        // 3) return all split potions
        var potions = Orion.FindTypeEx(0x0F09, -1, backpack);
        while(potions.length){
            Orion.MoveItem(potions[0].Serial(), 1, secureContainer);
            Orion.Wait(700);
            potions = Orion.FindTypeEx(0x0F09, -1, backpack);
        }
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------
// PropertiesBarrel()
// Opens each keg in backpack until empty, then moves all produced potions to the Finished container.
//------------------------------------------------------------------------------------------------------------------------------------------
function PropertiesBarrel(){
		var item = Orion.FindTypeEx('0x1940', -1, backpack)
		var match = item[0].Properties().match(/Potions: (\d+)/);
	while (Orion.Count('0x1940', -1, backpack) != 0){
		while (item[0].Exists() == true){
			Orion.Print('Removing Potions from Keg..')
			Orion.UseObject(item[0].Serial())	
			Orion.Wait(1250)							
		}
		Orion.Print('Moving Potions to Finished...')
	potion = Orion.FindTypeEx(0x0F09, -1, backpack)
	countp = Orion.Count(0x0F09, -1, backpack)
	while (countp > 0){
			Orion.MoveItem(potion[0].Serial(), 1, GetFinished())
			potion = Orion.FindTypeEx(0x0F09, -1, backpack)				
			countp = Orion.Count(0x0F09, -1, backpack)		
			Orion.Wait(700)	
	}	
		var item = Orion.FindTypeEx('0x1940', -1, backpack)
		}
	Orion.Print('Completed....')
}

//------------------------------------------------------------------------------------------------------------------------------------------
// barrelSplit()
// Rapidly taps kegs in backpack to extract potions in batches, then deposits all extracted potions into the dropbox.
//------------------------------------------------------------------------------------------------------------------------------------------
function barrelSplit(){
	barrel = Orion.FindType(0x1940, -1, backpack)
	count = Orion.Count(0x1940, -1, backpack)
	i = 0
	
	while (count > 0){
		Orion.UseObject(barrel)
		Orion.Wait(1300)
		i++
		count = Orion.Count(0x1940, -1, backpack)	
		if (i == 10){
			barrel = Orion.FindType(0x1940, -1, backpack)	
			Orion.Print(52, 'Selecting next barrel!')
			count = Orion.Count(0x1940, -1, backpack)		
			i = 0}
		}
		
	potion = Orion.FindTypeEx(0x0F09, -1, backpack)
	countp = Orion.Count(0x0F09, -1, backpack)
	dropbox = 0x41470B6D
	
	while (countp > 0){
			Orion.MoveItem(potion[0].Serial(), 1, dropbox)
			potion = Orion.FindTypeEx(0x0F09, -1, backpack)				
			countp = Orion.Count(0x0F09, -1, backpack)		
			Orion.Wait(700)
		}
}
