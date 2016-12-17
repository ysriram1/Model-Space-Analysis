// note uses userChecked from markUsers.js 

function refreshVis() {
  if (userdata != []) {

    OPTS = getOptions();
    clearTokenBox();//to clear infoBox First 
    //Opts for Line
    var shadeOptsL = document.getElementById("shadeOpts_L");
    var shadeStateL = shadeOptsL.options[shadeOptsL.selectedIndex].value;

    var widthOptsL = document.getElementById("widthOpts_L");
    var widthStateL = widthOptsL.options[widthOptsL.selectedIndex].value;
    //Opts for Dot
    var shadeOptsD = document.getElementById("shadeOpts_D");
    var shadeStateD = shadeOptsD.options[shadeOptsD.selectedIndex].value;

    var widthOptsD = document.getElementById("widthOpts_D");
    var widthStateD = widthOptsD.options[widthOptsD.selectedIndex].value;


    var lineChecked = document.getElementById('showLines').checked;
    var dotChecked = document.getElementById('showDots').checked;
    var groupChecked = document.getElementById('colorByGroup').checked;

    //show and remove legend
    var legendChecked = document.getElementById('legendShowYes').checked;

    OPTS.lineChecked = lineChecked;
    OPTS.dotChecked = dotChecked;
    OPTS.groupChecked = groupChecked;

    OPTS.lineColNoneChecked_s_l = shadeStateL == "none_s_l";
    OPTS.lineColMoveChecked_s_l = shadeStateL == "moveCount_s_l";

    OPTS.lineColNoneChecked_t_l = widthStateL == "none_t_l";
    OPTS.lineColMoveChecked_t_l = widthStateL == "moveCount_t_l";

    OPTS.dotColNoneChecked_s_d = shadeStateD == "none_s_d";
    OPTS.dotColAccChecked_s_d = shadeStateD == "accuracy_s_d";

    OPTS.dotRadNoneChecked_t_d = widthStateD == "none_t_d";
    OPTS.dotRadAccChecked_t_d = widthStateD == "accuracy_t_d";

    OPTS.showLegendYes = legendChecked;

    drawVis(userdata, "#VIS", 800, 800, OPTS);
  }
}

VisData = {}; // allow access to the data for thevis
var dClrsUsers = {};

function drawVis(userdata, anchorname, W, H, OPTS) {


    var dotdata = userDots(userdata);
    var linedata = userLines(userdata);
    VisData.dotdata = dotdata;
    VisData.linedata = linedata;

    var getX = function(d) {return d.x;},
        getY = function(d) {return d.y;},
        dotXs = dotdata.map(getX),
        dotYs = dotdata.map(getY);
    
    dUserGroup = {1:1,5:1,6:1,8:9,9:1,10:4,2:9,4:9,7:9,11:9}; //user 8 is PhD
    dUserGroupAltColors = {1:1, 5:2, 6:3, 8:11, 9:5, 10:6, 2:7, 4:8, 7:9, 11:10};

    if(!OPTS.groupChecked){
    var fClrsUsers = d3.scale.category20();
    dClrsUsers = mapColors(dotdata, fClrsUsers);

    d3.selectAll(".opt").selectAll(".userLegendBox").remove();

    for (var key in dUserGroup){
      var userNumber = ".u"+key;
      //var childText = "<div style='background:'"
      var selectNode = d3.selectAll(".opt").filter(userNumber)
  .insert("div", ":first-child").style("width", 140).style("clear", "both")
                .attr("class","userLegendBox")
                .append("div")
                .style("width","30")
                .style("height","14px")
                .style("float", "right")
                .style("padding-top", "2px")
                .style("border-radius","2px")
                .style("background",dClrsUsers[dUserGroupAltColors[key]]);

    }
    }

    if(OPTS.groupChecked){//if group is checked color selection process:
    
    var fClrsUsers = d3.scale.category20b();
    dClrsUsers = mapColors(dotdata, fClrsUsers);

    d3.selectAll(".opt").selectAll(".userLegendBox").remove();

     for (var key in dUserGroup){
      var userNumber = ".u"+key;
      var selectNode = d3.selectAll(".opt").filter(userNumber)
  .insert("div", ":first-child").style("width", 140).style("clear", "both")
                .attr("class","userLegendBox")
                .append("div")
                .style("width","30")
                .style("height","14px")
                .style("float", "right")
                .style("padding-top", "2px")
                .style("border-radius","2px")
                .style("background",dClrsUsers[dUserGroup[key]]);

    }

    }

    var xOffset = 10, yOffset = 10,
        dotDiam = 6, lineThick = 4;
    
    // functions from data space to vis space
    var fScaleX = d3.scale.linear()
                          .domain([Math.min.apply(null, dotXs),
                                   Math.max.apply(null, dotXs)])
                          .range([0, W-2*xOffset]);
    var fScaleY = d3.scale.linear()
                          .domain([Math.min.apply(null, dotYs),
                                   Math.max.apply(null, dotYs)])
                          .range([0, H-2*yOffset]);

    // functions combining data->vis space fcns with getX or getY
    var fGetScaledX = function(d){return fScaleX(getX(d)) + xOffset;},
        fGetScaledY = function(d){return fScaleY(getY(d)) + yOffset;}

    var divTooltip = d3.select("body").append("div")
                                      .attr("class", "tooltip")
                                      .style("opacity", 0)
                                      .style("position", "absolute")
                                      .style("width", "220px")
                                      .style("background-color", "#ee0")
                                      .style("pointer-events", "none")
                                      .style("padding","8px") //padding on the boxes
                                      .style("border-radius","10px");//rounded corners on the info boxes

    var svg = d3.select(anchorname)
     // svg group and .call are for zooming
      .call(d3.behavior.zoom()
	    .x(fScaleX)
            .y(fScaleY)
            .scaleExtent([1, 80])
            .on("zoom", fZoom));

    svg.append("rect") // background rect means zoom affects whole area
      .attr("width", W) // W:800px, H:800px
      .attr("height", H)
      .attr("fill", "transparent")

    // remove old dots and lines
    svg.selectAll(".dot").remove();
    svg.selectAll(".line").remove();
    svg.selectAll(".cross").remove();

    // filter data by users checked off
    dotdata = dotdata.filter( function(x){return userChecked(x.user);});
    linedata = linedata.filter( function(x){return userChecked(x.user);});
    
    // draw the lines
    var lineFunction = d3.svg.line()
       .x(function(d) { return fGetScaledX(d) ; })
       .y(function(d) { return fGetScaledY(d) ; })
       .interpolate("cardinal");
    var fTwoSegments = function(ld) { // turn one linedatum into 2 fTwoSegmentsnts
       return [ { x:ld.x1, y:ld.y1 },
                halfwayBump(ld, ld['backward']),
                { x:ld.x2, y:ld.y2 } ];
    };
    var lines = svg.selectAll(".line")
       .data(linedata)
       .enter().append("path")
       .attr("class", function(d){return "line user" + d.user;})
       .attr("stroke", function(d) {
	   if (d.customColor) { return d.customColor; }
           else {
	       if (OPTS.lineColNoneChecked_s_l) {
		   if (OPTS.groupChecked) { return dClrsUsers[dUserGroup[d.user]]; }
		   else { return dClrsUsers[dUserGroupAltColors[d.user]]; }
	       }
               if (OPTS.lineColMoveChecked_s_l) {
		   colVal = Math.round(255/90 * (80-d.count));
		   return d3.rgb(colVal,colVal,colVal);
	       }
               if (OPTS.groupChecked) { return dClrsUsers[dUserGroup[d.user]]; }
           } })
        // varying line width based on read count
	.attr("stroke-width", function(d){
            if(OPTS.lineColNoneChecked_t_l){return lineThick;}
            if(OPTS.lineColMoveChecked_t_l){return 2.5+d.count/8;}
        })
       .attr("marker-mid", "url(#inlineMarker)")
       .style("fill", "transparent")
       .on("click", function(d) { updateInfoBox(d.info);
                                  updateSharedTokens(d.info, 'line'); })
       .on("mouseover", function(d) {
              divTooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              divTooltip.html(d.info + "<br/>")
                     .style("left", (d3.event.pageX + 5) + "px")
                     .style("top", (d3.event.pageY - 28) + "px");
              divTooltip.style("background-color", dClrsUsers[dUserGroupAltColors[d.user]]);
	   })
       .on("mouseout", function(d) {
              divTooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
           })

    // remove lines with lineChecked is not checked.0
    if(!OPTS.lineChecked){svg.selectAll(".line").remove();}


    // draw dots
    var dots = svg.selectAll(".dot")
       .data(dotdata)
       .enter().append("circle")
       .attr("class", function(d){ str = d.info;
                                   DFNo = str.slice(17,19);
                                   return "dot user" + d.user +" DF"+ DFNo;
                                 })
       .attr("r", function(d){
           if (OPTS.dotRadNoneChecked_t_d) { return dotDiam; }
           // dynamic radius (lowest acc value was around 0.88)}
           if (OPTS.dotRadAccChecked_t_d) { return 31.5*Math.sqrt(d.acc-0.88);}
       })
      // .attr("cx", fGetScaledX)
      // .attr("cy", fGetScaledY)
      .style("fill", function(d) {
                   if (d.customColor) {
		         return d.customColor;
                   } else { 
                       if(OPTS.dotColNoneChecked_s_d) {
                           if(OPTS.groupChecked) { return dClrsUsers[dUserGroup[d.user]]; }
                           else { return dClrsUsers[dUserGroupAltColors[d.user]]; }
                       }
		       if (OPTS.dotColAccChecked_s_d) {
                           colVal = 255-Math.round(255*(d.acc-0.88)*8.5);
                           return d3.rgb(colVal, colVal, colVal);
                       }
		       if(OPTS.groupChecked){ return dClrsUsers[dUserGroup[d.user]]; }
                   } })  
       .on("click", function(d) { updateInfoBox(d.info);
                                  newDfInfo = d.info.slice(24,9999999) // to ignore "Top key words"
                                  updateSharedTokens(newDfInfo, 'dot'); 
                                  str = d.info; console.log(str);
                                  tempDFNo = str.slice(17,19);
                                  tempName = ".dot.user" + d.user+".df"+tempDFNo; console.log(tempName); //creating temp identifier
                                  svg.selectAll(tempName)
                                      .style('fill',d3.rgb('blue')); //Sriram:changes the color to blue upon click
                                    })
       .on("mouseover", function(d) {
               divTooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
               divTooltip.html("<b style='font-size:20px;'>User " + d.user + "</b>"+
 			      d.info)
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
               divTooltip.style("background-color", dClrsUsers[dUserGroupAltColors[d.user]]);
           })
       .on("mouseout", function(d) {
               divTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
           })
       .attr("transform", fTransform);

    if(!OPTS.dotChecked){svg.selectAll(".dot").remove();}//Sriram: added this to remove dots when dotChecked is not checked.

   // add a cross at the starting point
    // **** don't do this if no dotdata
    //   create a transform function for the origin (for zoom)
    var fOriginTransform = function() { 
       return "translate(" + fGetScaledX(dotdata[0]) + "," + fGetScaledY(dotdata[0]) + ")";
    };
    var cross1 = svg.append("line") // upper left to lower right
       .attr("class","cross")
       .attr("x1", -5)
       .attr("y1", -5)
       .attr("x2", 5)
       .attr("y2", 5)
       .style("stroke", d3.rgb(0,0,0))
       .style("stroke-width", 4)
       .attr("transform", fOriginTransform);
    var cross2 = svg.append("line") // upper left to lower right
       .attr("class","cross")
       .attr("x1", 5)
       .attr("y1", -5)
       .attr("x2", -5)
       .attr("y2", 5)
       .style("stroke", d3.rgb(0,0,0))
       .style("stroke-width", 4)   
       .attr("transform", fOriginTransform);
        
    // show a legend for line and dot width and grayscale values
    if(OPTS.showLegendYes){addLegend(svg, OPTS, W, H);}
    if(!OPTS.showLegendYes){svg.selectAll(".legend-box").remove();}

    fZoom(lines); // initial positioning calculation
  
    function fZoom() {
        dots.attr("transform", fTransform);
        //lines.attr("transform", fTransformLine);
        cross1.attr("transform", fOriginTransform);
        cross2.attr("transform", fOriginTransform);
        svg.selectAll(".line")
           .attr("d",  function(d){return lineFunction(fTwoSegments(d));});
    }


    function fTransform(d) {
      return "translate(" + fGetScaledX(d) + "," + fGetScaledY(d) + ")";
    }

    // add a legend describing the values associated with different line/dot
    // sizes and (grayscale) colors
    function addLegend(svg, OPTS, W, H) {
      var boxColor = d3.rgb(255, 255, 255);
      var borderColor = d3.rgb(0, 0, 0);
      var singleLegendWidth = 120;
      var singleLegendHeight = 100;  
      var edgeBuffer = 20;
      var currentRectLeftX = W - edgeBuffer - singleLegendWidth;
      var edgeOffset = 6;
      var midMargin = 4;
      var topMargin = 30;
      var halfHeight = (singleLegendHeight - topMargin)/ 2;
      var halfWidth = (singleLegendWidth - 2*edgeOffset)/2;
      var lineWidth = singleLegendWidth/2 - 2*edgeOffset - midMargin;
      
      // remove old legends
      svg.selectAll(".legend-box").remove();

      // for lines (shading)
      if (OPTS.lineColMoveChecked_s_l) {
          legendBox = drawbox();
          function lineShadeVal(x){return Math.round(255/90 * (80-x));}
          // formula for intensity: 255/90 * (80-d.count)
          // range is [2, 78] -> [221, 3]
          addLegendBoxTitle(legendBox, "Move Count-Shade");
          drawShadedSizedLine(legendBox, lineShadeVal(2), 12, true);
          addLegendValue(legendBox, 2, true);
          drawShadedSizedLine(legendBox, lineShadeVal(73), 12, false);
          addLegendValue(legendBox, 73, false);

          currentRectLeftX -= singleLegendWidth + 10;
      }
      // for lines (thickness)
      if (OPTS.lineColMoveChecked_t_l) {
          legendBox = drawbox();
          function lineThickVal(x){return 2.5+x/8;} 
          // formula for thickness: 2.5+d.count/8
          // range is [2, 78] -> [2.75, 12.25]
          addLegendBoxTitle(legendBox, "Move Count-Width");
          drawShadedSizedLine(legendBox, 130, lineThickVal(2), true);
          addLegendValue(legendBox, "2", true);
          drawShadedSizedLine(legendBox, 130, lineThickVal(73), false);
          addLegendValue(legendBox, "73", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }

      // for dots (shade)
      if (OPTS.dotColAccChecked_s_d) {
          legendBox = drawbox();

          // formula for intensity: 255-Math.round(255*(d.acc-0.895)*8.5)
          function dotIntensity(x) { return 255-Math.round(255*(x-0.88)*8.5); }
          // ? range is [0.85, 1.0] ?
          addLegendBoxTitle(legendBox, "Accuracy-Shade");
          drawShadedSizedDot(legendBox, dotIntensity(0.89), 6, true);
          addLegendValue(legendBox, "0.89", true);
          drawShadedSizedDot(legendBox, dotIntensity(0.975), 6, false);
          addLegendValue(legendBox, "0.98", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }
      // for dots (size)
      if (OPTS.dotRadAccChecked_t_d) {
          legendBox = drawbox();

          // formula for dot size: 31.5*Math.sqrt(d.acc-0.88)
          function dotSize(x) { return 31.5*Math.sqrt(x-0.88); }
          // ? range is [0.85, 1.0] ?
          addLegendBoxTitle(legendBox, "Accuracy-Size");
          drawShadedSizedDot(legendBox, 130, dotSize(0.89), true);
          addLegendValue(legendBox, "0.89", true);
          drawShadedSizedDot(legendBox, 130, dotSize(0.975), false);
          addLegendValue(legendBox, "0.98", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }
        
        function drawShadedSizedLine(drawBox, lineIntensity, lineThick, isTopLine) {
            var lineX = edgeOffset;
            var lineY = topMargin + halfHeight/2 - lineThick/2;
            if (!isTopLine) { lineY += halfHeight; }
            
            drawBox.append("rect")
                .attr("x", lineX)
                .attr("y", lineY)
                .attr("width", lineWidth)
                .attr("height", lineThick)
                .attr("fill", d3.rgb(lineIntensity, lineIntensity, lineIntensity));
        }

        function drawShadedSizedDot(drawBox, dotIntensity, radius, isTopDot) {
            var dotX = edgeOffset + lineWidth/2;
            var dotY = topMargin + halfHeight/2 - radius/2;
            if (!isTopDot) { dotY += halfHeight; }
            
            if (dotIntensity > 250) { // draw a halo if dot will be too light
              drawBox.append("circle")
                .attr("cx", dotX)
                .attr("cy", dotY)
                .attr("r", radius + 1)
                .attr("fill", d3.rgb(50, 50, 50));
            }

            drawBox.append("circle")
                .attr("cx", dotX)
                .attr("cy", dotY)
                .attr("r", radius)
                .attr("fill", d3.rgb(dotIntensity, dotIntensity, dotIntensity));
        }

        function addLegendValue(drawBox, txtValue, isTopLine) {
            var lineX = edgeOffset + 2*midMargin + halfWidth + halfWidth/2;
            var lineY = topMargin + halfHeight/2 - lineThick/2;
            if (!isTopLine) { lineY += halfHeight; }

            drawBox.append("text")
                   .attr("x", lineX)
                   .attr("y", lineY)
                   .attr("text-anchor", "middle")
                   .attr("dominant-baseline", "central")
                   .attr("font-family", "sans-serif")
                   .attr("font-size", "13px")
                   .attr("fill", "black")
                   .text(txtValue)
        }

        function addLegendBoxTitle(drawBox, title) {
            var lineX = edgeOffset + halfWidth;
            var lineY = topMargin/2;
            drawBox.append("text")
                   .attr("x", lineX)
                   .attr("y", lineY)
                   .attr("text-anchor", "middle")
                   .attr("dominant-baseline", "central")
                   .attr("font-family", "sans-serif")
                   .style('font-weight', 'bold')
                   .attr("font-size", "13px")
                   .attr("fill", "black")
                   .text(title)
        }

        function drawbox() {
            var transstr = "translate("+ currentRectLeftX +","+
                                      (H - singleLegendWidth - edgeBuffer)+")";
            var newBox = svg.append("g")
              .attr("class", "legend-box")
              .attr("transform", transstr)

            newBox.append("rect")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", singleLegendWidth)
              .attr("height", singleLegendHeight)
              .attr("fill", boxColor)
              .attr("stroke", borderColor)

            return newBox;
      }
    }
}


