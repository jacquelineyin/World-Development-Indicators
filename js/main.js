// Initialize constants and global variables
const indicators = new Indicators();
const selected = new Selected();

let barChart, yearSlider, lineChart, data, filteredData;

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

  //Initialize views
  barChart = new BarChart({
    parentElement: '#barchart'
  }, data, selected);

  lineChart = new LineChart({ parentElement: '#linechart' }, data, selected);
  lineChart.updateVis();

  // Initialize and render time slider
  yearSlider = new YearSlider({ parentElement: '#slider' }, data);

});
// var map = new GeoMap();

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
  let years = getAllYears(data);
  selected.timeInterval = { min: d3.min(years), max: d3.max(years) };
  selected.selectedYears = ['1994', '1995', '1996', '1997', '1998', '1999'];


  // test value focusArea
  selected.setArea({ region: "World", country: "Japan" });

  // test value comparison countries
  selected.addComparisonArea("Canada");
  selected.addComparisonArea("China");
  selected.addComparisonArea("Brazil");

  // test value indicator
  selected.setIndicator(indicators.MOBILE_CELLULAR_SUBSCRIPTIONS);
}

