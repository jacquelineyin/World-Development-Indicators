/**
 * Load data from CSV file asynchronously and render charts
 */
let data, yearSlider;

d3.csv('data/Dataset.csv').then(_data => {
  data = _data;
  _data.forEach(d => {
    //d.Year = Number(d.Year);
  });

  // Initialize and render chart
  yearSlider = new YearSlider({ parentElement: '#slider' }, data);
  yearSlider.updateVis();
});

var map = new GeoMap();