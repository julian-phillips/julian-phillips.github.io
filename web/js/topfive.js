function drawcharts(topfivedata)
{
    var titlepadding = 50
    var margin = {top:20, right: 15, bottom: 25, left: 15};
    var w = 1200 - margin.left - margin.right;
    var h = 400 - margin.top - margin.bottom - titlepadding;
    
    var chartpadding = 40;
    var NumCategories = topfivedata.length;
    var barPadding = 20;
    var hgt = (h - (4 * barPadding))/(NumCategories + 1);
    var wid = (1200 - NumCategories * (2 * margin.left + chartpadding))/NumCategories;

    // clear the canvas
    d3.select("#topfive").selectAll("*").remove();
    var svg = d3.select("#topfive")
	.append("svg")		   
	.attr("width", w + margin.left + margin.right)
	.attr("height", h + margin.top + margin.bottom + titlepadding)
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
            .range([0,wid]);
        
        //Left rectangle.  This is the horizontal bar that actually shows the metric			
        svg.selectAll()
	    .data(cdata.countries)
	    .enter()
	    .append("g")
	    .append("rect")				   
	    .attr("y", function(d,i) { return (hgt * i) + (barPadding * i);})
	    .attr("x", 0)
	    .attr("height", hgt)
	    .attr("width", function(d) {    return scale(d.value);})			   
	    .attr("fill","steelblue")					
	//.attr("id", function(d, i) { return i; })
	    .attr("class","datarect")
	    .attr("transform", "translate(" + ((wid+2*chartpadding)*(ndx)+margin.left) + "," + (margin.top+titlepadding) + ")");
        

        //Text Labels - countries
        svg.selectAll()
	    .data(cdata.countries)
	    .enter()			   
	    .append("text")
	    .text(function(d) { return d.name; })
	    .attr("y", function(d,i) { return (hgt * i) + (barPadding * i) - (barPadding * .1);})
	    .attr("x", 0)
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "12px")
	    .attr("text-anchor", "left")
	    .attr("class","yeartext")
	    .attr("transform", "translate(" + ((wid+2*chartpadding)*(ndx)+margin.left) + "," + (margin.top+titlepadding) + ")")

	//title
	var title = svg.append("text")
	    .text(cdata.category)
	    .attr("y", titlepadding/2)
	    .attr("x",((wid+2*chartpadding)*(ndx)+margin.left)+(wid+margin.left)/2)
	    .attr("class","title")
	    .attr("text-anchor","middle");
        
        
        //black border that surrounds entire visualization
        var outline = svg.append("rect")			   
	    .attr("y", 0)
	    .attr("class", "outline")
	    .attr("x",0 + (ndx * chartpadding))
	    .attr("width", wid + (2 * margin.left))
	    .attr("height", h + margin.top + margin.bottom + titlepadding)
	    .attr("stroke", "black")
	    .attr("stroke-width", 3)
	    .attr("fill", "none")
	    .attr("transform", "translate(" + ((wid + chartpadding) * ndx)+ ",0)");
        
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
