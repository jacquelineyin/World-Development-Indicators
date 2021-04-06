class GeoMap {

    constructor(_data, _geoJsonData, _selected, _constants) {
      this.indicators = new Indicators();
      this.data = _data;
      this.populationData = _data.filter(d => d.IndicatorName == this.indicators.POPULATION_TOTAL);
      this.geoJson = _geoJsonData;
      this.defaultCoords = [36.1408, 5.3536],
      this.countries = this.geoJson.features.map(d => d.properties.ISO_A3);
      this.selected = _selected;
      this.constants = _constants ||
        {
          countryCodeMapper : new CountryCodeMapper(),
          countries : new Countries()
        }
      this.initVis();
    }

    static getTileColor(d) { 
      return  d > 0.8 ? '#08519c' : 
              d > 0.6 ? '#3182bd' : 
              d > 0.4 ? '#6baed6' : 
              d > 0.2 ? '#bdd7e7' : 
              isNaN(d) ? '#808080' : 
                        '#eff3ff';
    }
  
    // Create SVG area, initialize scales and axes
    initVis() {
      // Initialize map and retrieve raster layer
      this.map = L.map('map').setView(this.defaultCoords, 2);
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
     
      // If a GeoJSON layer already exists, remove it
      if (this.geoJsonLayer) {
        this.map.removeLayer(this.geoJsonLayer);
      }

      // If a legend exits, remove to re-render on update
      if (this.legend) { 
        d3.select('.info.legend.leaflet-control').remove();
      }

      // Filter data by selected years and selected indicator
      const filteredData = this.data.filter(d => this.selected.selectedYears.includes(d.Year) && d.IndicatorName == this.selected.indicator);
      const filteredPopulationData = this.populationData.filter(d => this.selected.selectedYears.includes(d.Year));

      // Aggregate data by country and calculate the mean
      const groupedData = d3.rollup(filteredData, v => d3.mean(v, i => i.Value), d => d.CountryCode);
      const groupedPopulationData = d3.rollup(filteredPopulationData, v => d3.mean(v, i => i.Value), d => d.CountryCode);

      // Normalize some indicators
      // Remove countries for which we do not have a corresponding vector tile, e.g. "WLD"
      const indicatorsToNormalize = [this.indicators.RURAL_POPULATION, 
                                     this.indicators.URBAN_POPULATION,
                                     this.indicators.ENROLMENT_IN_PRIMARY_EDUCATION,
                                     this.indicators.ENROLMENT_IN_SECONDARY_GENERAL,
                                     this.indicators.MOBILE_CELLULAR_SUBSCRIPTIONS];
      for (let country of groupedData.keys()) { 
        if (this.countries.includes(country)) {
          if (indicatorsToNormalize.includes(this.selected.indicator)) { 
          let normalizedByPopulationValue = groupedData.get(country) / groupedPopulationData.get(country); 
          groupedData.set(country, normalizedByPopulationValue);
          }
        } else {
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
      let vis = this;

      // Add GeoJSON
      this.geoJsonLayer = L.geoJson(this.geoJson, 
        {
          style: this.styleFeature,
          onEachFeature: this.onEachFeature
        }).addTo(this.map);

      // Map focus on selected areas
      this.fitMapBoundsToSelectedAreas();

      // Legend
      // https://leafletjs.com/examples/choropleth/
      this.legend = L.control({position: 'bottomleft'});

      this.legend.onAdd = function (map) {

      const div = L.DomUtil.create('div', 'info legend'),
        bins = [1, 0.8, 0.6, 0.4, 0.2, NaN],
        labels = [];
        div.innerHTML += `${vis.selected.indicator}<br>`;

      // Loop through bins, adding a legend entry for each
      for (let i = 0; i < bins.length; i++) {
        if (bins[i]) {
        div.innerHTML +=
            '<i style="background:' + GeoMap.getTileColor(bins[i]) + '"></i> ' + (vis.indicatorScale.invert(bins[i])).toFixed(2) + '<br>';
      } else { 
        div.innerHTML += '<i style="background:' + GeoMap.getTileColor(bins[i]) + '"></i>No data<br>';
      }
    }

      return div;
    };

    this.legend.addTo(this.map);
    }

    // ---------------------------------------- Helper functions -------------------------------------- //

    styleFeature(feature) {
      return { 
        fillColor: GeoMap.getTileColor(feature.properties.indicatorValue),
        fillOpacity: 0.7,
        weight: 2, 
        color: 'white',
        dashArray: '3'
      };
    }

    /**
     * Purpose: Fits bounds of map to selected countries (.: focusing on countries of interest)
     */
    fitMapBoundsToSelectedAreas() {
      let geoJsonOfSelected = this.createGeoJsonFeature(this.selected.allSelectedAreas);
      let selectedGeoJsonLayer = L.geoJson(geoJsonOfSelected);
      this.map.fitBounds(selectedGeoJsonLayer.getBounds());
    }

    /**
     * Purpose: Returns a GeoJSON featureCollections object with 
     *          a "features" array of geoJSONs of selected countries only
     * @param {Array} countries : an array of country names/strings
     * @returns {Object} : GeoJSON features object
     */
    createGeoJsonFeature(countries) {
      let codes = this.constants.countryCodeMapper.getCountryCodes(countries);
      let geoJsonArray = this.geoJson.features.filter(d => codes.includes(d.properties.ISO_A3));

      let geoJsonFeatures = {
        "type": "FeatureCollection",
        "features": geoJsonArray
      }

      return geoJsonFeatures;
    }
  }