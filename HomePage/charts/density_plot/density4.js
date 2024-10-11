const margin = { top: 30, right: 30, bottom: 40, left: 50 },
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

function density() {
    // d3.select("#plot-container").remove();
    // d3.select("#density-container").remove();
    // d3.select("#density-option").remove();
    // d3.select("#plot-option").remove();
    d3.select("#plot").remove();
    d3.select("#density").remove();
    
    
    createDensitySection();
    createDensityOption();
    // createDensityOptions("density-option"); // Assuming there is a container with id="densityOptionsContainer"
    let lastClickedCountry = null;  // Store the last clicked country
    let currentDataType = "Value";  // Store the current data type

    var container = d3.select('#density')
        .append("svg")
        .attr('id', 'density-container')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var svg = d3.select("#density-container")
        .html("")  // Clear any previous content
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    // var svg = d3.select("#density")
    //     .html("")  // Clear any previous content
    //     .append("svg")
    //     // .attr("width", width )
    //     // .attr("height", height + margin.top + margin.bottom)
    //     // .append("g")
    //     // .attr("transform", `translate(${margin.left},${margin.top})`);
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //     .append("g")
    //     .attr("transform", `translate(${margin.left},${margin.top})`);


    var x = d3.scaleLinear()
        .range([0, width + margin.left]);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var xAxis = svg.append("g")
        // .attr("transform", `translate(0, ${height-margin.top-margin.bottom})`);
        .attr("transform", `translate(0, ${height})`);

    var yAxis = svg.append("g");

    d3.csv("../HomePage/Processed_Data/Life_expectancy.csv").then(function (lifeData) {
        d3.csv("../HomePage/Processed_Data/GDP_processed.csv").then(function (gdpData) {
            d3.csv("../HomePage/Processed_Data/GDP_capita_processed.csv").then(function (gdpCapitaData) {
                
                var xAxisLabel = svg.append("text")
                    .attr("x", width / 2)
                    .attr("y", height + 30)
                    .style("text-anchor", "middle");
    
                var yAxisLabel = svg.append("text")
                    .attr("text-anchor", "end")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -margin.left + 15)
                    .attr("x", -margin.top - 80);

                var slider = document.getElementById('yearSlider');
                slider.addEventListener('input', function(event) {
                    let year = slider.value;
                    document.getElementById('leYear').innerHTML = year;
                    console.log(`${lastClickedCountry}  ${year} ${currentDataType}`)
                    updateChart(lastClickedCountry, year, currentDataType);
                });
                
                // Update chart when data type changes
                document.getElementById("dataType").addEventListener("change", function() {
                    const selectedYear = document.getElementById("yearSlider").value;
                    currentDataType = this.value; // Update current data type
                    updateChart(lastClickedCountry, selectedYear, currentDataType);
                });
                
                updateChart(lastClickedCountry, 2021, currentDataType);

                function updateChart(country, year, dataType) {
                    svg.selectAll("path").remove(); // Clear previous paths
                    svg.selectAll(".no-data").remove(); // Clear previous no data text

                    let filteredData = [];
                    if(dataType == "Value") {
                        filteredData = lifeData.filter(d => d.Year == year && (!country || d.Country_code == country)).map(d => +d.Value);
                    } else if(dataType == "GDP") {
                        filteredData = gdpData.filter(d => d.Year == year && (!country || d.Country_code == country)).map(d => +d.GDP);
                    } else {
                        filteredData = gdpCapitaData.filter(d => d.Year == year && (!country || d.Country_code == country)).map(d => +d.Value);
                    }

                    if (filteredData.length === 0) {
                        svg.append("text")
                            .attr("class", "no-data")
                            .attr("x", width / 2)
                            .attr("y", height / 2)
                            .attr("text-anchor", "middle")
                            .style("fill", "red")
                            .text("No data available");
                        return;
                    }

                    const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40));
                    const density = kde(filteredData);

                    let xDomain, xLabel, yDomain;
                    if (dataType === "Value") {
                        xDomain = [0, 100];
                        xLabel = "Life Expectancy (Years)";
                        yDomain = [0, 0.10];  
                    } else if (dataType === "GDP") {
                        xDomain = [0, d3.max(gdpData, d => d.GDP) + 100];
                        xLabel = "GDP";
                        yDomain = [0, 0.10];  
                    } else {
                        xDomain = [0, d3.max(gdpCapitaData, d => d.Value) + 100];
                        xLabel = "GDP per Capita";
                        yDomain = [0, 0.10]; 
                    }

                    x.domain(xDomain).nice();
                    y.domain(yDomain).nice();

                    xAxis.transition().duration(700).call(d3.axisBottom(x));
                    yAxis.transition().duration(700).call(d3.axisLeft(y));

                    xAxisLabel.text(xLabel);
                    yAxisLabel.text("Density");

                    svg.append("path")
                        .datum(density)
                        // .attr("fill", "#69b3a2")
                        .transition().duration(1000)
                        .attr("fill", "#3182bd")
                        .attr("opacity", ".8")
                        
                        .attr("stroke", "#000")
                        .attr("stroke-width", 1)
                        .attr("stroke-linejoin", "round")
                        .attr("d", d3.line()
                            .curve(d3.curveBasis)
                            .x(d => x(d[0]))
                            .y(d => y(d[1]))
                        );

                    const stats = computeStatistics(filteredData);
                    addStatistics(svg, stats, x);
                }

                updateChart(null, 2021, currentDataType);  // Initial chart with default year

                function computeStatistics(values) {
                    const mean = d3.mean(values);
                    const stddev = d3.deviation(values);
                    return { mean, stddev };
                }

                function addStatistics(svg, statistics, x) {
                    svg.selectAll(".statistics").remove(); // Remove old statistics elements

                    svg.append("line")
                        .attr("class", "statistics")
                        .attr("x1", x(statistics.mean))
                        .attr("x2", x(statistics.mean))
                        .attr("y1", y(0))
                        .attr("y2", y(0.1))
                        .attr("stroke", "red")
                        .attr("stroke-width", 2)
                        .attr("stroke-dasharray", "4");

                    svg.append("text")
                        .attr("class", "statistics")
                        .attr("x", x(statistics.mean))
                        .attr("y", y(0.1) - 10)
                        .attr("text-anchor", "middle")
                        .style("fill", "red")
                        .text(`Mean: ${statistics.mean.toFixed(2)}`);
                }

                function kernelDensityEstimator(kernel, X) {
                    return function (V) {
                        return X.map(function (x) {
                            return [x, d3.mean(V, function (v) { return kernel(x - v); })];
                        });
                    };
                }

                function kernelEpanechnikov(k) {
                    return function (v) {
                        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
                    };
                }

                document.addEventListener('countryClick', function(event) {
                    const { year, code, country } = event.detail;
                    lastClickedCountry = code;  // Update the last clicked country
                    document.getElementById('country').innerHTML = country;
                    updateChart(code, year, currentDataType);
                });

                

            });
        });
    });
}

function createDensitySection(){
    d3.select("#right-container")
        .append("div")  
        .attr("id", "density");
}

function createDensityOption() {
    var densityOptionDiv = d3.select("#density")  // Adjust the selector to the appropriate container
        .append("div")
        .attr("id", "density-option");

    // Append label for the select element
    densityOptionDiv.append("label")
        .attr("for", "dataType")
        .text("Select Data Type: ");

    // Append select element with options
    var selectElement = densityOptionDiv.append("select")
        .attr("id", "dataType");

    selectElement.append("option")
        .attr("value", "Value")
        .text("Life Expectancy");

    selectElement.append("option")
        .attr("value", "GDP")
        .text("GDP");

    selectElement.append("option")
        .attr("value", "GDP_Capita")
        .text("GDP per Capita");

    // Append h3 element with spans
    densityOptionDiv.append("text")
        .attr("x", (margin.width + margin.left + margin.right)/ 2)
        .attr("y", margin.top / 2)
        .style("opacity", 1)
        .style("text-anchor", "middle")
        .style("font-size", "20px") // Set the font size here
        .html('<br>Life Expectancy Density For <span id="country"></span> in <span id="leYear">2021</span>');
}


window.onload = density;
