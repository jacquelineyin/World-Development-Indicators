class BarChart {

    /**
     * Class constructor with initial configuration
     * @param {Object} _config 
     * @param {Array} _data 
     * @param {Selected} _selectedItems 
     * @param {Object} _dispatcher 
     */
    constructor(_config, _data, _selectedItems, _dispatcher) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 400,
        containerHeight: _config.containerHeight || 300,
        margin: _config.margin || {top: 15, right: 15, bottom: 40, left: 75},
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
      this.selected = _selectedItems;
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
      vis.appendAxisTitles('Countries/Regions', vis.selected.indicator);

      // Update Vis
      vis.updateVis();

    }
  
    updateVis() {
      // Prepare data and scales
      let vis = this;
      
      vis.aggregatedData = vis.getAverages(vis.selected);


      // Specificy accessor functions
      vis.xValue = d => d.key;
      vis.yValue = d => d.avg;

      // Update Axes
      vis.yScale.domain([0, d3.max(vis.getAllAverages())])
      vis.xScale.domain(vis.selected.allSelectedAreas);

      vis.renderVis();
    }
  
    renderVis() {
      let vis = this;
      // Bind data to visual elements, update axes
      vis.renderBars();

      // Update axes
      vis.renderAxisGroups(); 
    }

    /**
     * 
     * @param {Array} _data 
     * @param {Selected} _selectedItems
     */
    update(_data, _selectedItems) {
      let vis = this;
      //TODO

      // let xScale = d3.scaleLinear()
    }

    // ------------------------------------------ Helper functions ------------------------------------ f//
    initScales() {
      let vis = this;

      vis.xScale = d3.scaleBand()
        .range([0, vis.width])
        .paddingInner(0.2);

      vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);
    }

    initAxes() {
      //TODO
      let vis = this;

      vis.xAxis = d3.axisBottom(vis.xScale)
        .tickSizeOuter([0]);

      vis.yAxis = d3.axisLeft(vis.yScale)
        .tickSize(-vis.width)
        .tickSizeOuter([0])
        .tickPadding(10);
    }

    appendAxisGroups() {
      //TODO
      let vis = this;

      vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis x-axis-barchart');

      vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis y-axis-barchart');
    }

    appendAxisTitles(xAxisTitle, yAxisTitle) {
      //TODO
    let vis = this; 

    // Append x-axis title to svg
    vis.chartArea.append('text')
      .attr('class', 'axis-title barchart-axis-title')
      .attr('y', vis.height + 25)
      .attr('x', vis.width)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text(xAxisTitle);
  
    if (yAxisTitle) {
      // Append y-axis title to svg
      vis.chartArea.append('text')
        .attr('class', 'axis-title barchart-axis-title')
        .attr('y', -vis.config.margin.top)
        .attr('x', -vis.config.margin.left)
        .attr('dy', '.71em')
        .style('text-anchor', 'start')
        .text(yAxisTitle);
    }
  }

    getTimeInterval() {
      let vis = this;

      let years = vis.data.map(d => d.Year);

      let timeInterval = {};
      timeInterval.min = d3.min(years);
      timeInterval.max = d3.max(years);

      return timeInterval;
    }

    renderAxisGroups() {
      let vis = this;
    
      vis.xAxisG
        .call(vis.xAxis)
        .attr('transform', `translate(0 ,${vis.height})`);
  
      vis.yAxisG
        .call(vis.yAxis)
        .call(g => g.select('.domain').remove());
    }

    getAllValues() {
      let vis = this;

      return vis.data.map(d => d.Value);
    }

    getAllAverages() {
      let vis = this;
      return vis.aggregatedData.map(d => d.avg);
    }

    /**
     * 
     * @param {Array} selectedAreas
     * @param {string} indicator 
     * @param {Object} timeInterval = {min: Number, max: Number}
     * @returns {Array} of Objects 
     * Ex. 
     * [
     *    {key: "World", avg: 4019},
     *    {key: "China", avg: 5000},
     *    ...
     * ]
     */
    getAverages(selected) {
      let vis = this;
    
      let dataOfInterest = vis.filterData(vis.data, selected);
      let res = d3.rollups(dataOfInterest, v => d3.mean(v, d => d.Value), d => d.CountryName);
      res = Array.from(res, ([key, avg]) => ({ key, avg }));

      return res;
    }

    renderBars() {
      let vis = this;
      //TODO: use aggregation & grouped elems
      console.log(vis.aggregatedData);
      // Bind data to visual elements
      const bars = vis.chart.selectAll('.bar')
          .data(vis.aggregatedData, vis.xValue)
        .join('rect')
          .attr('class', d => `bar bar-${d.key.toLowerCase()}`)
          .attr('x', d => vis.xScale(vis.xValue(d)))
          .attr('y', d => vis.yScale(vis.yValue(d)))
          .attr('width', vis.xScale.bandwidth())
          .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
          .attr('fill', d => vis.getBarColour(d));
        // .on('mouseover', e => d3.select(e.target).attr('stroke', 'black'))
        // .on('mouseleave', e => d3.select(e.target).attr('stroke', 'none'))
        // .on('click', (e) => vis.handleClick(e));
    }

    /**
     * 
     * @param {Object} data = {key: "World", avg: 4019} 
     */
    getBarColour(data) {
      let vis = this;
    
      let isSelectedArea = data.key === vis.selected.area.country || data.key === vis.selected.area.region;
      console.log(vis.selected.area);
      console.log(isSelectedArea);
      let isHovered = false;

      if (isHovered) {
        return vis.config.colour.hoveredBar;
      } else if (isSelectedArea) {
        return vis.config.colour.selectedCountryBar;
      } else {
        return vis.config.colour.comparisonCountryBars;
      }
      
    }

    /**
     * 
     * @param {Array} dataArr 
     * @param {Selected} selectedItems 
     * @returns 
     */
    filterData(dataArr, selectedItems) {
      let {allSelectedAreas, indicator, timeInterval} = selectedItems;
      let isWithinTimeInterval = d => d.Year >= timeInterval.min && d.Year <= timeInterval.max;

      let filtered = dataArr.filter(d => allSelectedAreas.includes(d.CountryName) 
                                          && d.IndicatorName === indicator 
                                          && isWithinTimeInterval(d));
      return filtered;
    }

    
  }