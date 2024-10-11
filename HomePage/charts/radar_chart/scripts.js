// Assuming you have loaded the CSV file and stored the data in a variable named 'data'
d3.csv("../HomePage/Processed_Data/Health_workforce.csv").then(function(data) {
    // Extract years from the data
    var years = data.map(function(d) {
        return +d.Year; // Convert to number
    });
    // var minYear = 2000;
    var minYear = d3.min(years);
    var maxYear = 2021;
    // var maxYear = d3.max(years);

// 
    console.log("Min Year:", minYear);
    console.log("Max Year:", maxYear);

    // Now you can use minYear and maxYear as needed
    $(document).ready(function() {
        $('#yearSlider').on('input', function() {
            $('#out').text($(this).val());
            console.log("THIS IS VALUE " + $(this).val());
        });
    
        $('#yearSlider').attr('min', minYear);
        $('#yearSlider').attr('max', maxYear);
        $('#yearSlider').attr('value', maxYear);
    });

});

