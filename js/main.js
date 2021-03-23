/**
 * Load data from CSV file asynchronously and render charts
 */
let data, yearSlider, map, selectedIndicator;

  d3.csv('data/Dataset.csv').then(_data => {
  data = _data;
  data.forEach(d => { 
    d.Value = +d.Value;
  });

  selectedIndicator = new Indicators().POPULATION_DENSITY; // default
  const filteredData = data.filter(d => d.IndicatorName == selectedIndicator);

  // Initialize and render chart
  yearSlider = new YearSlider({ parentElement: '#slider' }, data);

  d3.json("./data/countries.geojson").then(_data => { 
    map = new GeoMap(filteredData, _data);
    map.updateVis();
  });
});