/**
 * Load data from CSV file asynchronously and render charts
 */
let data, yearSlider;

 d3.csv('data/Dataset.csv').then(_data => {
   data = _data;
   data.forEach(d => {

  });

  // Initialize and render chart
  yearSlider = new YearSlider({ parentElement: '#slider' }, data);
  yearSlider.updateVis();
});

var map = new GeoMap();