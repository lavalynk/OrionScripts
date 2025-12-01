const vendors = [
    { Name: "Stat Loss", Serial: "0x06AB7E4A", Items: "0x0F09" },
    { Name: "Supernova", Serial: "0x06AB7DDE", Items: "0x0F09" },
    { Name: "Seeds of Life", Serial: "0x08508DB5", Items: "0x1727" },
    { Name: "Trapped Boxes", Serial: "0x06AB7DCE", Items: "0x09A9 | 0x0E7E" },
    { Name: "Gems of Salvation", Serial: "0x06AB63D1", Items: "0x1F13" },
    { Name: "Blackrock Stew", Serial: "0x0731CC40", Items: "0x2DBA" },
    { Name: "Barrab Hemolymph", Serial: "0x08508DE2", Items: "0x0F06" },
    { Name: "Mana Draughts", Serial: "0x08508F1B", Items: "0x0FFB" },
    { Name: "Pardons", Serial: "0x08508EDF", Items: "0x14EE" },
    { Name: "Enchanted Apples", Serial: "0x06AB607A", Items: "0x2FD8" },
    { Name: "Urali Trance Tonic", Serial: "0x0894D279", Items: "0x0F06" },
    { Name: "Royal Forged Pardons", Serial: "0x06AB5B0B", Items: "0x46B2" },
    { Name: "Enhanced Bandages", Serial: "0x055B1E03", Items: "0x0E21" },
    { Name: "Treasure", Serial: "0x0894D982", Items: '0x9E2B|0x1455|0xA412|0x277C|0x1F04|0xA40E|0x1541' },
    { Name: "Trove", Serial: "0x0894DA6E", Items: '0x2309|0x2797' },
    { Name: "Iridescent Inks", Serial: "0x0616D2EB", Items: '0x0EFF' }
];





function formatNumberWithCommas(number) {
    var parts = number.toString().split("."); // Split the number into integer and decimal parts if any
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commas using a regular expression
    return parts.join("."); // Rejoin integer and decimal parts
}

function VENDORCheck() {
    var total = 0; // Initialize the total variable to accumulate the numbers
	var today = new Date();
	var date = (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getFullYear()
	var line = "----------------------------------------------------------------------------"
	SendDiscordVend(line)
	SendDiscordVend("|                                                 :diamonds: "+ date + " :diamonds:                                                       |")
	SendDiscordVend(line)
	
vendors.forEach(function(vendor) {
    Orion.UseObject(vendor.Serial);
    Orion.Wait(500); // Wait for the gump to potentially appear
    var gump = Orion.GetLastGump();
    if (gump) {
        var text = gump.TextList();
        if (text.length > 3) { // Ensure there is at least a fourth item
            var rawNumber = text[3]; // Access the fourth item in the list
            var number = parseFloat(rawNumber.replace(/,/g, '')); // Remove commas and convert to float
            if (!isNaN(number)) {
                total += number;  // Add to the total
                var formattedNumber = formatNumberWithCommas(number); // Format number with commas
                GumpAction('0x000002AB', 1, 1500, false);
                
                var itemCount = Orion.Count(vendor.Items, -1, vendor.Serial); // Using Orion.Count as per your setup
                
                SendDiscordVend(vendor.Name + ": " + formattedNumber + ' coins.  Items: ' + itemCount);
            } else {
                Orion.Print(vendor.Name + ": The item at position [3] is not a valid number.");
            }
        } else {
            Orion.Print(vendor.Name + ": Not enough items in the gump text list.");
        }
    } else {
        Orion.Print(vendor.Name + ": No gump found after using object.");
    }

    Orion.Wait(1500); // Wait before processing the next vendor
});

    var formattedTotal = formatNumberWithCommas(total);  // Format the total value with commas
	SendDiscordVend("----------------------------------------------------------------------------")    
    SendDiscordVend("Total: " + formattedTotal + ' coins.');  // Print the final total
}



function SendDiscordVend(theMessage){
  //Send message to:
  // Discord
    var bot = "https://discord.com/api/webhooks/1233833622176272446/eBDo4CoVl63nzAYDij6dIpFE0vD6xndnZx84rw0XK3M_38XkF_M7dO0uePXTdxiLP90X"; // Webhook url
    var charName = Player.Name();
    var paramText = "username="+charName+"&content= "+ theMessage

     Orion.Wait(200);
     Orion.HttpPost(bot, paramText);

}

function GumpAction(gumpID, hookID, waitTime, closeGump)
{
    if (Orion.WaitForGump(1000))
    {
        var gump = Orion.GetGump('last');
        if ((gump !== null) && (!gump.Replayed()) && (gump.ID() === gumpID))
        {
            gump.Select(Orion.CreateGumpHook(hookID));
            Orion.Wait(waitTime);
            
            if (closeGump)
            {
                gump.Select(Orion.CreateGumpHook(0)); //Close Gump
                Orion.Wait(300);
                Orion.CancelTarget();
            }
        }
    }
}

function VENDORCollect() {
    vendors.forEach(function(vendor) {
        // Open the vendor gump
        Orion.UseObject(vendor.Serial);
        Orion.Wait(500); // Give the gump time to appear

        var gump = Orion.GetLastGump();
        if (gump && gump.ID() === '0x000002AB') {
            // Grab all text from the gump
            var texts = gump.TextList();
            // Make sure index [3] exists
            if (texts && texts.length > 3) {
                // The gold amount is in texts[3], e.g. "1,563,379"
                var rawGold = texts[3];
                // Strip commas and parse
                var goldNum = parseInt(rawGold.replace(/,/g, ''));
                if (!isNaN(goldNum)) {
                    // 1) Set the gump’s text entry with the gold amount
                    //    (adjust the index from "8" if your text entry is different)               
                    // 2) Click the "Collect Gold" button (hook ID = 7 in this example)
                    GumpAction('0x000002AB', 7, 1500, false); 
                    Orion.SendPrompt(goldNum)                    
                } else {
                    Orion.Print(vendor.Name + ': Could not parse a valid gold number at [3].');
                }
            } else {
                Orion.Print(vendor.Name + ': Not enough items in the gump text list.');
            }
        } else {
            Orion.Print(vendor.Name + ': No matching gump found after using the object.');
        }

        Orion.Wait(1000); // Wait a moment before moving on
    });
}
