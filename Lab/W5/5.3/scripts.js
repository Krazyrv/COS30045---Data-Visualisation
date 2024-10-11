
   var w = 500;
    var h = 100;
    // padding = 35


    var dataset = [14,5,26,23,9,12,28,22,16,21,25];
    

    //xScale and yScale are for scaling the value of dataset to match with

     //the xScale in width for categorical values 
    var xScale = d3.scaleBand()
        .domain(d3.range(dataset.length))
        .rangeRound([0,w])
        .paddingInner(0.05);
    
    //the yScale in height for numerical values
    var yScale = d3.scaleLinear()
        .domain([0,d3.max(dataset, function (d){
            return d;   
        })])

        .rangeRound([ h , 0]);

    // Selecting the body to draw the chart
    var svg1 = d3.select("body")         
                .append("svg")          
                .attr("height",h)      
                .attr("width", w);      
                
    // Draw the bar chart with xScale width and yScale height
    svg1.selectAll("rect")              
        .data(dataset)                  
        .enter()                       
        .append("rect")
        .attr("x", function(d,i) {
            return xScale(i);
        })
        .attr("y", function(d,i) {
                return yScale(d);
            })
        .attr("width",xScale.bandwidth())
        .attr("height", function(d,i){
            return h-yScale(d);
        })
        .attr("fill", function(d){
            return "rgb(0,0, " + Math.round(d*10) + ")";
        });

        // Set the random value for update button
        d3.select("#update")
        .on("click", function(){
            alert("Button clicked");
            var transitionType = document.getElementById('transitionType').value;

            var numValues = dataset.length;
            var maxValues = 25;
            dataset = [];
            for (var i = 0 ; i < numValues; i++) {
                var newNumber = Math.floor(Math.random() * maxValues);
                dataset.push(newNumber);  
            }

            // Update the bars with new data
            svg1.selectAll("rect")          
            .data(dataset)         
            .transition()
            .duration(1000)
            .delay(function(d,i){
                return i/dataset.length*100;
                // return i*100
            })
            
            .attr("y", function(d,i) {
                    return yScale(d);
                })
            .attr("height", function(d,i){
                return h-yScale(d);
            })
            .attr("fill", function(d){
                return "rgb(0,0, " + Math.round(d*10) + ")";
            })
            .ease(d3[transitionType]);
        });

            d3.select("#add")
            .on("click", function(){
                // alert("Button Add clicked");

                var maxValues = 25;
                var newNumber = Math.floor(Math.random() * maxValues);
                dataset.push(newNumber);
                xScale.domain(d3.range(dataset.length));

                var bars = svg1.selectAll('rect')
                    .data(dataset);

                bars.enter()
                    .append("rect")
                    .attr("x", w)
                    .attr("y", function(d,i){
                        return h-yScale(d);    
                    })
                    
                    .merge(bars) // Merge the enter selection with the existing bars
                    .transition()
                    .duration(500)

                    .attr("x", function(d,i){
                        return xScale(i);
                    })
                    .attr("y", function(d,i){
                        return yScale(d);    
                    })
                    .attr("width", xScale.bandwidth())  
                    .attr("height", function(d){
                        return h - yScale(d);
                    })
                    .attr("fill", function(d){
                        return "rgb(0,0, " + Math.round(d*10) + ")";
                    });
            });


            d3.select("#remove")
            .on("click", function(){
                // alert("Button Remove clicked");
                dataset.shift();
                xScale.domain(d3.range(dataset.length))
                var bars = svg1.selectAll('rect')
                    .data(dataset);
                bars.exit()
                    .transition()
                    .duration(500)
                    .attr("x",w)
                    .remove();

                bars.transition()
                    .duration(500)
                    .attr('x',function(d,i){
                        return xScale(i)
                   })
                    .attr("width", xScale.bandwidth())  
                });

            


        