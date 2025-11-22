//--------------------------------------------------------------
// Town Crier Sextant Watcher + GUI
// By: LavaLynk
// What this script does:
//
// 1) StartCrierWatcher()
//      - Watches journal for Town Crier messages containing
//        "descends upon" and sextant coordinates.
//      - Detects facet from text.
//      - Converts sextant to X/Y.
//      - Sets world map pointer and prints a summary.
//
// 2) GUI (full and mini)
//      - CrierWatcherGUI() shows the full GUI.
//      - CrierWatcherGUIMini() shows a small collapsed bar.
//      - Toggle uses Shared var "CrierWatcherEnabled":
//          * After toggle:
//                if value == 0  -> Orion.Exec("StartCrierWatcher", true)
//                if value == 1  -> Orion.Terminate("StartCrierWatcher")
//      - Check mark shows when watcher is running (flag == 0).
//--------------------------------------------------------------


//--------------------------------------------------------------
// Globals
//--------------------------------------------------------------
var CRIER_FLAG_VAR = "CrierWatcherEnabled";   // 0 or 1
var CRIER_GUMP_ID  = 990001;                  // custom gump id


//--------------------------------------------------------------
// StartCrierWatcher
//
// Main loop that watches the journal for Town Crier lines.
// Looks for "descends upon" and processes each new matching
// line once.
//--------------------------------------------------------------
function StartCrierWatcher()
{
    Orion.Print("Crier sextant watcher started");
    var lastLine = "";

    while (true)
    {
        var j = Orion.InJournal("descends upon");
        if (j)
        {
            var text = j.Text();

            if (text && text !== lastLine)
            {
                lastLine = text;
                HandleCrierLine(text);
            }
        }

        Orion.Wait(500);
    }
}


//--------------------------------------------------------------
// HandleCrierLine
//
// Handles one Town Crier message:
//   - Detect facet name.
//   - Extract sextant coordinates.
//   - Convert to X/Y.
//   - Set world map pointer.
//   - Print summary line.
//--------------------------------------------------------------
function HandleCrierLine(text)
{
    var facetName = DetectFacet(text);

    // Example format: 67o 20'N, 100o 7'W
    var m = text.match(/(\d+o\s*\d+'[NS]),\s*(\d+o\s*\d+'[EW])/i);
    if (!m)
    {
        Orion.Print("[CRIER] No sextant coords found in: " + text);
        return;
    }

    var lat = m[1].trim();
    var lon = m[2].trim();
    var sextant = lat + ", " + lon;

    var xy = Orion.SextantToXY(sextant, facetName);
    if (!xy)
    {
        Orion.Print("[CRIER] Could not convert: " + sextant + " (" + facetName + ")");
        return;
    }

    Orion.SetWorldMapPointerPosition(xy.X(), xy.Y(), facetName);

    Orion.Print("[CRIER] " + facetName + " | " + sextant + " -> X:" + xy.X() + " Y:" + xy.Y());
}


//--------------------------------------------------------------
// DetectFacet
//
// Reads the Crier text and returns a facet string that Orion
// understands.
// Possible return values:
//   Tokuno, TerMur, Malas, Ilshenar, Felucca, Trammel, Current
//--------------------------------------------------------------
function DetectFacet(text)
{
    if (!text) return "Current";

    var t = ("" + text).toLowerCase();

    if (t.indexOf("tokuno")   >= 0) return "Tokuno";
    if (t.indexOf("ter mur")  >= 0) return "TerMur";
    if (t.indexOf("malas")    >= 0) return "Malas";
    if (t.indexOf("ilshenar") >= 0) return "Ilshenar";
    if (t.indexOf("felucca")  >= 0) return "Felucca";
    if (t.indexOf("trammel")  >= 0) return "Trammel";

    return "Current";
}


//--------------------------------------------------------------
// CrierWatcherGUI  (full GUI)
//
// Full sized GUI:
//   - Frame and title bar.
//   - Minimize button (300000).
//   - Centered toggle checkbox that controls CrierWatcherEnabled.
//   - Styled status bar with parchment background.
//--------------------------------------------------------------
function CrierWatcherGUI()
{
    // Default flag to "off" (1) if not set
    if (Shared.GetVar(CRIER_FLAG_VAR) === undefined)
        Shared.AddVar(CRIER_FLAG_VAR, 1);

    var g = Orion.CreateCustomGump(CRIER_GUMP_ID);
    g.Clear();
    g.SetCallback("CrierWatcher_OnClick");

    var width    = 6;
    var height   = 4;
    var cellSize = 35;
    var frameHue = 1900;

    // Frame tiles
    for (var row = 0; row < height; row++)
    {
        for (var col = 0; col < width; col++)
        {
            var tileId = 0x9BF9;

            if (row === 0 && col === 0)                       tileId = 0x9BF5;
            else if (row === 0 && col === width - 1)          tileId = 0x9BF7;
            else if (row === height - 1 && col === 0)         tileId = 0x9BFB;
            else if (row === height - 1 && col === width - 1) tileId = 0x9BFD;
            else if (row === 0)                               tileId = 0x9BF6;
            else if (row === height - 1)                      tileId = 0x9BFC;
            else if (col === 0)                               tileId = 0x9BF8;
            else if (col === width - 1)                       tileId = 0x9BFA;

            g.AddGumpPic(col * cellSize, row * cellSize, tileId, frameHue);
        }
    }

    var guiWidth     = width * cellSize;
    var title        = "Crier Watcher";
    var avgCharWidth = 6;
    var centeredX    = CalculateCenteredX(guiWidth, title, avgCharWidth);

    // Minimize button (same style as Umbrascale)
    g.AddButton(300000, centeredX - 20, 9, 0x637, 0x637, 0x637, "1900");
    g.AddTooltip("Minimize");
    g.AddText(centeredX, 10, 1152, title, 0);

    // Toggle state from Shared var
    var flagVal = Shared.GetVar(CRIER_FLAG_VAR);
    var isOn    = (flagVal == 0 || flagVal === "0"); // 0 means watcher running

    var promptY = 50;

    var checkedId   = 0x2602;
    var uncheckedId = 0x2603;
    var iconId      = isOn ? checkedId : uncheckedId;

    // ---------- Centered Toggle Button and Label ----------
    var label       = "Enable";
    var labelWidth  = label.length * avgCharWidth;
    var checkboxW   = 25;
    var spacing     = 8;
    var totalToggleWidth = checkboxW + spacing + labelWidth;
    var toggleX     = Math.floor((guiWidth - totalToggleWidth) / 2);

    // Button 1 - main toggle
    g.AddButton(1, toggleX-50, promptY, iconId, iconId, iconId, "");
    g.AddTooltip("Enable or disable watcher");
    g.AddText(toggleX-45 + checkboxW + spacing, promptY + 4, 1152, label, 0);

    // Styled status bar
    var statusText = isOn ? "Active" : "Idle";
    var statusY    = promptY + 30;

    // Parchment bar beneath toggle
    TileGumpBackground(g, 20, statusY, guiWidth - 40, 25, 0x0EED, 0);

    g.AddText(30, statusY + 25, 1105, "Status:", 0);

    var statusHue = isOn ? 68 : 1105;   
    g.AddText(90, statusY + 25, statusHue, statusText, 0);

    g.Update();
}


//--------------------------------------------------------------
// CrierWatcherGUIMini
//
// Mini version of the GUI:
//   - Same frame style but shorter.
//   - Title and maximize button only.
//   - No status and no toggle.
//--------------------------------------------------------------
function CrierWatcherGUIMini()
{
    var g = Orion.CreateCustomGump(CRIER_GUMP_ID);
    g.Clear();
    g.SetCallback("CrierWatcher_OnClick");

    var width    = 6;
    var height   = 2;
    var cellSize = 35;
    var frameHue = 1900;

    for (var row = 0; row < height; row++)
    {
        for (var col = 0; col < width; col++)
        {
            var tileId = 0x9BF9;

            if (row === 0 && col === 0)                       tileId = 0x9BF5;
            else if (row === 0 && col === width - 1)          tileId = 0x9BF7;
            else if (row === height - 1 && col === 0)         tileId = 0x9BFB;
            else if (row === height - 1 && col === width - 1) tileId = 0x9BFD;
            else if (row === 0)                               tileId = 0x9BF6;
            else if (row === height - 1)                      tileId = 0x9BFC;
            else if (col === 0)                               tileId = 0x9BF8;
            else if (col === width - 1)                       tileId = 0x9BFA;

            g.AddGumpPic(col * cellSize, row * cellSize, tileId, frameHue);
        }
    }

    var guiWidth     = width * cellSize;
    var title        = "Crier Watcher";
    var avgCharWidth = 6;
    var centeredX    = CalculateCenteredX(guiWidth, title, avgCharWidth);

    // Maximize button
    g.AddButton(300001, centeredX - 20, 9, 0x637, 0x637, 0x637, "1900");
    g.AddTooltip("Maximize");
    g.AddText(centeredX, 10, 1152, title, 0);

    g.Update();
}


//--------------------------------------------------------------
// CrierWatcher_OnClick
//
// Handles clicks from both full and mini GUI windows.
//
// Button ids:
//   1      - main toggle
//   300000 - minimize (full to mini)
//   300001 - maximize (mini to full)
//
// After toggle:
//   - Read Shared var.
//   - If value is 0, start watcher (Exec).
//   - If value is 1, terminate watcher.
//--------------------------------------------------------------
function CrierWatcher_OnClick()
{
    var id = CustomGumpResponse.ReturnCode();

    switch (id)
    {
        case 1:
            // Flip Shared flag first
            ToggleCrierWatcherFlag();

            var val = Shared.GetVar(CRIER_FLAG_VAR);

            if (val == 0 || val === "0")
            {
                // Flag 0 -> start watcher
                if (!Orion.ScriptRunning("StartCrierWatcher"))
                {
                    Orion.Exec("StartCrierWatcher", true);
                }
            }
            else
            {
                // Flag 1 -> stop watcher
                if (Orion.ScriptRunning("StartCrierWatcher"))
                {
                    Orion.Terminate("StartCrierWatcher");
                }
            }

            // Redraw full GUI to update icon and status
            CrierWatcherGUI();
            break;

        case 300000:
            // Minimize
            CrierWatcherGUIMini();
            break;

        case 300001:
            // Maximize
            CrierWatcherGUI();
            break;

        default:
            break;
    }
}


//--------------------------------------------------------------
// ToggleCrierWatcherFlag
//
// Flips CrierWatcherEnabled between 0 and 1.
//   - Missing value is treated as 1 (off).
//   - 1 becomes 0.
//   - 0 becomes 1.
//--------------------------------------------------------------
function ToggleCrierWatcherFlag()
{
    var cur = Shared.GetVar(CRIER_FLAG_VAR);

    if (cur === undefined || cur === null || cur === "")
    {
        cur = 1;
    }

    var next = (cur == 1 || cur === "1") ? 0 : 1;
    Shared.AddVar(CRIER_FLAG_VAR, next);
}


//--------------------------------------------------------------
// TileGumpBackground
//
// Helper that tiles a gump image over a rectangle using
// AddGumpPic. Replaces ClassicAssist style AddGumpPicTiled.
//--------------------------------------------------------------
function TileGumpBackground(g, x, y, width, height, tileId, hue)
{
    var tileW = 50;
    var tileH = 50;

    for (var xx = 0; xx < width; xx += tileW)
    {
        for (var yy = 0; yy < height; yy += tileH)
        {
            g.AddGumpPic(x + xx, y + yy, tileId, hue);
        }
    }
}


//--------------------------------------------------------------
// CalculateCenteredX
//
// Utility to roughly center text inside a frame with a given
// pixel width and average character width.
//--------------------------------------------------------------
function CalculateCenteredX(totalWidth, text, averageCharWidth)
{
    var textWidth = (text ? text.length : 0) * averageCharWidth;
    return (totalWidth - textWidth) / 2;
}
