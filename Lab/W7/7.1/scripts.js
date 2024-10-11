var w = 600;
var h = 300;
var padding = 55;

function init(){
    //Set the dataset for the chart with date
    var dataset
    d3.csv("Unemployment_78-95.csv", function(d){
        return {
            date: new Date(+d.year, d.month-1),
            number: +d.number
        };
    }).then(function(data){
        dataset = data;
        lineChart(dataset);
        console.table(dataset, ["date", "number"]);
});
}

function lineChart(dataset) {
    xScale = d3.scaleTime()         //Set the x scale for time series
        .domain([
            d3.min(dataset, function(d) { return d.date; }),
            d3.max(dataset, function(d) { return d.date; })
        ])
        .range([padding,w-padding]);

    yScale = d3.scaleLinear()       //Set the y scale for data value
        .domain([0, d3.max(dataset, function(d) { return d.number; })
        ])
        .range([h-padding,0]);
    
    var line = d3.line()            //Assign value for line
            .x(function(d){return xScale(d.date);})
            .y(function(d){return yScale(d.number);})

    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

            svg.append("path")
                .datum(dataset)
                .attr("class", "line")
                .attr("d", line);

    var xAxis = d3.axisBottom()     //Set tick and scale X-axis to match data
        .ticks(5)
        .scale(xScale);
    
    var yAxis = d3.axisLeft()       //Set tick and scale Y-axis to match data
        .ticks(5)
        .scale(yScale);

    svg.append("g")
        .attr("transform", "translate( 0 , "+(h - padding) +")")
        .call(xAxis);
    
    svg.append("g")
        .attr("transform", "translate(" + padding+ ",0)")
        .call(yAxis);
    
    svg.append("line")              //Set the baseline for half of the values
    .attr("class", "line half_milion")
    .attr("x1", padding)
    .attr("y1", yScale(500000))
    .attr("x2", w)
    .attr("y2", yScale(500000));

    svg.append("text")
        .attr("class", "halfMilLabel")
        .attr("x", padding+10)
        .attr("y", yScale(500000) - 7)
        .text("Half a million unemployed");
}
   
init();