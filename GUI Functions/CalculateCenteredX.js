//------------------------------------------------------------------------------------------------------------------------------------------
// CalculateCenteredX()
// Calculates the X-coordinate needed to horizontally center text within a GUI element,  
// based on total GUI width, text length, and average character width.
//------------------------------------------------------------------------------------------------------------------------------------------
function CalculateCenteredX(guiWidth, text, averageCharWidth) {
    var textWidth = text.length * averageCharWidth;
    return (guiWidth - textWidth) / 2;
}