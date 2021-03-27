// Global objects
let barChart, yearSlider, lineChart, data, filteredData;

// Initialize constants and global variables
const indicators = new Indicators();
const selected = new Selected();

// Initialize dispatcher that is used to orchestrate events
const dispatcher = d3.dispatch('filterYear');


/**
 * Load data from CSV file asynchronously and render charts
 */
const parseTime = d3.timeParse("%Y");
d3.csv('data/Dataset.csv').then(_data => {
  let indicatorsOfInterest = indicators.getAllIndicatorsOfInterest();
  data = _data.filter(d => indicatorsOfInterest.includes(d.IndicatorName));

  data.forEach(d => {
    /* TODO */
    d.year = parseTime(d.Year);
    d.value = +d.Value;
  });

  //TODO: Testing purposes only. Get rid of it after finishing implementation of selectionItems
  setTestSelectedItems();

  // Load in GeoJSON data and initialize map view
  d3.json("./data/countries.geojson").then(geoJsonData => { 
    map = new GeoMap(data, geoJsonData, selected);
    map.updateVis();
  });

  // Initialize bar chart
  barChart = new BarChart({
    parentElement: '#barchart'
  }, data, selected);

  // Initialize line chart
  lineChart = new LineChart({ parentElement: '#linechart' }, data, selected);

  // Initialize and render time slider
  yearSlider = new YearSlider({ parentElement: '#slider' }, data, dispatcher);

  // Show linechart
  lineChart.updateVis();
});

// ----------------- Dispatcher -------------------- //

dispatcher.on('filterYear', selectedYears => {
  lineChart.selected.selectedYears = selectedYears;
  barChart.selected.timeInterval = { min: selectedYears[0], max: selectedYears[selectedYears.length-1] };

  lineChart.updateVis();
  barChart.updateVis();
})

// ----------------- Helpers -------------------- //
/**
 * Purpose: Creates a mock "selected" state for testing purposes
 */
let setTestSelectedItems = () => {
  // test value timeInterval
  const defaultYears = [...new Set(data.map(d => d.Year))].slice(0,5)
  selected.selectedYears = defaultYears;
  selected.timeInterval = { min: defaultYears[0], max: defaultYears[defaultYears.length-1] };

  // test value focusArea
  selected.setArea({ region: "World", country: "Japan" });

  // test value comparison countries
  selected.addComparisonArea("Canada");
  selected.addComparisonArea("China");
  selected.addComparisonArea("Brazil");

  // test value indicator
  selected.setIndicator(indicators.MOBILE_CELLULAR_SUBSCRIPTIONS);
}

