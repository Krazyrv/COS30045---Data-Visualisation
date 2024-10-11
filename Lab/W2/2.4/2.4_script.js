    
var w = 500;
var h = 100;    

var svg = d3.select("body")         //Select the body of the document
        .append("svg")          //append the svg to the the element "body"
        .attr("height",h)       //svg's height
        .attr("width", w);      //svg's width

d3.csv("2.4_data.csv").then(function(data) {
    console.log(data);
    wombatSightings = data;
    barChart(wombatSightings);
});

function barChart(dataset){
    // data(dataset)                  //count and prepare dataset
    svg.selectAll("rect")               //select all rectangles
    .data(dataset)                  //count and prepare dataset
    .enter()                        //create the space holder for the dataset
    .append("rect")
    .attr("x", function(d,i) {
    return i *(w / dataset.length);
    })
    .attr("y", function(d) {
    return (h - d.wombats*4)})
    .attr("width", 20)
    .attr("height", function(d){
    return d.wombats*4;
    })
    .attr("fill", function(d){
    return "rgb(0,3, " + Math.round(d.wombats*10) + ")";
    });
}

