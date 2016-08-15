// note uses userChecked from markUsers.js (coffee)

function refreshVis() {
  if (userdata != []) {
    OPTS = getOptions();
    drawVis(userdata, "#VIS", 800, 800, OPTS);
  }
}

VisData = {}; // allow access to the data for thevis
var dClrsUsers = {};

function drawVis(userdata, anchorname, W, H, OPTS) {
    //var bDrawLines = OPTS['DrawLines'];
    //var bDrawEndPoints = OPTS['DrawEndPoints'];
    //var bDrawDiamonds = OPTS['DrawDiamonds'];
    //var bDrawArrows = OPTS['DrawArrows'];
    var dotdata = userDots(userdata);
    var linedata = userLines(userdata);
    VisData.dotdata = dotdata;
    VisData.linedata = linedata;

    var getX = function(d) {return d.x;},
        getY = function(d) {return d.y;},
        dotXs = dotdata.map(getX),
        dotYs = dotdata.map(getY);

    var fClrsUsers = d3.scale.category20();
    dClrsUsers = mapColors(dotdata, fClrsUsers);
    //Sriram: We dont need the dotDiam or lineThickness since we are setting those values dynamically


    var xOffset = 10, yOffset = 10;
        //dotDiam = 5;// lineThick = 4;
    
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
                                      .style("width", "200px")
                                      .style("background-color", "#ee0")
                                      .style("pointer-events", "none");

    var svg = d3.select(anchorname)
      //.append("g") // svg group and .call are for zooming
      .call(d3.behavior.zoom()
	    .x(fScaleX)
            .y(fScaleY)
            .scaleExtent([1, 80])
            .on("zoom", fZoom));

    svg.append("rect") // background rect means zoom affects whole area
      .attr("width", W)
      .attr("height", H)
      .attr("fill", "transparent")

    // remove old dots and lines
    svg.selectAll(".dot").remove();
    svg.selectAll(".line").remove();

    // filter data by users checked off
    dotdata = dotdata.filter( function(x){return userChecked(x.user);});
    linedata = linedata.filter( function(x){return userChecked(x.user);});
    
    //var lineThick = linedata.x2

    // draw the lines
    var lineFunction = d3.svg.line()
       .x(function(d) { return fGetScaledX(d) ; })
       .y(function(d) { return fGetScaledY(d) ; })
       .interpolate("cardinal");
    var fTwoSegments = function(ld) { // turn one linedatum into 2 segments
       return [ { x:ld.x1, y:ld.y1 },
                halfwayBump(ld, ld['backward']),
                //{ x:ld.x1 + (ld.x2-ld.x1)/2, y:ld.y1 + (ld.y2-ld.y1)/2 },
                { x:ld.x2, y:ld.y2 } ];
    };
    var lines = svg.selectAll(".line")
       .data(linedata)
       .enter().append("path")
       .attr("class", function(d){return "line user" + d.user;})
      //.attr("d", function(d){return lineFunction(fTwoSegments(d));})
       .attr("stroke", function(d) {
	       if (d.customColor) {
		 return d.customColor;
               } else {
                 return dClrsUsers[d.user];
               } })
       .attr("stroke-width", function(d){
        return 2.5+d.count/7; //Sriram: dynamic width
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
              divTooltip.style("background-color", dClrsUsers[d.user]);
	   })
       .on("mouseout", function(d) {
              divTooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
           })

    // draw dots
    var dots = svg.selectAll(".dot")
       .data(dotdata)
       .enter().append("circle")
       .attr("class", function(d){return "dot user" + d.user;})
       .attr("r", function(d){
        if (d.acc < 0.9){return 5;
        }else {return 5 + 100*(d.acc-0.91)}; //Sriram: dynamic radius 
      })
      // .attr("cx", fGetScaledX)
      // .attr("cy", fGetScaledY)
      .style("fill", function(d) {
	               if (d.customColor) {
		         return d.customColor;
                       } else {
                         return dClrsUsers[d.user]; //{return d3.rgb("#777");}) 
                       } })  
       .on("click", function(d) { updateInfoBox(d.info);
                                  updateSharedTokens(d.info, 'dot'); })
       .on("mouseover", function(d) {
               divTooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
               divTooltip.html("<b>User " + d.user + "</b><br><br/>"+//Sriram: added additional line breaker and make user number bold
 			      d.info)
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
               divTooltip.style("background-color", dClrsUsers[d.user]);
           })
       .on("mouseout", function(d) {
               divTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
           })
       .attr("transform", fTransform);

     
    fZoom(lines); // initial positioning calculation
  
    function fZoom() {
        dots.attr("transform", fTransform);
        //lines.attr("transform", fTransformLine);
        svg.selectAll(".line")
           .attr("d",  function(d){return lineFunction(fTwoSegments(d));});
    }

    function fTransform(d) {
      return "translate(" + fGetScaledX(d) + "," + fGetScaledY(d) + ")";
    }

}
