// Initialize constants and global variables
const indicators = new Indicators();
const selected = new Selected();
const regionMapper = new RegionMapper();
const regions = new Regions();
const countries = new Countries();

let barChart, yearSlider, lineChart, data, filteredData;

/**
 * Load data from CSV file asynchronously and render charts
 */
/**
 * Load data from CSV file asynchronously and render charts
 */
const parseTime = d3.timeParse("%Y");

d3.csv('data/Dataset.csv').then(_data => {
  data = _data;

  data.forEach(d => {
    /* TODO */
    d.year = parseTime(d.Year);
    d.value = +d.Value;
  });

  //TODO: Testing purposes only. Get rid of it after finishing implementation of selectionItems
  setTestSelectedItems();
  createFocusAreaSection();

  //Initialize views
  barChart = new BarChart({
    parentElement: '#barchart'
  }, data, selected);

  lineChart = new LineChart({ parentElement: '#linechart' }, data, selected);
  lineChart.updateVis();

  // Initialize and render time slider
  yearSlider = new YearSlider({ parentElement: '#slider' }, data);

});

var map = new GeoMap();

// ----------------- Helpers -------------------- //

let createFocusAreaSection = () => {
  createSelectCountryDropdown();
  createRegionRadioButtons();
}

let createSelectCountryDropdown = () => {
  let countryList = regionMapper.getCountriesOfRegion(selected.area.region);
  console.log(countryList);

  let parent = document.getElementById("country-selector-container");
  let select = document.createElement("select");
  select.name = "country-selector";
  select.id = select.name;

  for (let country of countryList) {
    let option = document.createElement("option");
    option.value = country;

    // Capitalize first letter
    option.text = country.charAt(0).toUpperCase() + country.slice(1);

    // Set default selected
    if (country === countries.CANADA) {
      option.selected = "selected";
    }

    select.appendChild(option);
  }



  // let label = document.createElement("label");
  // label.innerHTML = "Select a Country: "
  // label.htmlFor = "country-selector";

  parent
  // .appendChild(label)
  .appendChild(select);
}

let createRegionRadioButtons = () => {
  let regionList = regions.getAllRegions();

  let parent = document.getElementById("region-selector-container");

  for (let region of regionList) {
    let radio = document.createElement("input");
    radio.type = "radio";
    radio.className = "radio-button";
    radio.name = "region";
    radio.id = `region-${region}`;
    radio.value = region;
  
    let label = document.createElement("label");
    label.className = "radio-label";
    label.htmlFor = radio.id;
    label.innerHTML = radio.value;

    parent.appendChild(radio);
    parent.appendChild(label);
  }
}

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
  selected.setArea({ region: regions.WORLD, country: countries.JAPAN });

  // test value comparison countries
  selected.addComparisonArea(countries.CANADA);
  selected.addComparisonArea(countries.CHINA);
  selected.addComparisonArea(countries.BRAZIL);

  // test value indicator
  selected.setIndicator(indicators.MOBILE_CELLULAR_SUBSCRIPTIONS);
}

