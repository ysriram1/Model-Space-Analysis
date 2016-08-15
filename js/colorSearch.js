// Gets a reference to the VisData object and the name of a text
// box the holds the search search string.
// Decorates the VisData with custom colors when search applies.
function textSearchColor(searchBox, visSVGName) {
  var searchStr = document.getElementById(searchBox).value;
  console.log(searchStr)
  var svg = d3.select(visSVGName)

  // go through each point and line 
  svg.selectAll(".dot")
    .style("fill", function(d) { return colorChoice(d, searchStr, 'dot'); }) //Sriram: added line and do args to differentiate (see colorChoice func)
  svg.selectAll(".line")
    .style("stroke", function(d) { return colorChoice(d, searchStr, 'line'); })

}


function textSearchColorReset(visSVGName) {
  var svg = d3.select(visSVGName)

  // go through each point and line 
  svg.selectAll(".dot")
     .style("fill", function(d) { return dClrsUsers[d.user]; })
  svg.selectAll(".line")
     .style("stroke", function(d) { return dClrsUsers[d.user]; })

}


// set color inside update loops for lines and dots
function colorChoice(d, searchStr, type) {
  if(type == 'line'){ //Sriram: This is done in order to make sure we only color if there is a full match. i.e.
                      //if the query is '11', we dont want to match '111'
    var info = d.info.toLowerCase()
    console.log(info)
    var infoItems = info.split('<br>')
    console.log(infoItems)
    var infoLstLength = infoItems.length
    var line
    for(var i = 0; i < infoLstLength; i++){
      var line = infoItems[i]
      //console.log(line)
      var lineLst = line.split(',')
      var lineLstLen = lineLst.length
      var word
      for(var j = 0;j < lineLstLen; j++){
        word = lineLst[j]
        //console.log(word)
        if(searchStr == word){return d3.rgb("#000")}
      }
    }
  }else {if(d.info.toLowerCase().search(searchStr.toLowerCase()) != -1) {
    return d3.rgb("#000");
  } else {
    return dClrsUsers[d.user];
  }}
}
