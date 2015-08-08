function drawcharts(topfivedata)
{
    var titlepadding = 45,
	    bottompadding = 5;
	var chartpadding = 10; //space between boxes of each top-5 category
	var barPadding = {y:20, x:20}; //y: vertical space between graph bars, x: offset from main box
	
	var width = 1400,
	    height = 350;
	// Margins for all bar-charts
    var margin = {top:20, right: 20, bottom: 20, left: 20};
    var w = width - margin.left - margin.right;
    var h = height - margin.top - margin.bottom - titlepadding - bottompadding;
	
    var NumCategories = topfivedata.length;
    var hgt = (h - (4 * barPadding.y))/(NumCategories + 1); // height of each bar
    
	var wid = (w - (NumCategories -1) * chartpadding)/NumCategories; // width of box
	var box_hgt = height - margin.top - margin.bottom ; // height of box

    // clear the canvas
    d3.select("#topfive").selectAll("*").remove();
    var svg = d3.select("#topfive")
		.append("svg")		   
		.attr("width", width)
		.attr("height", height)
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    for (var i = 0; i < topfivedata.length; i++)
    {
        chartdata = topfivedata[i];
        chart(chartdata, i);
    }
    
    function chart(cdata, ndx)
    {

        //create scale
        var scale = d3.scale.linear()
            .domain([0, cdata.maxvalue()])
            .range([0,wid - 2*barPadding.x]);
        
        //Left rectangle.  This is the horizontal bar that actually shows the metric			
        svg.selectAll()
	    .data(cdata.countries)
	    .enter()
	    .append("g")
	    .append("rect")				   
	    .attr("y", function(d,i) { return margin.top + (hgt * i) + (barPadding.y * i);})
	    .attr("x", barPadding.x)
	    .attr("height", hgt)
	    .attr("width", function(d) {    return scale(d.value);})			   
	    .attr("fill","steelblue")					
	//.attr("id", function(d, i) { return i; })
	    .attr("class","datarect")
	    .attr("transform", "translate(" + (margin.left + (wid + chartpadding)*(ndx)) + "," + (margin.top + titlepadding) + ")");
    

        //Text Labels - countries
        svg.selectAll()
	    .data(cdata.countries)
	    .enter()			   
	    .append("text")
	    .text(function(d) { return d.name; })
	    .attr("y", function(d,i) { return margin.top + (hgt * i) + (barPadding.y * i) - (barPadding.y * .2);})
	    .attr("x", barPadding.x)
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("text-anchor", "left")
	    .attr("class","yeartext")
	    .attr("transform", "translate(" + (margin.left + (wid + chartpadding)*(ndx)) + "," + (margin.top + titlepadding) + ")")

	// top-5 title
	var title = svg.append("text")
	    .text(cdata.category)
		.attr("class","title")
	    .attr("y", margin.top + titlepadding/2 +5)
	// Align in Center of Box
	//	.attr("x", margin.left + wid/2 + (ndx * (wid + chartpadding)))
	//    .attr("text-anchor","middle");
	// Align at the Left
		.attr("x", margin.left + barPadding.x + (ndx * (wid + chartpadding)))
	    .attr("text-anchor","left");
        
        
    // Border that surrounds each top-5 chart
    var outline = svg.append("rect")			   
	    .attr("y", margin.top)
	    .attr("class", "outline")
	    .attr("x", margin.left + (ndx * (wid + chartpadding)))
	    .attr("width", wid )
	    .attr("height", box_hgt )
	    .attr("stroke", "#D8D8D8 ")
	    .attr("stroke-width", 2)
	    .attr("fill", "none")
	    //.attr("transform", "translate(" + ((wid + chartpadding) * ndx)+ ",0)");
        
        /*
        //axis
        var xAxis = d3.svg.axis()
	.scale(scale)
	.orient("middle")
	.ticks(5);
        svg.append("g")
	.attr("class","axis")
	.attr("transform", "translate("+ ((wid+2*chartpadding)*(ndx)+margin.left) +"," + (h+margin.top+titlepadding+margin.bottom*.2)  + ")")
	.call(xAxis);
        */
    }
    
}
