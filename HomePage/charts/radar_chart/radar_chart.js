

function radar_chart(yea,_country,remove =false) {
    const year = yea.toString();
    const country = _country;
    // const slider = document.getElementById('yearSlider');
    // const year = slider.value;
    // console.log(year);
    // slider.addEventListener('click', function(event) {
        
    //     console.log(slider.value);
    //     let year = slider.value;

    //     var data_filter = dataFilter(year,'AUS');
    //     var data_max = dataMax();
    //     Promise.all([data_filter, data_max]).then(function(values){
    //         var transformedData = values[0];
    //         var maxValue = values[1];
    //         console.log(maxValue);
    //         console.log(transformedData);
    //     });
    // });




    var cfg = {
        w: 700,
        h: 500,
        margin: { top: 70, right: 1020, bottom: 20, left: 20 }, //The margins of the SVG
        levels: 7,               //How many levels or inner circles should there be drawn
        maxValue: 0,             //What is the value that the biggest circle will represent
        labelFactor: 1.15,       //How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60,           //The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35,       //The opacity of the area of the blob
        dotRadius: 4,            //The size of the colored circles of each blog
        opacityCircles: 0.1,     //The opacity of the circles of each blob
        strokeWidth: 2,          //The width of the stroke around each blob
        roundStrokes: false,     //If true the area and stroke will follow a round path (cardinal-closed)
        color: d3.scaleOrdinal(d3.schemeCategory10)
    };

    const data = d3.csv("../HomePage/Processed_Data/Health_workforce.csv");
    var data_max = data.then(function(data){
        return d3.max(data, function(d) {
            var maxPropertyValue = -Infinity; // Initialize with the smallest possible number
        
            // Iterate over the properties of the data object
            for (var key in d) {
                // Skip non-numeric properties and keys that are not needed
                if (key !== 'Country_code' && key !== 'Country' && key !== 'Year') {
                    var propertyValue = parseFloat(d[key]); // Convert property value to a number
        
                    // Update maxPropertyValue if the current propertyValue is greater
                    if (!isNaN(propertyValue) && propertyValue > maxPropertyValue) {
                        maxPropertyValue = propertyValue;
                    }
                }
            }
            // Return the maximum value found in this data object
            return maxPropertyValue;
        });
    });

    function dataMax(){  
        return data.then(function(data){
            return d3.max(data, function(d) {
                var maxPropertyValue = -Infinity; // Initialize with the smallest possible number
            
                // Iterate over the properties of the data object
                for (var key in d) {
                    // Skip non-numeric properties and keys that are not needed
                    if (key !== 'Country_code' && key !== 'Country' && key !== 'Year') {
                        var propertyValue = parseFloat(d[key]); // Convert property value to a number
            
                        // Update maxPropertyValue if the current propertyValue is greater
                        if (!isNaN(propertyValue) && propertyValue > maxPropertyValue) {
                            maxPropertyValue = propertyValue;
                        }
                    }
                }
                // Return the maximum value found in this data object
                return maxPropertyValue;
            });
        });
    }
    
    function dataFilter(year,country){
        return data.then(function(data) {
            var transformedData = [];
            var data_in_cou_year = data.find(function(d) {
                return d.Year === year && d.Country_code === country;
            });
    
            // Get the column names
            var columns = Object.keys(data_in_cou_year);
    
            columns.forEach(function(col) {
                // Skip non-numeric columns
                if (col !== 'Country_code' && col !== 'Country' && col !== 'Year') {
                    var axis = col;
                    var value = parseFloat(data_in_cou_year[col]);
                    var obj = { axis: axis, value: value };
                    transformedData.push(obj);
                }
            });
    
            return transformedData;
        });
    }
    
    var data_filter = data.then(function(data) {
        var transformedData = [];
        var data_in_cou_year = data.find(function(d) {
            return d.Year === year && d.Country_code === country;
        });

        // Get the column names
        
        var columns = Object.keys(data_in_cou_year);
        columns.forEach(function(col) {
            // Skip non-numeric columns
            if (col !== 'Country_code' && col !== 'Country' && col !== 'Year') {
                var axis = col;
                var value = parseFloat(data_in_cou_year[col]);
                var obj = { axis: axis, value: value };
                transformedData.push(obj);
            }
        });

        return transformedData;
    });
    Promise.all([data_filter, data_max]).then(function(values){
        var transformedData = values[0];
        var maxValue = values[1];

        var allAxis = transformedData.map(function (d) { return d.axis; }),
            total = allAxis.length,
            radius = Math.min(cfg.w / 2-50, cfg.h / 2-50),
            angleSlice = Math.PI * 2 / total;

        //Scale the maximum data value to the chart
        var rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, maxValue]);

        //Size of the chart to the pre-configuration
        var svg = d3.select('#radar-chart')
            .append('svg')
            .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
            .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
            .attr("class", "radar");

        var g = svg.append('g')
            .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

        //Draw each Grid circle
        var axisGrid = g.append("g").attr("class", "axisWrapper");
        axisGrid.selectAll(".levels")
            .data(d3.range(1, (cfg.levels + 1)))
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function (d, i) { return radius / cfg.levels * d; })
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", cfg.opacityCircles);

        //Position of the scale text
        axisGrid.selectAll(".axisLabel")
            .data(d3.range(1, (cfg.levels + 1)))
            .enter()
            .append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function (d) { 
                return -d * radius / cfg.levels; 
            })
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "#737373")
            .text(function (d, i) { 
                return (maxValue * d / cfg.levels).toFixed(2); 
            });

        var axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");

        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function (d, i) { 
                return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2); 
            })
            .attr("y2", function (d, i) { 
                return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2); 
            })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function (d, i) { 
                return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); 
            })
            .attr("y", function (d, i) { 
                return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); 
            })
            .text(function (d) { return d; })
            .call(wrap, cfg.wrapWidth);

        var radarLine = d3.lineRadial()
            // .interpolate("linear-closed")
            .curve(d3.curveLinearClosed)
            .radius(function (d) { 
                return rScale(d.value); 
            })
            .angle(function (d, i) { 
                return i * angleSlice; 
            });

        if (cfg.roundStrokes) {
            radarLine.interpolate("cardinal-closed");
        }

        var blobWrapper = g.selectAll(".radarWrapper")
            .data([transformedData])
            .enter().append("g")
            .attr("class", "radarWrapper");

        blobWrapper.append("path")
            .attr("class", "radarArea")
            .attr("d", function (d) { 
                return radarLine(d); 
            })
            .style("fill", function (d, i) { 
                return cfg.color(i); 
            })
            .style("fill-opacity", cfg.opacityArea);

        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", function (d) { 
                return radarLine(d); 
            })
            .style("stroke-width", cfg.strokeWidth + "px")
            .style("stroke", function (d, i) { 
                return cfg.color(i); 
            })
            .style("fill", "none");

        blobWrapper.selectAll(".radarCircle")
            .data(transformedData)
            .enter()
            .append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius)
            .attr("cx", function (d, i) { 
                return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); 
            })
            .attr("cy", function (d, i) { 
                return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); 
            })
            .style("fill", function (d, i, j) { 
                return cfg.color(j); 
            });

        var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
            .data([transformedData])
            .enter().append("g")
            .attr("class", "radarCircleWrapper");

        blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data(transformedData)
            .enter()
            .append("circle")
            .attr("class", "radarInvisibleCircle")
            .attr("r", cfg.dotRadius * 1.5)
            .attr("cx", function (d, i) { 
                return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); 
            })
            .attr("cy", function (d, i) { 
                return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); 
            })
            .style("fill", "none")
            .style("pointer-events", "all");

        var tooltip = g.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);

        blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .on("mouseover", function (d, i) {
                var newX = parseFloat(d3.select(this).attr('cx')) - 10;
                var newY = parseFloat(d3.select(this).attr('cy')) - 10;
                
                tooltip.attr('x', newX)
                    .attr('y', newY)
                    .text(d.value)
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseout", function () {
                tooltip
                .transition()
                .duration(200)
                    .style("opacity", 0);
            });

        //Wraps SVG text	
        function wrap(text, width) {
            text.each(function () {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1,
                    y = text.attr("y"),
                    x = text.attr("x"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
            });
        }
        // var elementExists = document.getElementById(".radar-chart");
        // if(document.body.contains(".radar-chart")){
        //     console.log("TRUE");
        // }
        // // console.log(elementExists);
        // // if ()
        // if (remove = true){
        //     // d3.selectAll('#radar-chart').remove();
        //     console.log("remove");
        // }
    });
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = radar_chart;
}
// window.onload = radar_chart('2020','AUS');
