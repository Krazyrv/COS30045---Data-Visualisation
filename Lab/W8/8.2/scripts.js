var w = 600;
var h = 300;
var padding = 55;

//Set a range color for each patial
var color = d3.scaleQuantize()
            .range(['#ffffcc','#c2e699','#78c679','#31a354','#006837'])

//Specifying the projection and Set the Geometry of the Map
var projection = d3.geoMercator()
                    .center([145,-36.5])
                    .translate([w/2,h/2])
                    .scale(2450);

                    
var path = d3.geoPath()
            .projection(projection);

var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("fill", "grey");

//Read the data form CSV file
var data = d3.csv("VIC_LGA_unemployment.csv").then(function(data) {
    // console.log(data);
    color.domain([
        d3.min(data, function(d){   return d.unemployed; }),
        d3.max(data, function(d){   return d.unemployed; })
    ])
    return data;
});

//Read and Set the GeoJSON file to draw path
json = d3.json("LGA_VIC.json");
Promise.all([data, json]).then(function(values) {
    var data = values[0];
    var json = values[1];

    for (var i = 0; i <data.length; i++) {
        var dataState = data[i];
        for (var j = 0; j < json.features.length; j++) {

            var jsonState = json.features[j];
            if (jsonState.properties.LGA_name === dataState.LGA) {
                jsonState.properties.value = +dataState.unemployed
                break;
            }
        }
    }
    d3.csv("VIC_city.csv").then(function(cityData) {
        svg.selectAll("circle")
            .data(cityData)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function(d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", 4) // Circle radius
            .attr("fill", "red"); // Circle fill color
            
    });

    //Draw the geometry and set its color properties coresponding to the data
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d){
            var value = d.properties.value;
            // console.log("COLOR "+value);
            if (value) {
                // console.log(color(value));
                return color(value);
            } else {
                return "#364";
            }
        });
});

// Step 1: Create a line chart container
var lineChartContainer = d3.select("body")
    .append("div")
    .attr("class", "line-chart-container")
    .style("position", "absolute")
    .style("display", "none");

// Step 2: Define hover event handler function
function handleHover(d) {
    // Extract data for the hovered section (e.g., d.properties.value)
    var hoveredData = d.properties.value;
    
    // Update the line chart using the hovered data
    // For example:
    // drawLineChart(hoveredData);

    // Show the line chart container
    lineChartContainer.style("display", "block");
}

// Step 3: Attach hover event handler function to each section of the choropleth map
svg.selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", function(d) {
        var value = d.properties.value;
        return value ? color(value) : "#364";
    })
    .on("mouseover", handleHover)
    .on("mousemove", function() {
        // Update position of line chart container based on mouse position
        lineChartContainer.style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
        // Hide the line chart container when mouse leaves the section
        lineChartContainer.style("display", "none");
    });
