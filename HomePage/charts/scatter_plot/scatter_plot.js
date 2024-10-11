function scatter_plot(){
    // d3.select("#plot-container").remove();
    // d3.select("#density-container").remove();
    // d3.select("#density-option").remove();
    // d3.select("#plot-option").remove();
    d3.select("#plot").remove();
    d3.select("#density").remove();

    var cfg = {
        // w: 600,
        // h: 300,
        // padding: 70,
        w: window.innerWidth*0.4,
        h: window.innerWidth*0.2,
        h2: (window.innerHeight*0.86),
        padding: window.innerWidth*0.04,
        radius: window.innerWidth*0.4*0.0066666,
        border: 1,
        fontSize: window.innerWidth*0.4/600 //rem
    };
    // console.log(`Width: ${cfg.w}; Height: ${cfg.h}`);
    var continentColor = d3.scaleOrdinal()
    .domain(["Asia", "Europe", "Americas", "Africa", "Oceania"])
    .range(d3.schemeSet1);

    createPlotSection();
    createPlotAxisOption();

    // Create SVG
    var container = d3.select('#plot')
        .append("svg")
        .attr('id', 'plot-container')
        .attr("width", cfg.w+2*cfg.padding)
        // .attr("height", cfg.h+1*cfg.padding);
        .attr("height", cfg.h);
        
    // container.append("div")
    //         .attr("id", "plot-option");
    

    var svg;

    // Create a tooltip div
    var tooltip;

    var population_scale = d3.scaleSqrt();

    
    
    // createPlotAxisOptions("plot-option");

    var xScale = d3.scaleLinear();
    var yScale = d3.scaleLinear();

    var x_option = document.getElementById('xAxis_option');
    var y_option = document.getElementById('yAxis_option');

    x_option.addEventListener('input', handleAxisChange);
    y_option.addEventListener('input', handleAxisChange);

    function handleAxisChange(update = false) {
        let x = x_option.value;
        let y = y_option.value;
        if (update == true){
            // updatePlot
            console.log("UPDATE");
        }
        else{
            return [x, y]; 
        }
    }

    
    
    d3.select("#yAxis_option").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update_option_axis(update_x = null, update_y = selectedOption)
    })
    d3.select("#xAxis_option").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update_option_axis(update_x = selectedOption, update_y = null)
    })


    draw_chart(x_update = null, y_update = null);

    var slider = document.getElementById('yearSlider');
    
    slider.addEventListener('input', function() {
        let year = slider.value;
        get_data_from_year(year).then(function(data){
            updatePlot(data,chart_year = year);
        });
    });
    

    function get_data_from_year(year){
        return Promise.all([
            d3.csv("../HomePage/Processed_Data/Life_expectancy.csv"),
            d3.csv("../HomePage/Processed_Data/GDP_processed.csv"),
            d3.csv("../HomePage/Processed_Data/country_continent.csv"),
            d3.csv("../HomePage/Processed_Data/Population.csv"),
            d3.csv("../HomePage/Processed_Data/Health_expenditure.csv")

        ]).then(function(data){
            var lifeExpectancyData = data[0];
            var gdpData = data[1];
            var continentData = data[2];
            var populationData = data[3];
            var healthExpenditureData = data[4];

            var lifeExpectancy_in_year = lifeExpectancyData.filter(d => d.Year === year);
            var gdp_in_year = gdpData.filter(d => d.Year === year);
            var population_in_year = populationData.filter(d => d.Year === year);
            var healthExpenditureData_in_year = healthExpenditureData.filter(d => d.Year === year);

            var mergedData = lifeExpectancy_in_year.map(d => {
                var gdpMatch = gdp_in_year.find(g => g.Country_code === d.Country_code);
                var continentMatch = continentData.find(c => c.Country_code === d.Country_code);
                var populationMatch = population_in_year.find(p => p.Country_code === d.Country_code);
                var healthExpenditureMatch = healthExpenditureData_in_year.find(p => p.Country_code === d.Country_code);
                return {
                    country: d.Country,
                    lifeExpectancy: +d.Life_expectancy,
                    gdp: gdpMatch ? +gdpMatch.GDP : null,
                    gdp_capita: gdpMatch ? +gdpMatch.GDP_capita : null,
                    continent: continentMatch ? continentMatch.Continent : null,
                    population: populationMatch ? populationMatch.Population : null,
                    health_expenditure_gdp_share: healthExpenditureMatch ? healthExpenditureMatch.health_expenditure_gdp_share : null,
                    health_expenditure: healthExpenditureMatch ? healthExpenditureMatch.health_expenditure : null,
                    health_expenditure_capita: healthExpenditureMatch ? healthExpenditureMatch.health_expenditure_capita : null,
                };
            }).filter(d => d.gdp_capita !== null);
            // Extract columns from the merged data
            var columns = Object.keys(mergedData[0]);
            mergedData.columns = columns; // Add columns to mergedData for easier access
            var filteredColumns = mergedData.columns.filter(function(column) {
                return column !== 'country' && column !== 'continent' && column !== 'population';
            });
            return mergedData;
        });
    }

    function updatePlot(data,chart_year) {
        var axis_option = handleAxisChange();
        xAxis_option = axis_option[0];
        yAxis_option = axis_option[1];
        var xAxisData = get_data_by_axis(data,xAxis_option);
        var yAxisData = get_data_by_axis(data,yAxis_option);

        xScale
            .domain([d3.min(xAxisData)-10, d3.max(xAxisData)+10])
            .range([0, cfg.w - cfg.padding*2]);
        yScale
            .domain([d3.min(yAxisData)-10 , d3.max(yAxisData)+10])
            .range([cfg.h - cfg.padding*2, 0]);     

        var xAxis = d3.axisBottom(xScale).ticks(7);
        var yAxis = d3.axisLeft(yScale).ticks(7);

        svg.select(".x-axis").transition().duration(300).call(xAxis);
        svg.select(".y-axis").transition().duration(300).call(yAxis);

        var circles = svg.selectAll("circle")
            .data(data);
        
        circles.enter()
            .append("circle")
            .merge(circles)
            .transition().duration(300)
            .attr("cx", d => xScale(d[xAxis_option]))
            .attr("cy", d => yScale(d[yAxis_option]))
            .attr("r", function(d) { return population_scale(d.population)})
            .attr("stroke", "black");

        circles.exit().remove();

        svg.select("#chart-year").remove();
        svg.append("text")
                .attr("x", cfg.w / 2)
                .attr("y", cfg.padding / 2)
                .attr("id", "chart-year")
                .style("text-anchor", "middle")
                .style("font-size", `${cfg.fontSize} px`) // Set the font size here
                .text(title_name(xAxis_option,yAxis_option,chart_year));
    }

    function axis_name(axis){
        if (axis == 'gdp') {
            return "GDP (Billions $US)";
        }
        else if (axis == 'gdp_capita'){
            return "GDP per Capita $US";
        }
        else if (axis == 'lifeExpectancy') {
            return "Life Expectancy (year)";
        }
        else if (axis == 'health_expenditure_gdp_share') {
            return "Health Expenditure of GDP Share";
        }
        else if (axis == 'health_expenditure') {
            return "Health Expenditure";
        }
        else if (axis == 'health_expenditure_capita') {
            return "Health Expenditure per Capita $US";
        }
        else {
            return "Axis";
        }
    }
    function title_name(xAxis, yAxis, year) {
        var title_x;
        var title_y;
        if (xAxis == 'gdp') {
            title_x = 'GDP in Billions in $US';
        }
        else if (xAxis == 'gdp_capita') {
            title_x = 'GDP per Capita';
        }
        else if (xAxis == 'lifeExpectancy') {
            title_x = 'Life Expectancy';
        }
        else if (xAxis == 'health_expenditure_gdp_share') {
            title_x = "Health Expenditure of GDP Share";
        }
        else if (xAxis == 'health_expenditure') {
            title_x = "Health Expenditure";
        }
        else if (xAxis == 'health_expenditure_capita') {
            title_x = "Health Expenditure per Capita $US";
        }


        if (yAxis == 'gdp') {
            title_y = 'GDP in Billions in $US';
        }
        else if (yAxis == 'gdp_capita') {
            title_y = 'GDP per Capita';
        }
        else if (yAxis == 'lifeExpectancy') {
            title_y = 'Life Expectancy';
        }
        else if (yAxis == 'health_expenditure_gdp_share') {
            title_y = "Health Expenditure of GDP Share";
        }
        else if (yAxis == 'health_expenditure') {
            title_y = "Health Expenditure";
        }
        else if (yAxis == 'health_expenditure_capita') {
            title_y = "Health Expenditure per Capita $US";
        }
        return `${title_x} - ${title_y} in ${year}`;
    }


    function replaceNull(data){
        if (data == null) 
            return `No Reported Data`;
        else {
            return data;
        }
    }
    function handleMouseOver(event, d) {

        tooltip = d3.select("#plot")
            .append("div")
            .attr("class", "chart-tooltip");
        var tooltipContent = d.lifeExpectancy && d.gdp_capita ? 
            
            `<div><strong>Country:</strong> ${replaceNull(d.country)}<br>
            <strong>Life Expectancy:</strong> ${replaceNull(d.lifeExpectancy)} years<br>
            <strong>GDP/Capita:</strong> ${replaceNull(d.gdp_capita)} $US<br>
            <strong>GDP:</strong> ${replaceNull(d.gdp)} Billions $US<br>
            <strong>Population:</strong> ${replaceNull(d.population)} people<br> 
            <strong>Health Expenditure GDP shared:</strong> ${replaceNull(d.health_expenditure_gdp_share)}% <br> 
            <strong>Health Expenditure:</strong> ${replaceNull(d.health_expenditure)} $US<br> 
            <strong>Health Expenditure per Capita:</strong> ${replaceNull(d.health_expenditure_capita)} $US<br> </div>


            <div style="font-size:60%"><strong>GDP</strong> & <strong>GDP/capita</strong> are conducted using <strong>Purchasing Power Parity (PPPs)</strong> in $US</div></div>` : 
            
            `<div><strong>Country:</strong> ${d.country}</div>`;

        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(tooltipContent)
            .style("left", (event.pageX + cfg.padding/5) + "px")
            // .style("top", (event.pageY - cfg.h*3+cfg.padding/2) + "px");
            .style("top", (`${event.pageY- cfg.h2*1.6}px`));
        d3.select(this)
            // .attr("r", cfg.radius + 2);
            .attr("r", function(d) { return population_scale(d.population)+2});
    }

    function handleMouseOut() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);

        d3.select(this)
            // .attr("r", cfg.radius);
            .attr("r", function(d) { return population_scale(d.population)});
        d3.selectAll(".chart-tooltip").remove();
    }


    function get_data_by_axis(data,axis){
        return data.map(function(d){
            if (axis == 'gdp_capita'){
                return d.gdp_capita;
            }
            if (axis == 'lifeExpectancy'){
                return d.lifeExpectancy;
            }
            if (axis == 'gdp'){
                return d.gdp;
            }
            if (axis == 'health_expenditure_gdp_share'){
                return d.health_expenditure_gdp_share;
            }
            if (axis == 'health_expenditure'){
                return d.health_expenditure;
            }
            if (axis == 'health_expenditure_capita'){
                return d.health_expenditure_capita;
            }
            return null;
        });
    }

    function filter_null_data(data, keys) {
        return data.filter(row => {
            return keys.every(key => row[key] !== null);
        });
    }

    function draw_chart(x_update, y_update, chart_year = "2021"){
        return get_data_from_year(chart_year).then(function(data){
            if (x_update == null && y_update == null){
                var axis_option = handleAxisChange();
                xAxis_option = axis_option[0];
                yAxis_option = axis_option[1];
                var xAxisData = get_data_by_axis(data,xAxis_option);
                var yAxisData = get_data_by_axis(data,yAxis_option);
            }
            else{
                xAxis_option = x_update;
                yAxis_option = y_update;
                var xAxisData = get_data_by_axis(data,xAxis_option);
                var yAxisData = get_data_by_axis(data,yAxis_option);
            }
            var mergedData = filter_null_data(data, [xAxis_option, yAxis_option]);
            console.log(xAxisData);
            population_scale = d3.scaleSqrt()
                .domain([d3.max(mergedData, d => d.population), d3.min(mergedData, d => d.population)])
                .range([ cfg.radius, cfg.radius*1.01]);
            xScale
                .domain([d3.min(xAxisData)-10, d3.max(xAxisData)+10])
                .range([0, cfg.w - cfg.padding*2]);
            yScale
                .domain([d3.min(yAxisData)-10 , d3.max(yAxisData)+10])
                .range([cfg.h - cfg.padding*2, 0]);    
                
            var xAxis = d3.axisBottom(xScale).ticks(7);
            var yAxis = d3.axisLeft(yScale).ticks(7);

            svg = container //d3.select('#plot-container')
                .append("svg")
                .attr('id', 'plot-svg')
                .attr("width", cfg.w)
                .attr("height", cfg.h);
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate("+cfg.padding+"," + (cfg.h - cfg.padding) + ")")
                .transition().duration(700)
                .call(xAxis);
            svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(" + cfg.padding + ","+cfg.padding+")")
                .transition().duration(700)
                .call(yAxis);
    
            var strokes = d3.select('#plot-svg')
                .append('svg')
                .attr('id','strokes-container')
                .attr("x", cfg.padding)
                .attr("y", cfg.padding)
                .attr("width", cfg.w-cfg.padding*2)
                .attr("height", cfg.h-cfg.padding*2);

            strokes.selectAll("circle").remove();
            // strokes.selectAll("circle")
            //     .data(mergedData)
            //     .enter()
            //     .append("circle")
            //     .attr("id", "stroke")
            //     .attr("class", function(d) { return "bubbles " + d.continent })
            //     .attr("cx", d => xScale(d[xAxis_option]))
            //     .attr("cy", d => yScale(d[yAxis_option]))
            //     // .transition().duration(1000)
            //     .attr("r", function(d) { return population_scale(d.population)})
            //     .style("fill", function (d) { return continentColor(d.continent); } )
            //     .attr("stroke", "black")
            //     .attr("border", 1)
            //     .on("mouseover", handleMouseOver)
            //     .on("mouseout", handleMouseOut);

            svg.append("text")
                .attr("x", cfg.w / 2)
                .attr("y", cfg.h - 10)
                .style("text-anchor", "middle")
                .style("font-size", `${1.1*cfg.fontSize}rem`)
                .text(axis_name(xAxis_option));
    
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -cfg.h / 2)
                .attr("y", cfg.padding*0.22)
                .style("text-anchor", "middle")
                .style("font-size", `${1.1*cfg.fontSize}rem`)
                .text(axis_name(yAxis_option));
    
            const zoom = d3.zoom()
                .scaleExtent([0.5, 32])
                .on("zoom", zoomed);
    
            container.call(zoom);

            function zoomed(event) {
                const transform = event.transform;
                const newXScale = transform.rescaleX(xScale);
                const newYScale = transform.rescaleY(yScale);
                
                var xAxis = d3.axisBottom(newXScale)
                var yAxis = d3.axisLeft(newYScale)
    
                svg.select(".x-axis").call(xAxis);
                svg.select(".y-axis").call(yAxis);
                svg.selectAll("circle")
                    .attr("cx", d => newXScale(d[xAxis_option]))
                    .attr("cy", d => newYScale(d[yAxis_option]));
            }
            // Title
            svg.append("text")
                .attr("x", cfg.w / 2)
                .attr("y", cfg.padding / 2)
                .attr("id", "chart-year")
                .style("text-anchor", "middle")
                .style("font-size", `${1.2*cfg.fontSize}rem`) // Set the font size here
                .text(title_name(xAxis_option,yAxis_option,chart_year));
    
            var highlight = function(event,d){
                // reduce opacity of all groups
                d3.selectAll(".bubbles")
                .style("opacity", .05)
                // expect the one that is hovered
                d3.selectAll("."+d)
                .style("opacity", 1)
                }
            
                // And when it is not hovered anymore
            var noHighlight = function(event,d){
                d3.selectAll(".bubbles")
                .style("opacity", 1)
                }
    
            var valuesToShow = [10000000, 100000000, 1000000000];
            
            container
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("circle")
                .attr("cx", cfg.w)
                .attr("cy", function(d){ return cfg.h *2/3  - population_scale(d) } )
                .attr("r", function(d){ return population_scale(d) })
                .style("fill", "none")
                .attr("stroke", "black");
            
            container
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("line")
                .attr('x1', function(d){ return cfg.w  + population_scale(d) } )
                .attr('x2', function(d,i) { return cfg.w + cfg.padding*0.5 + cfg.padding*0.3*i})
                .attr('y1', function(d){ return cfg.h *2/3  - population_scale(d) } )
                .attr('y2', function(d){ return cfg.h *2/3 - population_scale(d) } )
                .attr('stroke', 'black')
                .style('stroke-dasharray', ('2,2'));
    
            //Legend label
            container
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("text")
                .attr('x', function(d, i){return cfg.w + cfg.padding*0.5 + cfg.padding*0.3*i} )
                .attr('y', function(d){ return cfg.h*2/3- population_scale(d)} )
                .text( function(d){ return d/1000000 } )
                .style("font-size", `${0.7*cfg.fontSize}rem`)
                .attr('alignment-baseline', 'middle');
    
              // Legend title
            container.append("text")
                .attr('x', cfg.w+cfg.padding/2)
                .attr("y", cfg.h * 0.75)
                .style("font-size", `${0.9*cfg.fontSize}rem`)
                .text("Population (Millions)")
                .attr("text-anchor", "middle");
    
            var size = cfg.radius*5;
    
            var allgroups = ["Asia", "Europe", "Americas", "Africa", "Oceania"]
                container.selectAll("myrect")
                  .data(allgroups)
                  .enter()
                  .append("circle")
                    .attr("cx", cfg.w)
                    .attr("cy", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
                    .attr("r", 7)
                    .style("fill", function(d){ return continentColor(d)})
                    .on("mouseover", highlight)
                    .on("mouseleave", noHighlight)
    
                container.selectAll("mylabels")
                    .data(allgroups)
                    .enter()
                    .append("text")
                      .attr("x", cfg.w + size*0.8)
                      .attr("y", function(d,i){ return i * (size + 5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
                      .style("fill", function(d){ return continentColor(d)})
                      .style("font-size", `${cfg.fontSize}rem`)
                      .text(function(d){ return d})
                      .attr("text-anchor", "left")
                      .style("alignment-baseline", "middle")
                      .on("mouseover", highlight)
                      .on("mouseleave", noHighlight)

                strokes.selectAll("circle")
                    .data(mergedData)
                    .enter()
                    .append("circle")
                    .attr("id", "stroke")
                    .attr("class", function(d) { return "bubbles " + d.continent })
                    .attr("cx", d => xScale(d[xAxis_option]))
                    .attr("cy", d => yScale(d[yAxis_option]))
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut)
                    .transition().duration(700)
                    .attr("r", function(d) { return population_scale(d.population)})
                    .style("fill", function (d) { return continentColor(d.continent); } )
                    .attr("stroke", "black")
                    .attr("border", 1)
                    ;
        });
    }
    function update_option_axis(update_x, update_y){
        if (update_x == null){
            update_x = x_option.value;
        }    
        if (update_y == null){
            update_y = y_option.value;
        }
        d3.select("#plot-svg").remove();
        draw_chart(x_update = update_x, y_update = update_y);
    }
}


function createPlotAxisOption(){
    var plotOptionDiv = d3.select('#plot')
    .append("div")
    .attr("id", "plot-option");

    // Adding label and select elements to the plot-option div for X Axis
    plotOptionDiv.append("label")
        .attr("for", "xAxis_option")
        .text("X Axis Option: ");

    var xAxisSelect = plotOptionDiv.append("select")
        .attr("id", "xAxis_option")
        .attr("name", "xAxis_option");

    xAxisSelect.append("option")
        .attr("value", "gdp_capita")
        .text("GDP per Capita");

    xAxisSelect.append("option")
        .attr("value", "lifeExpectancy")
        .text("Life Expectancy");

    xAxisSelect.append("option")
        .attr("value", "gdp")
        .text("GDP");

    // xAxisSelect.append("option")
    //     .attr("value", "health_expenditure_capita")
    //     .text("Health Expenditure/Capita");

    // Adding some spacing between the X Axis and Y Axis options
    plotOptionDiv.append("span")
        .html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

    // Adding label and select elements to the plot-option div for Y Axis
    plotOptionDiv.append("label")
        .attr("for", "yAxis_option")
        .text("Y Axis Option: ");

    var yAxisSelect = plotOptionDiv.append("select")
        .attr("id", "yAxis_option")
        .attr("name", "yAxis_option");

    yAxisSelect.append("option")
        .attr("value", "lifeExpectancy")
        .text("Life Expectancy");

    yAxisSelect.append("option")
        .attr("value", "gdp_capita")
        .text("GDP per Capita");

    yAxisSelect.append("option")
        .attr("value", "gdp")
        .text("GDP");
    // yAxisSelect.append("option")
    //     .attr("value", "health_expenditure_capita")
    //     .text("Health Expenditure/Capita");
}


function createPlotSection(){
    d3.select("#right-container")
        .append("div")  
        .attr("id", "plot");
}





// // Create Axis option for Scatter plot chart
// function createPlotAxisOptions(containerId) {
//     // Create the main div element
//     const plotOptionDiv = document.createElement("div");
//     plotOptionDiv.setAttribute("id", "plot-option");

//     // Create label for X Axis Option
//     const xAxisLabel = document.createElement("label");
//     xAxisLabel.textContent = "X Axis Option";

//     // Create select element for X Axis Option
//     const xAxisSelect = document.createElement("select");
//     xAxisSelect.setAttribute("name", "xAxis_option");
//     xAxisSelect.setAttribute("id", "xAxis_option");

//     // X Axis options
//     const xAxisOptions = [
//         { value: "gdp_capita", text: "GDP per Capita" },
//         { value: "lifeExpectancy", text: "Life Expectancy" },
//         { value: "gdp", text: "GDP" }
//     ];

//     xAxisOptions.forEach(optionData => {
//         const option = document.createElement("option");
//         option.setAttribute("value", optionData.value);
//         option.textContent = optionData.text;
//         xAxisSelect.appendChild(option);
//     });

//     // Create label for Y Axis Option
//     const yAxisLabel = document.createElement("label");
//     yAxisLabel.innerHTML = "&nbsp&nbsp&nbsp&nbsp&nbsp Y Axis Option ";

//     // Create select element for Y Axis Option
//     const yAxisSelect = document.createElement("select");
//     yAxisSelect.setAttribute("name", "yAxis_option");
//     yAxisSelect.setAttribute("id", "yAxis_option");

//     // Y Axis options
//     const yAxisOptions = [
//         { value: "lifeExpectancy", text: "Life Expectancy" },
//         { value: "gdp_capita", text: "GDP per Capita" },
//         { value: "gdp", text: "GDP" }
//     ];

//     yAxisOptions.forEach(optionData => {
//         const option = document.createElement("option");
//         option.setAttribute("value", optionData.value);
//         option.textContent = optionData.text;
//         yAxisSelect.appendChild(option);
//     });

//     // Append elements to the main div
//     plotOptionDiv.appendChild(xAxisLabel);
//     plotOptionDiv.appendChild(xAxisSelect);
//     plotOptionDiv.appendChild(yAxisLabel);
//     plotOptionDiv.appendChild(yAxisSelect);

//     // Append the main div to the specified container
//     const container = document.getElementById(containerId);
//     container.appendChild(plotOptionDiv);
// }

