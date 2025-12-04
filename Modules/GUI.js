//--------------------------------------------------------------------------------------------------------------------
// GUI MODULE
// By: LavaLynk
// Shared helpers for Orion custom gumps
// Intended to be #included into other scripts.
//--------------------------------------------------------------------------------------------------------------------

// ====================================================================================================================
// Function: CalculateCenteredX
// Purpose:  Return an X coordinate to center text in a GUI.
// Params:   guiWidth (number) - total width of the GUI in pixels
//           text     (string) - text to center
//           avgChar  (number) - average character width in pixels
// ====================================================================================================================
function CalculateCenteredX(guiWidth, text, avgChar) {
    var textWidth = text.length * avgChar;
    var x = (guiWidth - textWidth) / 2;
    if (x < 0) {
        x = 0;
    }
    return x;
}

// ====================================================================================================================
// Function: UpdateGUIStatus
// Purpose:  Update the global gui_status text and refresh the correct GUI if the text changed.
// Params:   msg     (string) - text to put into gui_status
//           guiName (string, optional) - GUI function name to call when status changes, defaults to "GUI"
// ====================================================================================================================
function UpdateGUIStatus(msg, guiName) {
    if (!msg) msg = "";

    // trim to 30 characters
    var trimmed = msg.length > 30 ? msg.substring(0, 30) : msg;

    var currentMessage = Orion.GetGlobal('gui_status');
    if (currentMessage === trimmed) {
        return;
    }

    Orion.SetGlobal('gui_status', trimmed);
    GUI(guiName);
}


// ====================================================================================================================
// Function: GUIIsScriptRunning
// Purpose:  Check if a script is currently running.
// Params:   scriptName (string) - name of the script to check
// ====================================================================================================================
function GUIIsScriptRunning(scriptName) {
    return Orion.ScriptRunning(scriptName) > 0;
}

// ====================================================================================================================
// Function: GUIGetScriptCheckbox
// Purpose:  Get the checkbox gump id for a script running state.
// Params:   scriptName (string) - script name to check
// ====================================================================================================================
function GUIGetScriptCheckbox(scriptName) {
    return GUIIsScriptRunning(scriptName) ? 0x2602 : 0x2603;
}

// ====================================================================================================================
// Function: GUIGetScriptColor
// Purpose:  Get a hue based on whether a script is running.
// Params:   scriptName (string) - script name to check
//           hueOn      (number, optional) - hue when running, default 1152
//           hueOff     (number, optional) - hue when not running, default 33
// ====================================================================================================================
function GUIGetScriptColor(scriptName, hueOn, hueOff) {
    if (typeof hueOn === 'undefined') {
        hueOn = 1152;
    }
    if (typeof hueOff === 'undefined') {
        hueOff = 33;
    }
    return GUIIsScriptRunning(scriptName) ? hueOn : hueOff;
}


// ====================================================================================================================
// Function: toggleToggle
// Purpose:  Flip a Shared toggle and return the new state.
// Params:   key (string) - Shared variable name
// ====================================================================================================================
function toggleToggle(key) {
    var nowOn = !isToggleOn(key);
    setToggle(key, nowOn);
    return nowOn;
}





// ====================================================================================================================
// Function: GUIGetToggleCheckbox
// Purpose:  Get checkbox gump id from a Shared toggle.
// Params:   toggleName (string) - Shared key to read
// ====================================================================================================================
function GUIGetToggleCheckbox(toggleName) {
    return isToggleOn(toggleName) ? 0x2602 : 0x2603;
}

// ====================================================================================================================
// Function: GUIGetToggleColor
// Purpose:  Get hue based on a Shared toggle state.
// Params:   toggleName (string)      - Shared key to read
//           hueOn      (number, opt) - hue when ON, default 945
//           hueOff     (number, opt) - hue when OFF, default 902
// ====================================================================================================================
function GUIGetToggleColor(toggleName, hueOn, hueOff) {
    if (typeof hueOn === 'undefined') {
        hueOn = 945;
    }
    if (typeof hueOff === 'undefined') {
        hueOff = 902;
    }
    return isToggleOn(toggleName) ? hueOn : hueOff;
}


// ====================================================================================================================
// Function: UpdateGUIPhase
// Purpose:  Set the GUI "phase" text to exactly 7 characters: 6-char padded/trimmed text + a colon.
//           Example: "Cast  :" or "Attack:"
// Params:   msg     (string) - Phase text (trimmed/padded to 6 chars)
//           guiName (string) - Optional GUI name to refresh via GUI(guiName)
// ====================================================================================================================
function UpdateGUIPhase(msg, guiName)
{
    if (!msg)
        msg = "";

    // Step 1: Trim to max 6 chars
    var base = msg.substring(0, 6);

    // Step 2: Pad with spaces until length is exactly 6
    while (base.length < 6)
        base += " ";

    // Step 3: Add colon at position 7
    var finalPhase = base + ":";

    // Avoid unnecessary redraw
    var current = Orion.GetGlobal('gui_phase');
    if (current === finalPhase)
        return;

    Orion.SetGlobal('gui_phase', finalPhase);

    // Refresh GUI
    GUI(guiName);
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

//--------------------------------------------------------------
// SHARED TOGGLE UTILITIES
//--------------------------------------------------------------

// ====================================================================================================================
// Function: setToggle
// Purpose:  Set a Shared toggle to 0 or 1.
// Params:   key (string) - Shared variable name
//           on  (bool)   - true for 1, false for 0
// ====================================================================================================================
function setToggle(key, on) {
    Shared.AddVar(key, on ? 1 : 0);
}

// ====================================================================================================================
// Function: ToggleScriptShared
// Purpose:  Toggle both a Shared flag and an Orion script.
// Params:   scriptName (string) - script to toggle
//           toggleName (string, optional) - Shared key, defaults to scriptName
// ====================================================================================================================
function ToggleScriptShared(scriptName, toggleName) {
    if (!toggleName) {
        toggleName = scriptName;
    }

    var nowOn = toggleToggle(toggleName);

    if (nowOn) {
        if (!Orion.ScriptRunning(scriptName)) {
            Orion.ToggleScript(scriptName);
        }
    } else {
        if (Orion.ScriptRunning(scriptName)) {
            Orion.Terminate(scriptName);
        }
    }
}

// ====================================================================================================================
// Function: TurnOffScript
// Purpose:  Force a script off and clear its Shared toggle.
// Params:   scriptName (string) - script to terminate
//           toggleName (string, optional) - Shared key, defaults to scriptName
// ====================================================================================================================
function TurnOffScript(scriptName, toggleName) {
    if (!toggleName) {
        toggleName = scriptName;
    }
    setToggle(toggleName, 0);
    if (Orion.ScriptRunning(scriptName)) {
        Orion.Terminate(scriptName);
    }
}


// #flag: Return hue for label text based on toggle name
function GetColorStatus(toggleName) {
    return isToggleOn(toggleName) ? HUE_LABEL_ON : HUE_LABEL_OFF;
}

// #flag: Return checkbox gump id based on toggle name
function GetCheckboxStatus(toggleName) {
    if (isToggleOn(toggleName)) {
        return 0x2602; // checked
    }
    return 0x2603;     // unchecked
}

// ====================================================================================================================
// Function: isToggleOn
// Purpose:  Read a Shared toggle variable and return true if it is ON (1 or "1").
// Params:   toggleName (string) - Shared variable key
// Returns:  Boolean - true if ON, false otherwise
// ====================================================================================================================
function isToggleOn(toggleName)
{
    var val = Shared.GetVar(toggleName);

    if (val === undefined || val === null)
        return false;

    // Accept numeric or string versions of ON
    return (val === 1 || val === "1");
}

// ====================================================================================================================
// Function: StartSimpleTimer
// Purpose:  Create a display timer using only a name and duration (ms).
//           Auto-generates a safe ID, uses a bar timer, and places it at RightTop.
// Params:   name (string) - Timer label shown to player
//           ms   (number) - Duration in milliseconds
// Returns:  timerId (string) - Generated timer ID
// ====================================================================================================================
function StartTimer(name, ms)
{
    Orion.AddDisplayTimer(name, ms, "AboveChar", "Circle|Bar", name, 0, 0)
}

// ==================================================================
// Function: CreateSmallButton
// Purpose:  Build a six piece small button and center a text label
// Params:   customGump - custom gump object
//           baseSerial - serial for first piece (others are +1..+5)
//           x, y       - top left (NW) position of the button
//           color      - button and text color
//           text       - caption to display
// ==================================================================
function CreateSmallButton(customGump, baseSerial, x, y, color, text)
{
    // Graphics
    var G_NW = '0x254E';
    var G_N  = '0x254F';
    var G_NE = '0x2550';
    var G_SW = '0x2554';
    var G_S  = '0x2555';
    var G_SE = '0x2556';

    // Piece sizes from the art viewer
    var widthLeft   = 11;
    var widthMiddle = 16;
    var widthRight  = 11;
    var heightTop   = 10;
    var heightBottom = 13;

    var totalWidth  = widthLeft + widthMiddle + widthRight;   // 38
    var totalHeight = heightTop + heightBottom;               // 23

    // ----------------------------------------------------------------
    // Build the button from six pieces
    // ----------------------------------------------------------------
    // Top row
    customGump.AddButton(baseSerial,     x,                           y,                          			 G_NW, G_NW, G_NW, color);
    customGump.AddButton(baseSerial + 1, x + widthLeft,               y,                         		 G_N,  G_N,  G_N,  color);
    customGump.AddButton(baseSerial + 2, x + widthLeft + widthMiddle, y,                           G_NE, G_NE, G_NE, color);

    // Bottom row
    customGump.AddButton(baseSerial + 3, x,                           y + heightTop,             	  G_SW, G_SW, G_SW, color);
    customGump.AddButton(baseSerial + 4, x + widthLeft,               y + heightTop,               G_S,  G_S,  G_S,  color);
    customGump.AddButton(baseSerial + 5, x + widthLeft + widthMiddle, y + heightTop,          G_SE, G_SE, G_SE, color);

    // ----------------------------------------------------------------
    // Centered text (approximation using fixed width font)
    // ----------------------------------------------------------------
    // UO gump fonts are close to fixed width. This works well for buttons.
    var charWidth  = 7;   // tweak if it looks a hair off
    var fontHeight = 13;  // approximate pixel height of the font

    var textPixelWidth = text.length * charWidth;
    if (textPixelWidth > totalWidth) textPixelWidth = totalWidth; // clamp for long strings

    var textX = x + Math.floor((totalWidth  - textPixelWidth) / 2);
    var textY = y + Math.floor((totalHeight - fontHeight) / 2);

    // width = totalWidth so the engine has enough room, serial tied to baseSerial
    customGump.AddText(textX, textY, color, text, totalWidth, baseSerial);
}
