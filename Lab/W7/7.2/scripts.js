var w = 300;
var h = 300;
var padding = 55;

var innerRadius = 0;
var outerRadius = w/2;

var dataset = [5,10,20,45,28,58,42];    //Set the value for pie chart

var arc = d3.arc()                      //Set the radius for inner and outer circles
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

var pie = d3.pie();

var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var arcs = svg.selectAll("g.arc")       //Set the curve part for pie chart
    .data(pie(dataset))
    .enter()
    .append("g")
    .attr("class", "arc")
    .attr("transform", "translate("+ outerRadius+ ", " + outerRadius +")");

var color = d3.scaleOrdinal(d3.schemeCategory10);   //Set color for pie chart

    arcs.append("path")                 //Draw pie and its color
        .attr("fill", function(d,i){
            return color(i);
        })
        .attr("d", function(d,i){
            return arc(d,i);
        });

    arcs.append("text")                 //Set value in text for each pie
        .text(function(d){
            return d.value;
        })
        .attr("transform",function(d){
            return "translate("+ arc.centroid(d) + ")";
        });



