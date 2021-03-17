class BarChart {

    /**
     * Class constructor with initial configuration
     * @param {Object} _config 
     * @param {Array} _data 
     * @param {Object} _selectedItems = {focusCountry: "", selectedCountries: ["", "", ...], indicator: ""}
     * @param {Object} _dispatcher 
     */
    constructor(_config, _data, _selectedItems, _dispatcher) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.container.width || 1000,
        containerHeight: _config.container.height || 380,
        margin: _config.margin || {top: 15, right: 15, bottom: 30, left: 50},
        colour: _config.colour || 
                {
                  selectedCountryBar: 'blue',
                  comparisonCountryBars: 'green',
                  hoveredBar: 'grey',
                },
        tooltip: _config.tooltip || {padding: 15},
      }
      this.data = _data,
      this.dispatcher = _dispatcher,
      this.selectedIndicator = _selectedItems ? _selectedItems.indicator : null;
      this.selectedFocusCountry = _selectedItems ? _selectedItems.focusCountry : null;
      this.selectedComparisonCountries = _selectedItems ? _selectedItems.comparisonCountries : null;
      this.initVis();
    }
  
    initVis() {
      let vis = this;
      // Create SVG area, initialize scales and axes

      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chartArea = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.chart = vis.chartArea.append('g');

    // Initialize scales, axes, static elements, etc.
    vis.initScales();
    vis.initAxes();

    // Append axis groups
    vis.appendAxisGroups();

    // Append axis titles
    vis.appendAxisTitles(vis.selectedIndicator, 'Countries');

    // Update Vis
    vis.updateVis();

    }
  
    updateVis() {
      let vis = this;
      // Prepare data and scales
    }
  
    renderVis() {
      let vis = this;
      // Bind data to visual elements, update axes
    }

    /**
     * 
     * @param {Array} _data 
     * @param {Object} _selectedItems = {focusCountry: "", comparisonCountries: ["", "", ...], indicator: ""}
     */
    update(_data, _selectedItems) {
      let vis = this;
      //TODO
    }

    // ------------------------------------------ Helper functions ------------------------------------ f//
    initScales() {
      //TODO
    }

    initAxes() {
      //TODO
    }

    appendAxisGroups() {
      //TODO
    }

    appendAxisTitles(xAxisTitle, yAxisTitle) {
      //TODO
    }
  }