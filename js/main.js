/**
 * Load data from CSV file asynchronously and render charts
 */
// Initialize constants and global variables
const indicators = new Indicators();
const selected = new Selected();
let barChart, yearSlider, lineChart, data, filteredData;

/**
 * Load data from CSV file asynchronously and render charts
 */
 const parseTime = d3.timeParse("%Y");

d3.csv('data/Dataset.csv').then(_data => {
    let indicatorsOfInterest = indicators.getAllIndicatorsOfInterest();
    data = _data.filter(d => indicatorsOfInterest.includes(d.IndicatorName));

    let years = getAllYears(data);
    minYear = d3.min(years);
    maxYear = d3.max(years);
    selected.setItems({region: "World", country: ""}, indicators.BIRTH_RATE, minYear, maxYear);
    selected.addComparisonArea("China");
    selected.addComparisonArea("Canada");

    data.forEach(d => {
        /* TODO */
        d.year = parseTime(d.Year);
        d.value = +d.Value;
    });  

    //Initialize views
    filteredData = filterData();

    var cdata = [
      {
        name: "USA",
        values: [
          { year: "2000", avg: "10" },
          { year: "2001", avg: "11" },
          { year: "2002", avg: "15" },
          { year: "2003", avg: "24" },
          { year: "2004", avg: "10" },
          { year: "2005", avg: "70" },
          { year: "2006", avg: "10" },
          { year: "2007", avg: "35" },
          { year: "2008", avg: "21" },
          { year: "2009", avg: "20" }
        ]
      },
      {
        name: "Canada",
        values: [
          { year: "2000", avg: "20" },
          { year: "2001", avg: "12" },
          { year: "2002", avg: "33" },
          { year: "2003", avg: "21" },
          { year: "2004", avg: "51" },
          { year: "2005", avg: "70" },
          { year: "2006", avg: "20" },
          { year: "2007", avg: "65" },
          { year: "2008", avg: "21" },
          { year: "2009", avg: "10" }
        ]
      },
      {
        name: "Mexico",
        values: [
          { year: "2000", avg: "50" },
          { year: "2001", avg: "10" },
          { year: "2002", avg: "5" },
          { year: "2003", avg: "70" },
          { year: "2004", avg: "20" },
          { year: "2005", avg: "9" },
          { year: "2006", avg: "20" },
          { year: "2007", avg: "35" },
          { year: "2008", avg: "61" },
          { year: "2009", avg: "10" }
        ]
      }
    ];

    lineChart = new LineChart({ parentElement: '#linechart' }, cdata);
    lineChart.updateVis();

    // Initialize and render time slider
    yearSlider = new YearSlider({ parentElement: '#slider' }, data);
  });

  // ----------------- Helpers -------------------- //

  let filterData = () => {
    let filtered;
    // Filter by selected indicator
    filtered = data.filter(d => d.IndicatorName === selected.indicator);
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