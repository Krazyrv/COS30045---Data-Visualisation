// import from '../radar_chart/radar_chart.js';

function choropleth(){
    var cfg = {
        // w: 700,
        // h: 500,
        // padding: 50
        w: window.innerWidth*0.43,
        // h: window.innerHeight/1.4,
        h: (window.innerWidth*0.43)*0.7,
        h2: (window.innerHeight*0.72),
        win_h: window.screen.height,
        padding: window.innerWidth/13,
        fontSize: window.innerWidth*0.43/700
    };
    // console.log(window.innerHeight*0.72);
    // console.log(`Width: ${cfg.w}; Height: ${cfg.h}`);
    var color = d3.scaleQuantize()
                .range(['#eff3ff','#bdd7e7','#6baed6','#3182bd','#08519c'])
    var color_legend = d3.scaleQuantize()
                .range(['#969696','#eff3ff','#bdd7e7','#6baed6','#3182bd','#08519c'])

    var projection = d3.geoMercator()
                .center([0,55])
                // .center([0,cfg.padding-20])
                // .scale(cfg.w/10)
                // .scale(70)
                .translate([cfg.w/2,cfg.h/2])
                // .translate([350,h*0.6])
                // .scale(100);
                .scale(cfg.w/7);
                
    var path = d3.geoPath()
        .projection(projection);


    var container = d3.select('#choropleth')
        .append("svg")
        .attr('id', 'choropleth-container')
        // .attr("width", cfg.w+2*cfg.padding)
        // .attr("height", cfg.h+2*cfg.padding);
        .attr("width", cfg.w)
        .attr("height", cfg.h);

    // var svg;
    // svg = d3.select("#choropleth-container")
    //     .append("svg")
    //     .attr("id", "choropleth-svg")
    //     .attr("width", cfg.w)
    //     .attr("height", cfg.h)
    //     .attr("fill", "grey");
    var svg = container
        .append("svg")
        .attr("id", "choropleth-svg")
        .attr("transform", `translate(${cfg.padding}, ${cfg.padding})`)
        .attr("width", cfg.w)
        .attr("height", cfg.h);

    var legend = container.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (cfg.w/2) + "," + (cfg.h - cfg.padding/9) + ")");

    // var tooltip = d3.select("#choropleth-tooltip")
    var tooltip; 

    const slider = document.getElementById('yearSlider');
    const year = slider.value;
    slider.addEventListener('input', function(event) {

        let year = slider.value;
        get_data_from_year(year).then(function(data) {
            var dataset = [];
        
            for (var i = 0; i < data.length; i++) {
                dataset.push(data[i].Value);
            }

            Promise.all([data, json]).then(function(values) {
                var data = values[0];
                var json = values[1];
                for (var i = 0; i <data.length; i++) {
                    var dataState = data[i];
                    for (var j = 0; j < json.features.length; j++) {
                        var jsonState = json.features[j];
                        if (jsonState.id === dataState.Country_code) {
                            jsonState.properties.value = +dataState.Life_expectancy;
                            break;
                        }
                    }
                }
            svg.selectAll("path")
            .data(json.features)
            .transition()
            .duration(400)
            .delay(100)
            .style("fill", function(d){
                var value = d.properties.value;
                if (value) {
                    return color(value);
                } else {
                    return "#999";
                }
            });

            container.select("#title")
                .text(`Life Expectancy at birth of World Countries in ${year}`);

        });
    });
    });

    //Set a range color for each patial


    //Specifying the projection and Set the Geometry of the Map


    //Read the data form CSV file

    // var data = d3.csv("../HomePage/Processed_Data/GDP_processed.csv").then(function(data) {
    var data = d3.csv("../HomePage/Processed_Data/Life_expectancy.csv").then(function(data) {
        data_in_year = [];
        data_in_2021 = data.map(function(d){
            for (let i = 0; i < data.length; i++) {
                if (d.Year == 2021) {
                    return data_in_year.push(d);
                }
            }
        });
        color.domain([
            // d3.min(data_in_year, function(d){   return parseFloat(d.Value); }),
            // d3.max(data_in_year, function(d){   return parseFloat(d.Value); })
            0.0,
            100.0
        ])
        return data_in_year;
    });

    function get_data_from_year(year) {
        return d3.csv("../HomePage/Processed_Data/Life_expectancy.csv").then(function(data) {
            var data_in_year = data.filter(function(d) {
                return d.Year == year;
            });
            return data_in_year;
        });
    }


    //Read and Set the GeoJSON file to draw path
    json = d3.json("../HomePage/charts/choropleth/world.json");
    // json = d3.json("custom.geo.json");
    Promise.all([data, json]).then(function(values) {
        var data = values[0];
        var json = values[1];
        for (var i = 0; i <data.length; i++) {
            var dataState = data[i];
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j];
                if (jsonState.id === dataState.Country_code) {
                    jsonState.properties.value = +dataState.Life_expectancy;
                    break;
                }
            }
        }

        function handleMouseOver(event, d) {
            tooltip = d3.select("#choropleth")
            .append("div")
            .attr("class", "chart-tooltip");
            // .style("opacity", 0);
            var tooltipContent = `
            <div><strong>Country:</strong> ${d.properties.name}</div>
            <div><strong>Life Expectancy:</strong> ${d.properties.value} years</div><br>
            Click to see Life Expectancy distribution for ${d.properties.name}.`;
            d3.selectAll(".Country")
                .transition()
                .duration(200)
                .attr("fill","green")
                .style("opacity", 0.5);
            d3.select(this)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .style("stroke", "black");
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(tooltipContent)
                .style("left", (event.pageX ) + "px")
                // .style("top", (event.pageY - cfg.h/4+100) + "px");
                // .style("top", (event.pageY - cfg.h*1.8) + "px");
                .style("top", (`${event.pageY- cfg.h2*1.9}px`));
            // console.log(window.screen.height);

            
            // tooltip.transition()
            //     .duration(200)
            //     .style("opacity", 1);
            // tooltip.html(tooltipContent)
            //     .style("left", (event.pageX + 10) + "px")
            //     .style("top", (event.pageY - 28) + "px");
        };
        //Draw the geometry and set its color properties coresponding to the data
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function(d){
                var value = d.properties.value;
                if (value) {
                    return color(value);
                } else {
                    return "#999";
                }
            })

            .on("mouseover", handleMouseOver)
            .on("mouseleave", function(event,d) {
                d3.selectAll(".Country")
                    .transition()
                    .duration(200)
                    .style("opacity", 0.8);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("stroke", "transparent");
                tooltip.transition()
                    .duration(cfg.h)
                    .style("opacity", 10);
                d3.selectAll(".chart-tooltip").remove();
                // d3.selectAll('.radar_chart').remove();
            })
            .on('click', function(event, d) {
                let year = slider.value;
                let code = d.id;
                let country = d.properties.name

                sendCountryData(year, code, country);
                
            });
            // .on('click', function(event,d) {
            //     $.getScript("../radar_chart/radar_chart.js", function() {
            //         let year = slider.value;
            //         let country = d.id;
            //         console.log(year, country);
            //         radar_chart(year, country);      
            //     });
            // });
            ;
            
            // document.getElementById("choropleth").appendChild(svg.node());
    });
        //Title
        container.append("text")
        .attr("id","title")
        .attr("x", cfg.w / 2)
        .attr("y", cfg.padding / 2)
        .style("opacity", 1)
        .style("text-anchor", "middle")
        .style("font-size", `${1.3*cfg.fontSize}rem`) // Set the font size here
        .text(`Life Expectancy at birth of World Countries in ${year}`);
        
        legend.selectAll("rect")
        .data(color_legend.range().map(function(color) {
            return {
                color: color,
            };
        }))
        .enter()
        .append("rect")
        .attr("height", cfg.h/27)
        .attr("x", function(d, i) {
            return i * (cfg.w/13);
        })
        .attr("width", (cfg.w/13-2))
        .attr("fill", function(d) {
            return d.color;
        });
        legend.selectAll("text")
        .data(['No data','0-20','21-40','41-60','61-80','81-100'])
        .enter()
        .append("text")
        .attr("y", (-5))
        // .attr("y", (0))
        .attr("x", function(d, i) {
            return cfg.w/26+(cfg.w/13)*i;
        })
        // .attr("dy", ".1em")
        .style("font-size", `${0.75*cfg.fontSize}rem`)
        .style("text-anchor", "middle")
        .text(function(d) {
            return d;
        });
}

function sendCountryData(year, code, country) {

    document.dispatchEvent(new CustomEvent('countryClick', { detail: { year, code, country } }));
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = year;
    module.exports = slider;
}
window.onload = choropleth;


