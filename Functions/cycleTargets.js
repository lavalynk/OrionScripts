function cycleTargets(forward)
{
    var lastInd, lastDist, highVal;

    if (Orion.GetGlobal("forward") != String(forward))
    {
        Orion.SetGlobal("forward", String(forward));
        Orion.IgnoreReset();
        Orion.Ignore(Orion.ClientLastTarget());
    }

    for (var i = 0; i < 2; i++)
    {
        var mobArr = Orion.FindType("!0x00A4|!0x033D|!0x023E|!0x02B4 |!0x0033|!0x002F ", "-1", ground, "live", 18, "red|gray|criminal");

        if (mobArr.length)
        {
            forward ? (highVal = 18, lastDist = 0) : (highVal = 0, lastDist = 18);

            Orion.GetGlobal("lastDist") == "" ? lastDist = lastDist : lastDist = Number(Orion.GetGlobal("lastDist"));

            for (var ii = 0; ii < mobArr.length; ii++)
            {

                var dist = Orion.GetDistance(mobArr[ii]);

                if (forward && dist <= highVal && dist >= lastDist)
                {
                    highVal = dist;
                    lastInd = ii;
                }
                else if (!forward && dist >= highVal && dist <= lastDist)
                {
                    highVal = dist;
                    lastInd = ii;
                }
            }

            if (lastInd != undefined)
            {
                Orion.SetGlobal("lastDist", highVal);
                Orion.RemoveHighlightCharacter(Orion.GetGlobal("LTHighlight"),true);
                //Orion.ClearHighlightCharacters();
                //Orion.ClientLastAttack(mobArr[lastInd]);
                Orion.ClientLastTarget(mobArr[lastInd]);
                Orion.TargetSystemSerial(mobArr[lastInd]);
                var currtar = Orion.FindObject(mobArr[lastInd]);
                Orion.ClientLastTarget(mobArr[lastInd]);
                Orion.CharPrint(Player.Serial(), '48', "Target:[" + currtar.Name()+ "]");
                Orion.SetGlobal("LTHighlight",mobArr[lastInd]);
                Orion.AddHighlightCharacter(mobArr[lastInd], '1152',true);
                Orion.AddDisplayTimer(101,30000, 'Top', 'Rectangle|Bar', currtar.Name(), 0, 0, '0xFFFF', 4, 'green');
                Orion.Ignore(mobArr[lastInd]);
                return;
            }
        }

        if ((!mobArr.length && i == 0) || lastInd == undefined)
        {
            Orion.SetGlobal("lastDist", "");
            Orion.IgnoreReset();
        }
    }

    Orion.Print("No enemies!");
}
