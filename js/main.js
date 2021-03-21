// Initialize constants and global variables
const indicators = new Indicators();

let barChart, lineChart;
let data, filteredData;

//TODO: get rid of this after we implement for all selectable items:
let selected = { area: "World", comparisonAreas: ["China"], indicator: indicators.GDP_PER_CAPITA}

/**
 * Load data from CSV file asynchronously and render charts
 */
 d3.csv('data/Dataset.csv').then(_data => {
    // Filter all irrelevant data
    let indicatorsOfInterest = indicators.getAllIndicatorsOfInterest();
    data = _data.filter(d => indicatorsOfInterest.includes(d.IndicatorName));

    data.forEach(d => {
        /* TODO */
    });  

    filteredData = filterData();

    //Initialize views
    barChart = new BarChart({
      parentElement: '#barchart'
    }, filteredData, selected)
  });


  // ----------------- Helpers -------------------- //

  let filterData = () => {
    let filtered;
    // Filter by selected indicator
    filtered = data.filter(d => d.IndicatorName === selected.indicator);
    console.log(filtered);
    return filtered;
  }

  var map = new GeoMap();
