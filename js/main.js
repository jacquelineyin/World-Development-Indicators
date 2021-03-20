/**
 * Load data from CSV file asynchronously and render charts
 */
 d3.csv('data/Dataset.csv').then(data => {
    data.forEach(d => {
        /* TODO */
    }); 
  });

  var map = new GeoMap();