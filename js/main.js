/**
 * Load data from CSV file asynchronously and render charts
 */
 d3.csv('data/Dataset.csv').then(data => {
    data.forEach(d => {
        /* TODO */
    }); 
  });

  var map = new GeoMap();

// Year slider
var slider = d3
  .sliderHorizontal()
  .min(1960)
  .max(2014)
  .step(1)
  .width(1400)
  .tickFormat(d3.format('d'))
  .ticks(20);

d3.select('#slider')
  .append('svg')
  .attr('width', 1500)
  .attr('height', 100)
  .append('g')
  .attr('transform', 'translate(15,10)')
  .call(slider);