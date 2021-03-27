// Global objects
let barChart, yearSlider, lineChart, data, filteredData;

// Initialize constants and global variables
const indicators = new Indicators();
const selected = new Selected();

// Initialize dispatcher that is used to orchestrate events
const dispatcherYear = d3.dispatch('filterYear');


/**
 * Load data from CSV file asynchronously and render charts
 */
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

  // Initialize views
  barChart = new BarChart({
    parentElement: '#barchart'
  }, data, selected);

  lineChart = new LineChart({ parentElement: '#linechart' }, data, selected);

  // Initialize and render time slider
  yearSlider = new YearSlider({ parentElement: '#slider' }, data, dispatcherYear);

  // Show linechart
  lineChart.updateVis();
});

// Show map
var map = new GeoMap();

// ----------------- Dispatcher -------------------- //

dispatcherYear.on('filterYear', selectedYears => {
  lineChart.selected.selectedYears = selectedYears;
  barChart.selected.timeInterval = { min: selectedYears[0], max: selectedYears[selectedYears.length-1] };

  lineChart.updateVis();
  barChart.updateVis();
})

// ----------------- Helpers -------------------- //

/**
 * Purpose: Returns an array of all the years in the given dataset
 * @param {Array} data 
 * @returns {Array} of Objects
 */
let getAllYears = (data) => {
  let years = data.map(d => d.Year);
  return years;
}

/**
 * Purpose: Creates a mock "selected" state for testing purposes
 */
let setTestSelectedItems = () => {
  // test value timeInterval
  //let years = getAllYears(data);
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


