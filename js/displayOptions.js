//These functions directly relate to the display options in the page

function displayOptions(visSVGName){

	var svg = d3.select(visSVGName);

	var lineChecked = document.getElementById('showLines').checked;
	var dotChecked = document.getElementById('showDots').checked;
	var grayScaleChecked = document.getElementById('grayScale').checked;
	
	svg.selectAll(".dot").remove();
    svg.selectAll(".line").remove();

	if(lineChecked & dotChecked){refreshVis();
		if(grayScaleChecked){
			svg.selectAll(".dot")
			.style('fill',function(d){return grayScaleSelect(d);})
		}else if(!grayScale){
			refreshVis();
		}
	}

	if(lineChecked & !dotChecked){
		refreshVis();
		svg.selectAll(".dot").remove();
		if(grayScaleChecked){
			svg.selectAll(".dot")
			.style('fill',function(d){return grayScaleSelect(d);})
		}else if(!grayScale){
			refreshVis();
			svg.selectAll(".dot").remove();
		}
	}
	if(!lineChecked & dotChecked){
		refreshVis();
		svg.selectAll(".line").remove();
		if(grayScaleChecked){
		svg.selectAll(".dot")
		.style('fill',function(d){return grayScaleSelect(d);})
		}else if(!grayScale){
			refreshVis();
			svg.selectAll(".line").remove();
		}
	}
}

function grayScaleSelect(d){
	var accVal = d.acc;
	//var x = d3.scaleLinear()
    //.domain([0.88, 0.99])
    //.range([0,9]); //creating a linear score for the accuracy vals
    //accVal
    var colorVal = (9-Math.round(accVal-0.88));
    var colorStr = '#'+ colorVal + colorVal+ colorVal;
    console.log(colorStr)
	return d3.rgb(colorStr);
}