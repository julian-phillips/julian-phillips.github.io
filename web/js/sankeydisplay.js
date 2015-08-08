function displaysankey(graph, elementid, orientation)
{
    var units = "MkWh";

    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    if (orientation == 'left') {
		margin.right = 0;
	} else {
		margin.left = 0;
	}
	var width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var formatNumber = d3.format(",.0f"),    // zero decimal places
        format = function(d) { return formatNumber(d) + " " + units; },
        color = d3.scale.category20();

    // clear the canvas
    d3.select(elementid).selectAll("*").remove();
    // append the svg canvas to the page
    var svg = d3.select(elementid).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    // Set the sankey diagram properties
    var sankey = null;
    if (orientation == 'left')
    {
        sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(15)
            .size([width, height])
            .scaleRight(true)
            .rightHeight(100)
            .leftHeight(height);
    }
    else
    {
        sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(15)
            .size([width, height])
	    .scaleLeft(true)
	    .rightHeight(height)
	    .leftHeight(100);
    }

    var path = sankey.link();

    var nodeMap = {};
    graph.nodes.forEach(function(x) { nodeMap[x.name] = x; });
    graph.links = graph.links.map(function(x) {
        return {
            source: nodeMap[x.source],
            target: nodeMap[x.target],
            value: x.value
        };
    });

    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(0);

    // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .sort(function(a, b) { return b.dy - a.dy; });

    // add the link titles
    link.append("title")
        .text(function(d) {
            return d.source.name + " → " + 
                d.target.name + "\n" + format(d.value); });


    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; });

    function filterfunc(d)
    {
        if (orientation == 'left')
        {
            return !(d.right_ghost == 1);
        }
        else
        {
            return !(d.left_ghost == 1);
        }
    }
    
    // add the rectangles for the nodes
    node.append("rect")
        .filter(function(d) { return filterfunc(d); })   // Don't add text if it is a base node
        .attr("height", function(d) { return Math.max(0, d.dy); })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { 
            return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { 
            return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) { 
            return d.name + "\n" + format(d.value); });

    // add in the title for the nodes
    node.append("text")
        .filter(function(d) { return filterfunc(d); })   // Don't add text if it is a base node
        .attr("x", (orientation == 'left') ? 6 + sankey.nodeWidth() : -6)
        .attr("text-anchor", (orientation == 'left') ? "start" : "end")
        .attr("y", function(d) { return d.dy /5; })
        .attr("dy", ".35em")
        .attr("transform", null)
        .text(function(d) { return d.name; });
}
