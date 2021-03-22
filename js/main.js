// Initialize constants and global variables
const indicators = new Indicators();
const selected = new Selected();

let barChart, lineChart;
let data, filteredData;


/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/Dataset.csv').then(_data => {
  // Filter all irrelevant data
  let indicatorsOfInterest = indicators.getAllIndicatorsOfInterest();
  data = _data.filter(d => indicatorsOfInterest.includes(d.IndicatorName));
  
  
  //TODO: get rid of this after we implement for all selectable items
    let years = getAllYears(data);
    minYear = d3.min(years);
    maxYear = d3.max(years);
    selected.setItems({region: "World", country: ""}, indicators.BIRTH_RATE, minYear, maxYear);
    selected.addComparisonArea("China");
    selected.addComparisonArea("Canada");

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

  /**
   * 
   * @param {Array} data 
   */
  let getAllYears = (data) => {
    let years = data.map(d => d.Year);
    return years;
  }

  var map = new GeoMap();
