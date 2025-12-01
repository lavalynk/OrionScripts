// ============================================================
// Town Crier Invasion Scanner
// by LavaLynk
//
// This script searches for the nearest Town Crier, walks to it,
// and checks the journal for the Umbrascale invasion message.
// When the message appears, it extracts the two dungeon names
// and stores them in Shared variables:
//
//   Shared.dungeon1
//   Shared.dungeon2
//   Shared.invasionDetected = 1
//
// Process:
//   • Scan for a Town Crier within _scanRange tiles
//   • Walk to the crier up to _maxTries attempts
//   • Each loop, check the journal for the invasion line
//   • If nothing is found, move away briefly and return
//
// Once detected, the dungeon names are stored for use by
// other scripts.
// ============================================================

// ========================== Config ==========================
var _maxTries      = 10;   // how many loops before giving up
var _retryDelayMs  = 400;   // wait between checks
var _scanRange     = 18;    // how far to look for Town Crier
var _stepDistance  = 10;    // how far to run away each loop (tiles)

// If your shard uses different dungeon names, add here:
var _dungeonNames = ['Fire', 'Deceit', 'Terathan Keep', 'Destard', 'Rock', 'Blood', 'Ankh'];

// ======================= Entry Point ========================
function FindCrierAndScan()
{
	Orion.ClearJournal()
    var tries = 0;
    Orion.Print('Looking for a Town Crier...');

    var crier = _getTownCrier();
    if (!crier)
    {
        Orion.Print('No Town Crier in range.');
        return;
    }

    Orion.Print('Found: ' + crier.Name() + ' @ ' + crier.X() + ',' + crier.Y());

    while (tries++ < _maxTries)
    {
        Orion.WalkTo(crier.X(), crier.Y(), crier.Z());

        // check journal for the invasion line
        if (_checkAndStoreUmbrascale())
        {
            Orion.Print('Umbrascale invasion detected. Stored dungeons in Shared.');
            return;
        }

        // not found: pick a direction from E / SE / SW / W, go 10 tiles, then go back
        _runAwayAndReturn(crier.X(), crier.Y(), crier.Z());
        Orion.Wait(_retryDelayMs);
    }

    Orion.Print('Gave up after too many tries without seeing the message.');
}

function _ensurePropsByObj(obj, tries, delayMs) {
    if (!tries) tries = 6;
    if (!delayMs) delayMs = 120;
    for (var i = 0; i < tries; i++) {
        var p = obj.Properties();
        if (p && p.length) return p;
        Orion.RequestObjectProperties(obj.Serial());
        Orion.Wait(delayMs);
    }
    return obj.Properties() || '';
}

function _mergeLists(a, b) {
    var out = [];
    if (a) for (var i = 0; i < a.length; i++) out.push(a[i]);
    if (b) for (var j = 0; j < b.length; j++) out.push(b[j]);
    return out;
}

// Find nearest Town Crier by PROPERTIES (e.g., "Cyrus The Town Crier")
function _getTownCrier() {
    var range = _scanRange || 18;

    // NOTE: items returned are OBJECTS already
    var listM = Orion.FindTypeEx(0x0190, -1, 'ground', 'live|ignoreself', range, -1, true);
    var listF = Orion.FindTypeEx(0x0191, -1, 'ground', 'live|ignoreself', range, -1, true);
    var humans = _mergeLists(listM, listF);

    if (!humans.length) {
        Orion.Print('No nearby humans within ' + range + ' tiles.');
        return null;
    }

    var best = null, bestDist = 1e9;

    for (var k = 0; k < humans.length; k++) {
        var obj = humans[k]; // <-- already an object
        var props = _ensurePropsByObj(obj).toLowerCase();

        // try properties first (most reliable), then fallback to Name()
        var isCrier = (props.indexOf('town crier') !== -1);
        if (!isCrier) {
            var nm = (obj.Name() || '').toLowerCase();
            if (nm.indexOf('town crier') !== -1) isCrier = true;
        }

        if (isCrier) {
            var d = Orion.GetDistance(obj.Serial());
            if (d < bestDist) {
                bestDist = d;
                best = obj;
            }
        }
    }

    if (!best) {
        for (var t = 0; t < Math.min(humans.length, 6); t++) {
            var o = humans[t];
            var ptxt = _ensurePropsByObj(o).replace(/\n/g, ' | ');
            Orion.Print(' - [' + o.Serial() + '] G=' + o.Graphic().toString(16) +
                        ' Name="' + (o.Name() || '(no name)') + '" Props="' + ptxt + '"');
        }
        return null;
    }

    return best;
}


// =============== Umbrascale Parse & Store ===================
function _checkAndStoreUmbrascale()
{
    var key = 'Umbrascale Dragons invade the';
    if (!Orion.InJournal(key))
        return false;

    // We don't have full regex access to the line text, so reconstruct by pairs.
    var d1 = null, d2 = null, i, j, full;

    // First try with two quick partial probes to be fast:
    for (i = 0; i < _dungeonNames.length; i++)
    {
        if (Orion.InJournal('invade the ' + _dungeonNames[i] + ' and '))
        { d1 = _dungeonNames[i]; break; }
    }
    for (i = 0; i < _dungeonNames.length; i++)
    {
        if (Orion.InJournal(' and ' + _dungeonNames[i] + ' Dungeons'))
        { d2 = _dungeonNames[i]; break; }
    }

    // If partials failed, brute-force full sentence:
    if (!d1 || !d2)
    {
        for (i = 0; i < _dungeonNames.length; i++)
        {
            for (j = 0; j < _dungeonNames.length; j++)
            {
                if (i === j) continue;
                full = 'invade the ' + _dungeonNames[i] + ' and ' + _dungeonNames[j] + ' Dungeons';
                if (Orion.InJournal(full))
                {
                    d1 = _dungeonNames[i];
                    d2 = _dungeonNames[j];
                    break;
                }
            }
            if (d1 && d2) break;
        }
    }

    if (d1 && d2)
    {
        Shared.AddVar('dungeon1', d1);
        Shared.AddVar('dungeon2', d2);
        Shared.AddVar('invasionDetected', 1);
        Orion.Print('Invasion at: ' + d1 + ' and ' + d2);
        return true;
    }

    // We saw the key phrase but couldn't resolve names (rare)
    Orion.Print('Saw invasion phrase but could not parse the dungeon names yet.');
    return false;
}

// ================= Move Away & Return =======================
function _runAwayAndReturn(cx, cy, cz)
{
    // pick one of E, SE, SW, W
    var roll = Math.floor(Math.random() * 4);
    var tx = cx, ty = cy;

    if (roll === 0) { tx = cx + _stepDistance; ty = cy; }                 // E
    else if (roll === 1) { tx = cx + _stepDistance; ty = cy + _stepDistance; } // SE
    else if (roll === 2) { tx = cx - _stepDistance; ty = cy + _stepDistance; } // SW
    else { tx = cx - _stepDistance; ty = cy; }                              // W

    // Go out, then come back
    Orion.WalkTo(tx, ty, cz);
    Orion.Wait(150);
    Orion.WalkTo(cx, cy, cz);
}
