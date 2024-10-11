var w = 300;
var h = 300;
var padding = 55;

//Dataset with stacked values
var dataset = [

    { apples: 5, oranges: 10, grapes: 22 },

    { apples: 4, oranges: 12, grapes: 28 },

    { apples: 2, oranges: 19, grapes: 32 },

    { apples: 7, oranges: 23, grapes: 35 },

    { apples: 23, oranges: 17, grapes: 43 }

    ];

//the xScale in width for categorial variables
var xScale = d3.scaleBand() 
    .domain(d3.range(dataset.length))
    .rangeRound([0,w])
    .paddingInner(0.05);
 
//the yScale in height for numerical values
var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, function(d){
        return d.apples + d.oranges + d.grapes;
        })
    ])
    .range([ h , 0]);

var stack = d3.stack()              //Create stack for each variable
            .keys(["apples", "oranges", "grapes"]);

var series = stack(dataset);        //Set value for stack

var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

var color = d3.scaleOrdinal(d3.schemeCategory10);   //Set color

var groups = svg.selectAll("g")             //Group and fill color in each group
                .data(series)
                .enter()
                .append("g")
                .style("fill", function(d,i){
                    return color(i);
                });

var rects = groups.selectAll("rect")            //Draw rectangles in stacked group
                .data(function(d){ return d;})
                .enter()
                .append("rect")
                .attr("x", function(d,i){
                    return xScale(i)
                })
                .attr("y", function(d,i){
                    return yScale(d[1]);
                })
                .attr("height", function(d){
                    return yScale(d[0]) - yScale(d[1]);   
                })
                .attr("width", xScale.bandwidth());


