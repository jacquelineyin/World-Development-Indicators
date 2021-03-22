class GeoMap {

    constructor() {
      this.initVis();
    }
  
    // Create SVG area, initialize scales and axes
    initVis() {
      
      const map = L.map('map').setView([36.1408, 5.3536], 2);
      L.Icon.Default.imagePath = "images/";
      L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        zoomOffset: -1,
        tileSize: 512,
        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        accessToken: 'sk.eyJ1IjoiYnJldHRwYXN1bGEiLCJhIjoiY2ttaThjenpqMGVyMDJzcmh6d2w5anQ2aiJ9.x43UBzwi3iRfsZSSb5ubIQ'
      }).addTo(map);
      var vectorLayer = new L.GeoJSON.AJAX("./data/countries.geojson");
      vectorLayer.addTo(map);
    }
  
    updateVis() {
      // Prepare data and scales
    }
  
    renderVis() {
      // Bind data to visual elements, update axes
    }
  }