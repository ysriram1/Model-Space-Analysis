// update the box with shared tokens to include
// the new info string
function updateSharedTokens(info, sType) {
  var toksDiv = elem('SharedTokens');
  var currStr = toksDiv.innerHTML;
  var currToks = cleanLines(currStr);
  console.log(currStr);

  // empty input string means clear the box
  if (info == undefined) {
    toksDiv.innerHTML = "";
    return;
  }

  // get the new tokens
  var newToks = [];
  var newLines = cleanLines(info);
  if (sType == "dot") {
    newToks = newLines.slice(4); // just remove first //Sriram: slice val changed from 1 to 4 to remove unwanted information
    console.log(newLines);
  }

  // empty current toks mean just add all the new ones
  if (currStr == "") {
    toksDiv.innerHTML = newToks.join("<br>");
    return;
  }

  // intersect the sets
  var intersect = currToks.filter(
                             function(item) {
                               return newToks.indexOf(item) != -1;
                             } );
  
  toksDiv.innerHTML = intersect.join("<br>");
}


// convert to lower case, convert other br types
// and split
function cleanLines(S) {
  return S.toLowerCase()
          .replace(/<br \/>/g, "<br>")
          .split("<br>");
}
