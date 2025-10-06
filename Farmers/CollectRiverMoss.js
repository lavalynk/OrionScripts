//------------------------------------------------------------------------------------------------------------------------------------------
// CollectRiverMoss() — v1.00
// Author: LavaLynk
// Description: Automates River Moss harvesting by patrolling a predefined coordinate route.  
//              The script walks between waypoints, detects nearby river moss items, moves to them,  
//              and uses them automatically. Between collection cycles, it returns to a rest position  
//              and waits for respawn while maintaining stealth.
//
// Route & Behavior:
//   • Follows coordinates listed in `coords[]` in order, walking between each point.
//   • Searches within a 15-tile radius for River Moss graphics (0x0D33, 0x573D, 0x0D32).  
//   • Auto-hides between movements to maintain stealth while gathering.
//   • Returns to `start_x`, `start_y` to wait 5 minutes for resource respawn.
//
// Notes:
//   – Adjust `coords[]` for your custom patrol route.
//   – Ensure character has Hiding skill for full stealth automation.
//   – Safe for use in low-traffic gathering zones.
//
// Last Updated: 2025-10-05
//------------------------------------------------------------------------------------------------------------------------------------------
function CollectRiverMoss(){
    // start coordinates and where char will wait x time
    var start_x = 291;
    var start_y = 1581;
    // river moss type
     rivermoss = '0x0D33|0x573D|0X0D32'
    // array of coordinates
    var coords = [[395,1600],[423,1600],[432,1579],[460, 1612],[390,1585],[371,1589],[371,1575],[358,1589],[ 366,1610],[380,1616]];

    // main loop
    while(true){
        if (Player.Dead()){ break;}             // check dead
        if (!Player.Hidden()) {Orion.UseSkill('Hiding')}
        for (i in coords){
            Orion.CharPrint(self,59,'Walking to X:' + coords[i][0] + ' Y:' + coords[i][1]);
            Orion.WalkTo(coords[i][0], coords[i][1], Player.Z(), 1, 5, false); 
            if (Player.Dead()){ break;}        // check dead
            if (!Player.Hidden()) {Orion.UseSkill('Hiding')}
            // scan
            var found = Orion.FindType(rivermoss,any,ground,'items',15);
            if (found.length > 0){
                Orion.CharPrint(self,69,'Found :'+found.length)
                found.forEach(function (x){
                    var f = Orion.FindObject(x);
                    Orion.CharPrint(f.Serial(),33,'Pick Pme up!');
                    Orion.WalkTo(f.X(),f.Y(),f.Z(),1,5,false);         // walk to item
                    Orion.UseObject(f.Serial());                        // use item
                });

            }
        }
        // wait next respawn (300000) = 3min
        Orion.CharPrint(self,59,'Going to waiting spot.');
        Orion.WalkTo(start_x, start_y, Player.Z(), 1, 5, false);
        Orion.Wait(300000);
        if (!Player.Hidden()) {Orion.UseSkill('Hiding')}
    }
}