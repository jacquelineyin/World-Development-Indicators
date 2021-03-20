// Initialize constants and global variables
const indicators = new Indicators();

let barChart, lineChart;

//TODO: get rid of this after we implement for all selectable items:
let selected = { area: "world", comparisonAreas: [], indicator: indicators.GDP_PER_CAPITA}

/**
 * Load data from CSV file asynchronously and render charts
 */
 d3.csv('data/Dataset.csv').then(data => {
    // Filter all irrelevant data
    let indicatorsOfInterest = indicators.getAllIndicatorsOfInterest();
    data = data.filter(d => indicatorsOfInterest.includes(d.IndicatorName));

    data.forEach(d => {
        /* TODO */
    });  

    //Initialize views
    barChart = new BarChart({
      parentElement: '#barchart'
    }, data, selected)
  });