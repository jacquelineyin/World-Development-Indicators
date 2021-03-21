/**
 * Load data from CSV file asynchronously and render charts
 */
 let data, lineChart;

 d3.csv('data/Dataset.csv').then(_data => {
   data = _data;
   _data.forEach(d => {

  });
 
   // Initialize and render chart
   lineChart = new LineChart({ parentElement: '#linechart' }, data);
   lineChart.updateVis();
 });

  var map = new GeoMap();