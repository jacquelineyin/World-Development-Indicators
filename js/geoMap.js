class GeoMap {

    constructor(_data, _geoJsonData, _selected) {
      this.data = _data;
      this.geoJson = _geoJsonData;
      this.countries = this.geoJson.features.map(d => d.properties.ISO_A3);
      this.selected = _selected;
      this.initVis();
    }
  
    // Create SVG area, initialize scales and axes
    initVis() {

      // Initialize map and retrieve raster layer
      this.map = L.map('map').setView([36.1408, 5.3536], 2);
      L.Icon.Default.imagePath = "images/";
      L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        zoomOffset: -1,
        tileSize: 512,
        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        accessToken: 'sk.eyJ1IjoiYnJldHRwYXN1bGEiLCJhIjoiY2ttaThjenpqMGVyMDJzcmh6d2w5anQ2aiJ9.x43UBzwi3iRfsZSSb5ubIQ'
      }).addTo(this.map);

      // Initialize indicator scale
      this.indicatorScale = d3.scaleLinear()
        .range([0,1]);
    }
  
    // Prepare data and scales
    updateVis() {
      // Filter by selected years, selected indicator
      var filteredData = this.data.filter(d => this.selected.selectedYears.includes(d.Year) && d.IndicatorName == this.selected.indicator);

      // Aggregate data by country and calculate the mean
      var groupedData = d3.rollup(filteredData, v => d3.mean(v, i => i.Value), d => d.CountryCode);

      // Remove countries for which we do not have a corresponding vector tile, e.g. "WLD"
      for (let country of groupedData.keys()) { 
        if (!this.countries.includes(country)) { 
          groupedData.delete(country);
        }
      } 

      // Set indicator scale domain
      this.indicatorScale.domain([d3.min(groupedData.values()), d3.max(groupedData.values())]);

      // Add scaled indicator value to GeoJSON data for rendering
      this.geoJson.features.forEach(d => {
        d.properties.indicatorValue = this.indicatorScale(groupedData.get(d.properties.ISO_A3));
      });
      
      this.renderVis();
    }
  
    // Bind data to visual elements, update axes
    renderVis() {
      L.geoJson(this.geoJson, {style: this.styleFeature}).addTo(this.map);
    }

    static getTileColor(d) { 
      return  d > 0.8 ? '#08519c' : 
              d > 0.6 ? '#3182bd' : 
              d > 0.4 ? '#6baed6' : 
              d > 0.2 ? '#bdd7e7' : 
              isNaN(d) ? '#808080' : 
                        '#eff3ff';
    }

    styleFeature(feature) {
      return { 
        fillColor: GeoMap.getTileColor(feature.properties.indicatorValue),
        fillOpacity: 0.7,
        weight: 2, 
        color: 'white',
        dashArray: '3'
      };
    }
  }