
// JavaScript source code	
var leftRect, yArray, heightArray, yearLabels, margin;
var NumElements = 7;
var centerIndex = 0;
var dataspace = 100;

var bar_color = "lightgrey",
    center_bar_color = "#ffc999",
	mask_color = "rgb(20,20,20)",
	hover_bar_color = "#ffa556",
	hover_mask_color = "#e5944d";
	
	
//////////////////////////////////////////////////////////////////////////////////////		 
// HELP FUNCTIONS

// Return current y position
function Summation(m) {
    total = 0;
       
    for (i = m; i >= 0; i--) { 
        if ( i === 0) {
            return total;
        } else {
            total += ElementReductions[i-1]*hgt + barPadding*PaddingReductions[i];  
        }                  
    }
}
     
// Generate list of reductions to be applied to the width of graph based on the number of elements
function GenerateElementList(m) {
    ElementList=[];
    half = (m-1)/2
    spread = .5/half
       
    for (i = 0; i < half ; i++) {    
        if ( i ===0) {
            ElementList.push(0.5);
        } else {
            ElementList.push(i*spread+0.5)
        }                  
    }
    ElementList.push(1.0)

    for (i = half-1; i > -1 ; i--) {    
        if ( i ===0) {
            ElementList.push(0.5);
        } else {
            ElementList.push(i*spread+0.5)    
        }                  
    }
    return ElementList;
}

// Generate list of reductions to be applied to the padding of graph based on number of elements
function GeneratePaddingList(m) {
    PaddingList=[0];
    half = (m-2)/2
    spread = 0.15/(half+1)
         
    for (i = 0; i <= half ; i++) {    
        if ( i ===half) {
            PaddingList.push(1.0);
        } else {
            PaddingList.push((i+1)*spread+0.5)
               
        }                  
    }
       
    for (i = half; i >= 0 ; i--) {    
        if ( i ===half) {
            PaddingList.push(1.0);
        } else {
            PaddingList.push((i+1)*spread+0.5)
             
        }                  
    }
    return PaddingList;
}

//////////////////////////////////////////////////////////////////////////////////////
     
function setCenterIndex(year) {
    centerIndex = year - minyear;
}

function getYearFromIndex(index) {
    return minyear + index;
}

function getTextY(i, downward) {

    //just enough Y value to move text below the bottom border
    yToHide = containerHeight * 2;

    //coord to make text disappear from the page
    var disappearY = yToHide;

    if (typeof downward != "undefined") {
        (downward) ? yToHide : -50;
    }

    relativeCoord = getRelativeCoord(i);
    if (relativeCoord == -1) {
        return disappearY;
    } else {
        return (Summation(getRelativeCoord(i)) + 
		        hgt / 2 * ElementReductions[getRelativeCoord(i)] + 
				barPadding * PaddingReductions[getRelativeCoord(i)] + margin.top) / ElementReductions[getRelativeCoord(i)];
    }
}

function getTextTransform(i) {
    scaleValue = .8333333;
    if (getRelativeCoord(i) != -1) {
        scaleValue = ElementReductions[getRelativeCoord(i)]
    }
    return "scale(1.0," + scaleValue + ")"

}

function getStrokeWidth(i){
    if (i == centerIndex) {
        return 2;
    }
    return 0;
}

function getRectFill(i) {
    if (i == centerIndex) {
        return center_bar_color;
    }
    return "url(#graygradient)";

}

function getRelativeCoord(trueIndex, customCenter) {
    if (typeof customCenter == "undefined") {
        customCenter = centerIndex;
        var distanceFromCenter = trueIndex - centerIndex;

        if (Math.abs(distanceFromCenter) > ((NumElements - 1) / 2)) { //outside the range, don't display
            return -1;
        } else {
            return distanceFromCenter + (NumElements - 1) / 2;
        }
    }
}

function getMaxValue(d) {
	if (d <10000) {
		return d3.round(d/100+1)*100;
	} else if (d <100000) {
		return d3.round(d/1000+0.5)*1000;
	} else if (d <1000000) {
		return d3.round(d/10000+0.5)*10000;
	} else {
		return d3.round(d/100000+0.5)*100000;
	}
}

var ElementReductions = [];
var hgt = 0;
var PaddingReductions = [];
var containerWidth = 200, 
    containerHeight = 200;
	
function drawwheel(wheeljson, input_width, input_height) // Get data and send it to drawing function
{
    var dataset =[];        
    var years =[];
    for (bar in wheeljson){
        dataset.push(wheeljson[bar].electricity);
        years.push(wheeljson[bar].year);
    }
	// Set container width and height to input width and height.
	containerWidth = input_width; 
    containerHeight = input_height;
    displaywheel(dataset, years);
}
	 
function getUnit() {
    if ($("#units").val() == "absolute")    
        return 'MkWh';
    else return "kWh";
}

function displaywheel(dataset, years)
{	

	var noDecimals = d3.format(",.0f"),    // zero decimal places
		oneDecimals = d3.format(",.1f"),    // zero decimal places
		twoDecimals = d3.format(",.2f"),    // zero decimal places
	    rounding = function(val) { 
			if (val < 100) {
				return val;
			} else if (val < 100000) {
				return Math.round(val/10)*10;
			} else if (val < 1000000) {
				return Math.round(val/100)*100;
			} else if (val < 10000000) {
				return Math.round(val/100)*100;
			} else if (val < 100000000) {
				return Math.round(val/100)*100;
			} else {
				return Math.round(val/1000)*1000;
			}},
        format = function(d) { return noDecimals(rounding(d)) + " " + getUnit(); };
	
    //This series of variables creates the array to be used to reduce elements later on.  
	//Because the number of elements can change how the svg is filled up, the height will vary.  
	// Algebra used to determine element total which will later feed the hgt variable to make sure the entire svg canvas is filled (except margins of course)
    ElementReductions = GenerateElementList(NumElements);
    var elementtotal = 0;
	
    for ( var i = 0; i < ElementReductions.length; i++ ){
        elementtotal += ElementReductions[i];
    }
       
    //Similar to the above but figures out how large the padding between the bars should be.
    var barPaddingsize = 2,
        NumPaddings = NumElements - 1,
        totalPadding = barPaddingsize*NumPaddings,
        paddingtotal = 0;
    
	PaddingReductions = GeneratePaddingList(NumPaddings);

    for ( var i = 0; i < PaddingReductions.length; i++ ){
        paddingtotal += PaddingReductions[i];
    }
	
    barPadding = totalPadding/paddingtotal;
 
    //margins around the graphic - ensures that text is not cut off
       
    //THERE SHOULD BE A WAY TO APPLY TO MARGIN TO ALL SVG ITEMS IN A CANVAS RATHER THAN ONE AT A TIME THE WAY IT IS NOW	
       
    margin = {top: 15, right: 0, bottom: 15, left: 0},
        w = containerWidth - margin.left - margin.right,
        h = containerHeight - margin.top - margin.bottom;
	var textOffset = {y: 0, x: 10}
	
    // Define the gradient
    hgt = (h - barPaddingsize*(ElementReductions.length-1))/elementtotal
	// Define the gradient
    yArray = new Array();
    heightArray = new Array();

    for (var q =0; q < ElementReductions.length; q++){
        heightArray.push(hgt * ElementReductions[q]);
        yArray.push(Summation(q)); 
    }
	
    var scale = d3.scale.linear()
                  .domain([0, d3.max(dataset, function(d) { return getMaxValue(d); })])
                  .range([0,w]);
       
    // Erase any pre-existing content
    d3.select("#wheel").selectAll("*").remove();
    //Create SVG element - Canvas
    var svg = d3.select("#wheel")
        .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
       
    // Rectangles.  One for each horizontal bar showing the value
    leftRect = svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("g")
            .append("rect")
            .attr("class","bleh")
            .attr("y", function (d, i) { return Summation(getRelativeCoord(i)); })
            .attr("x", 0)
            .attr("height", function (d, i) {
                if (getRelativeCoord(i) == -1) {
                    return 0;
                } else {
                    return hgt * ElementReductions[getRelativeCoord(i)];
                }
            })
            .attr("width", function(d ) { return scale(d);})			   
            .attr("fill", function (d, i) {
                return getRectFill(i);
            })
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("stroke-width", function (d,i)
            {
                return getStrokeWidth(i);
            })
            .attr("stroke", "black")
            .on("mouseover", function (d, i) {
                d3.select(this).attr("fill", "url(#hover_gradient)")
				.append("title")
			    .text(function(d) { return format(d); });
              //  d3.selectAll("#datatext" + i)//.selectAll("text").filter("class","yeartext")
               //     .attr("fill", "black");
            })
            .on("mouseout", function (d, i) {
                d3.select(this).attr("fill", function () {
                    return getRectFill(i);
                });
              //  d3.selectAll("#datatext" + i)//.selectAll("text").filter("class","yeartext")
               //     .attr("fill", "none");
            });		
  
    /*var drag = d3.behavior.drag()
         .origin(function (d) { return d; })
         .on("dragstart", dragstarted)
         .on("drag", dragged)
         .on("dragend", dragended);
         */
    
	//Text Labels   
    yearLabels = svg.selectAll("text")
		   .data(years)
		   .enter()			   
		   .append("text")			   
		   .text(function(d) { return d;})
		   .attr("y", function (d, i) { return getTextY(i); })
		   .attr("x", textOffset.x)
		   .attr("font-size", "14px")
		   .style("font-weight", "bold") 
		   .attr("text-anchor", "left")
		   .attr("transform", function (d, i) {
			   return getTextTransform(i);
		   });
		
    //Text Labels for data
  /*  svg.selectAll("datatext")
       .data(dataset)
       .enter()
       .text(function (d) { return format(d); })
       .attr("y", 13)
       .attr("x", w / 2)
       .attr("font-family", "sans-serif")
       .attr("font-size", "18px")
       .attr("fill", "none")
       .attr("text-anchor", "middle")
       .attr("id", function (d, i) { return 'datatext' + i; })
       .attr("class", "datatext")
    //.attr("transform", "translate(" + margin.left + "," + (margin.top + dataspace)+ ")")
    //.attr("transform", function(d,i) {return "scale(1.0," + new String(ElementReductions[i]) + ")"});
*/
    //////////////////////////////////////////////////////////////////////////////////////
    // GRADIENT AND MASK
	
    //gradient	
    var graygradient = svg.append("svg:defs")
              .append("svg:linearGradient")
              .attr("id", "graygradient")
              .attr("x1", "0%")
              .attr("y1", "0%")
              .attr("x2", "0%")
              .attr("y2", "100%")
              .attr("spreadMethod", "pad")
              .attr("gradientUnits","userSpaceOnUse")
    
	// Define the gradient colors
    graygradient.append("svg:stop")
                .attr("offset", "0%")
                .attr("stop-color", mask_color)
                .attr("stop-opacity", 0.6);

    graygradient.append("svg:stop")
        .attr("offset", "50%")
        .attr("stop-color", bar_color)
        .attr("stop-opacity", 0.6);
       
    graygradient.append("svg:stop")
        .attr("offset", "100%")
        .attr("stop-color", mask_color)
        .attr("stop-opacity", 0.6);
       

    var hover_gradient = svg.append("svg:defs")
             .append("svg:linearGradient")
             .attr("id", "hover_gradient")
             .attr("x1", "0%")
             .attr("y1", "0%")
             .attr("x2", "0%")
             .attr("y2", "100%")
             .attr("spreadMethod", "pad")
             .attr("gradientUnits", "userSpaceOnUse")
			 
    // Define the hover gradient colors
    hover_gradient.append("svg:stop")
               .attr("offset", "0%")
               .attr("stop-color", hover_mask_color)
               .attr("stop-opacity", 1);

    hover_gradient.append("svg:stop")
       .attr("offset", "50%")
       .attr("stop-color", hover_bar_color)
       .attr("stop-opacity", 1);

    hover_gradient.append("svg:stop")
       .attr("offset", "100%")
       .attr("stop-color", hover_mask_color)
       .attr("stop-opacity", 1);

    // Top-white rectangle to give impression that wheel is disappearing at the top
	svg.append("g")
		.append("rect")
		.attr("y", 0)
		.attr("x", -3)
		.attr("height", heightArray[NumElements-1]/2)
		.attr("width", w * 2)
		.attr("fill", "white")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Add Axis	- Place on top of top-white box
	var xAxis = d3.svg.axis()
		 .scale(scale)
		 .orient("top")
		 .ticks(5)
		 .tickSize(h);

    svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + margin.left + "," + (5 + h + margin.top) + ")")
		.call(xAxis);
		
    // Bottom-white rectangle to give impression that wheel is disappearing at the bottom
    svg.append("g")
	   .append("rect")
	   .attr("y", (heightArray[NumElements - 1] / 2) + yArray[NumElements - 1])
	   .attr("x", -3)
	   .attr("height", 75)
	   .attr("width",w*2)
	   .attr("fill", "white")
	   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	

}
//}

function turnToSelectedYear(year) {
    var currentYear = getYearFromIndex(centerIndex);

    if (currentYear == year) {
        return;
    } else if (currentYear > year) {
        while (getYearFromIndex(centerIndex) != year) {
            turnWheel(true);
        }
    } else if (currentYear < year) {
        while (getYearFromIndex(centerIndex) != year) {
            turnWheel(false);
        }
    }
}


function turnWheel(downward) {
       
    if (getYearFromIndex(centerIndex) == minyear) {
			if (downward) { 
				return;
			} else {
			centerIndex++;
			}
	} else if (getYearFromIndex(centerIndex) == maxyear) {
			if (!downward) {
				return;
			} else {
			centerIndex--;
			}
    } else if (downward) {
        centerIndex--;
    } else {
        centerIndex++;
    }

    //document.getElementById("year").value = getYearFromIndex(centerIndex);
    $('#year').selectpicker('val', getYearFromIndex(centerIndex));
	updateSST();

    leftRect.each(function (d, i) {
           
        d3.select(this)
        .transition()
        .attr("y", function () {
            if (getRelativeCoord(i) == -1) {
                return (downward) ? containerHeight * 2 : -50;
            } else {
                return Summation(getRelativeCoord(i));
            }
        })
        .attr("height", function () {
            //next level reached 
            if (getRelativeCoord(i) == -1) {
                return 0;
            } else {
                return hgt * ElementReductions[getRelativeCoord(i)];
            }
        })
        .attr("stroke-width", function () {return getStrokeWidth(i); })
        .attr("fill", function () { return getRectFill(i);})
    })

    yearLabels.each(function (d, i) {
             
        d3.select(this)
        .transition()
        .attr("y", function () { return getTextY(i, downward);})
        .attr("transform", function () { return getTextTransform(i); });
    })
}


function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    //d3.select(this).classed("dragging", true);
}

function dragged(d) {

    //d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);

}

function dragended(d) {
    d3.select(this).classed("dragging", false);
}
