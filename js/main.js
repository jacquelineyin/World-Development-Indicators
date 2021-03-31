// Global objects
let barChart, yearSlider, lineChart, data, filteredData, wedgeView;

// Initialize global constants
const indicators = new Indicators();
const selected = new Selected();
const regionMapper = new RegionMapper();
const regions = new Regions();
const countries = new Countries();
const dispatcherEvents = new DispatcherEvents();
const colourPalette = new ColourPalette();
const parseTime = d3.timeParse("%Y");

// Initialize dispatcher that is used to orchestrate events
const dispatcher = d3.dispatch(
  dispatcherEvents.FILTER_YEAR,
  dispatcherEvents.CHANGE_INDICATOR, 
  dispatcherEvents.SELECT_FOCUS_AREA,
  dispatcherEvents.SELECT_COMPARISON_ITEM,
  dispatcherEvents.DELETE_COMPARISON_ITEM
  );

const focusedAreaWidget = new FocusAreaWidget(
  selected, 
  {  
    regionMapper, 
    countries,
    regions,
    dispatcherEvents
  },
  dispatcher,
  );

  const comparisonWidget = new ComparisonWidget(
    selected,
    { 
      regionMapper, 
      countries, 
      regions, 
      dispatcherEvents 
    },
    dispatcher,
  );

/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/Dataset.csv').then(_data => {
  data = _data;

  data.forEach(d => {
    /* TODO */
    d.year = parseTime(d.Year);
    d.value = d.Value !== 'NULL' ? +d.Value : null;
    d.Value = d.Value !== 'NULL' ? +d.Value : null;
  });

  //TODO: Testing purposes only. Get rid of it after finishing implementation of selectionItems
  setTestSelectedItems();

  // Initialize select country/region for focused area
  focusedAreaWidget.createSelectFocusArea();
  comparisonWidget.updateComparisonSection();

  //Initialize views
  // Load in GeoJSON data and initialize map view
  d3.json("./data/countries.geojson").then(geoJsonData => { 
    map = new GeoMap(data, geoJsonData, selected);
    map.updateVis();
  });

  // Initialize the wedge view
  wedgeView = new WedgeView(data, selected, dispatcher, dispatcherEvents);
  wedgeView.updateVis();

  // Initialize bar chart
  barChart = new BarChart({
    parentElement: '#barchart',
    colour: {
      selectedCountryBar: colourPalette.getFocusedAreaColour(),
      comparisonCountryBars: colourPalette.AQUA,
    }
  }, data, selected);

  // Initialize line chart
  lineChart = new LineChart({ 
    parentElement: '#linechart' ,
    colour: {
      selectedArea: colourPalette.getFocusedAreaColour(),
      otherAreas: colourPalette.getNonFocusedAreaColour()
    }
  }, data, selected);

  // Initialize and render time slider
  yearSlider = new YearSlider({ parentElement: '#slider' }, data, dispatcher, dispatcherEvents);

  // Show linechart
  lineChart.updateVis();
});

// ----------------- Dispatcher -------------------- //

dispatcher.on(dispatcherEvents.FILTER_YEAR, selectedYears => {
  selected.selectedYears = selectedYears;
  selected.setTimeInterval(selectedYears[0], selectedYears[selectedYears.length-1]);

  map.updateVis();
  wedgeView.updateVis();
  lineChart.updateVis();
  barChart.updateVis();
})

dispatcher.on(dispatcherEvents.SELECT_FOCUS_AREA, (type, value) => {
  updateSelectedArea(type, value);
  comparisonWidget.updateTags();

  wedgeView.updateVis();
  barChart.updateVis();
  lineChart.updateVis();
}); 

dispatcher.on(dispatcherEvents.CHANGE_INDICATOR, newlySelectedIndicator => {
  selected.indicator = indicators[newlySelectedIndicator];
  comparisonWidget.updateComparisonSection();
  
  map.updateVis();
  barChart.updateVis();
  lineChart.updateVis();
});

dispatcher.on(dispatcherEvents.SELECT_COMPARISON_ITEM, comparisonItem => {
  selected.addComparisonArea(comparisonItem);
  comparisonWidget.updateTags();

  map.updateVis();
  barChart.updateVis();
  lineChart.updateVis();
})

dispatcher.on(dispatcherEvents.DELETE_COMPARISON_ITEM, comparisonItem => {
  selected.removeComparisonArea(comparisonItem);
  comparisonWidget.updateTags();

  map.updateVis();
  barChart.updateVis();
  lineChart.updateVis();
})

// ----------------- Helpers -------------------- //

/**
 * Purpose: Updates selected.area with the appropriate values
 * @param {string} type = 'region' if setting region, 'country' if setting country
 * @param {string} value is a capitalized (first letter only) country or region name
 */
 let updateSelectedArea = (type, value) => {
  if (type === 'country') {
    selected.setArea({ country: value });
  } else if (type === 'region') {
    handleSelectRegion(value);
  }
}

/**
 * Purpose: Updates the selected object
 *          and updates default country of dropdown list to fit selected region 
 * @param {string} _region = name of region that's selected
 */
let handleSelectRegion = (_region) => {
    selected.setArea({ region: _region });
    
    // Update dropdown to display only countries of that region
    focusedAreaWidget.createSelectCountryDropdown();

    // Update selected country to the default of updated dropdown
    let selectElem = document.getElementById('country-selector');
    selected.setArea({ country: selectElem.value });
}

/**
 * Purpose: Creates a mock "selected" state for testing purposes
 */
let setTestSelectedItems = () => {
  // test value timeInterval
  const defaultYears = [...new Set(data.map(d => d.Year))].slice(0,6);
  selected.selectedYears = defaultYears;
  selected.timeInterval = { min: defaultYears[0], max: defaultYears[defaultYears.length-1] };

  // test value indicator
  selected.setIndicator(indicators.MOBILE_CELLULAR_SUBSCRIPTIONS);
}

