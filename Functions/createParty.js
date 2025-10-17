//------------------------------------------------------------------------------------------------------------------------------------------
// create_Party()
// Scans nearby friendly players and invites them via context menu until the party reaches the max size.
//------------------------------------------------------------------------------------------------------------------------------------------
function createParty() {
	var targetFlags = 'ignoreself|ignoreenemies|live|inlos';
	var partyNoto = 'green';
	// Dead 0x0192-0x0193, 0x025F-0x0260, 0x02B6-0x02B7
	// Gargoyle=0x029B, Gargoyle=0x029A, Elf=0x025E
	// Graphic=0x02EB|0x02EC player wraith form, Graphic=0x02C1 player stone form,  Graphic=0x011D player reaper form, Graphic=0x02ED player lich form,
	// Gargoyle=0x029B, Gargoyle=0x029A, Elf=0x025E
	const players = "0x0190|0x0191|0x0192|0x0193|0x00B7|0x00BA|0x025D|0x025E|0x0260|0x029A|0x029B|0x02B6|0x02B7|0x03DB|0x03DF|0x03E2|0x02EB|0x02EC|0x02ED|0x02C1|0x011D";
	const maxMembers = 10;
	var getMembersStart = Orion.PartyMembers().length + 1;
    if(getMembersStart == maxMembers) {
        Orion.CharPrint(self, 55, 'Party members: ' + getMembersStart +'/'+ maxMembers);
        Orion.CharPrint(self, 55, '-- Party is full --');
        return;
    }
	var getParty = Orion.FindType(players, any, 'ground', targetFlags, 8, partyNoto);
	if (getParty.length > 0) {
		for (var i = 0; i < getParty.length; i++) {
			if(!Orion.InParty(getParty[i])) {
				Orion.RequestContextMenu(getParty[i]); // Request context menu on player
				Orion.WaitContextMenuID(getParty[i], 810); // Select 'Add Party Member' option
				Orion.Wait(1500);
                var getMembers = Orion.PartyMembers().length + 1;
                if(getMembers == maxMembers) {
                    Orion.CharPrint(self, 55, 'Party members: ' + getMembers +'/'+ maxMembers);
                    Orion.CharPrint(self, 55, '-- Party is full --');
                    return;
                }
            }
        }
    } else {
        Orion.CharPrint(self, 55, '--No one found--');
        return;
    }
    var getMembers = Orion.PartyMembers().length + 1;
    if(getMembers > getMembersStart) {
        count = getMembers - getMembersStart;
        Orion.CharPrint(self, 55, 'Party members: ' + getMembers +'/'+ maxMembers);
        Orion.CharPrint(self, 55, '--- ' + count + ' members added --');
    } else if (getMembers == getMembersStart) {
        Orion.CharPrint(self, 55, '-- No members added --');
    }
}

//------------------------------------------------------------------------------------------------------------------------------------------
// disbandParty()
// Opens the player context menu to disband the current party and clears the stored follow target (“ac_master”).
//------------------------------------------------------------------------------------------------------------------------------------------
function disbandParty() {
	Orion.RequestContextMenu(Player.Serial());
	Orion.WaitContextMenuID(Player.Serial(), 811);
	Orion.Wait(500)
	Orion.RemoveObject('ac_master');
}