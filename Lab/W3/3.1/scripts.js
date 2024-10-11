var w = 700;
var h = 300;
var padding = 35;

var dataset = [
    [142,95,3],
    [262,33,4],
    [94,53,1],
    [282,43,2],
    [165,51,2],
    [96,10,5],
    [24,13,5],
    [304,23,4],
    [154,13,7],
    [321,93,5],
    [235,73,2],
    [600,200,5]
    ];

var xScale = d3.scaleLinear()
                .domain([d3.min(dataset, function (d) { 
                    return d[0];    //set lowest value of data to be scale at 0.0 ratio
                }),
                d3.max(dataset, function (d){
                    return d[0];    //set bighest value of data to be scale at 1.0 ratio
                })])
                .range([padding, w -  (padding + 40 )]);    //dataset scale on screen

var yScale = d3.scaleLinear()
                .domain([d3.min(dataset, function (d) {
                    return d[1];    //set lowest value of data to be scale as 0.0 ratio
                }),
                d3.max(dataset, function (d){
                    return d[1];    //set bighest value of data to be scale at 1.0 ratio
                })])
                .range([padding, h -padding]);  //dataset scale on screen

var svg = d3.select("body")         //Select the body of the document
            .append("svg")          //append the svg to the the element "body"
            .attr("height",h)       //svg's height
            .attr("width", w);      //svg's width

svg.selectAll("circle")               //select all rectangles
    .data(dataset)                  //count and prepare dataset
    .enter()                        //create the space holder for the dataset
    .append("circle")
    .attr("cx", function(d,i) {
        return xScale(d[0]);
    })
    .attr("cy", function(d,i) {
        return h - yScale(d[1]);
    })
    .attr("r", function(d) {
        return d[2]*2;   
    })
    .attr("fill", "slategray");
    ;

svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d){
        return d[0] + "," + d[1] +","+ d[2];
    })
    .attr("x", function(d){
        return xScale(d[0]+5);
    })
    .attr("y", function(d) {
        return h - yScale(d[1]+2);
    });