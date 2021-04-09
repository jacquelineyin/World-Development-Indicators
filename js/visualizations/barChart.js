class BarChart {

  /**
   * Class constructor with initial configuration
   * @param {Object} _config : object holding configuration settings
   * @param {Array} _data : given data array
   * @param {Selected} _selectedItems : Selected class object holding selectedItem values
   * @param {Object} _dispatcher : d3 dispatcher
   */
  constructor(_config, _data, _selectedItems, _dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 50, right: 320, bottom: 70, left: 50 },
      colour: _config.colour || { selectedCountry: 'blue', comparisonCountry: 'green'},
      legend: _config.legend || 
              {
                width: 180,
                height: 8,
                yPadding: 25,
                colourBox: { width: 12, height: 12 },
                labelText: {
                  SELECTED_COUNTRY: 'Selected Country',
                  OTHER_COUNTRIES: 'Other Countries'
                }
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
        .attr("viewBox", `0 0 ${vis.config.containerWidth} ${vis.config.containerHeight}`);

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

    // Append legend group and render legend
    vis.appendLegendGroup();
    vis.renderLegend();

    // Update Vis
    vis.updateVis();

  }

  updateVis() {
    let vis = this;
    
    // Prepare data
    vis.aggregatedData = vis.getAverages(vis.selected);

    // Specificy accessor functions
    vis.xValue = d => d.key;
    vis.yValue = d => d.avg;

    // Update axis titles
    vis.renderAxisTitles('Countries/Regions', vis.selected.indicator);

    // Update Scale domains
    vis.updateYScale();
    vis.xScale.domain(vis.selected.allSelectedAreas);

    vis.renderVis();
  }

  updateYScale() {
    let vis = this;

    if (vis.aggregatedData.length > 0) {
      vis.yScale.domain([0, d3.max(vis.getAllAverages())]);
    } else {
      vis.yScale.domain([0, 0]);
    }
  }

  renderVis() {
    let vis = this;
    // Bind data to visual elements, update axes
    vis.renderBars();

    // Update axes
    vis.renderAxisGroups(); 
  }

  // ------------------------------------------ Helper functions ------------------------------------ //
  
  /**
   * Purpose: Initializes x- and y-scales
   * Note: Domain is not defined here as they are dynamic
   */
  initScales() {
    let vis = this;

    vis.xScale = d3.scaleBand()
      .range([0, vis.width])
      .paddingInner(0.2)
      .paddingOuter(0.1);

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);
  }

  /**
   * Purpose: Initializes x- and y-axes
   */
  initAxes() {
    let vis = this;
    
    // Replace the 'G' (Giga) SI-prefix of d3 with 'B' to stand for 'Billion' when formatting
    let format = (strInput) => d3.format(".2~s")(strInput).replace(/G/,"B");

    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSizeOuter([0]);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickSize(-vis.width)
      .tickSizeOuter([0])
      .tickPadding(10)
      .tickFormat(format);
  }

  /**
   * Purpose: Appends x- and y-axisGroups to chart
   */
  appendAxisGroups() {
    let vis = this;

    vis.xAxisG = vis.chart.append('g')
    .attr('class', 'axis x-axis x-axis-barchart');

    vis.yAxisG = vis.chart.append('g')
    .attr('class', 'axis y-axis y-axis-barchart');
  }

  /**
   * Purpose: Appends a 'g' element to svg to hold legend
   */
  appendLegendGroup() {
    let vis = this;
    let yOffset = vis.height / 2;
    yOffset += vis.config.margin.top;

    vis.legend = vis.svg.append('g')
      .attr('class', 'legend')
      .attr('width', vis.config.legendWidth)
      .attr('height', vis.config.legendHeight)
      .attr('transform', `translate(${vis.width + vis.config.margin.left + 50}, ${yOffset})`);
  }

  /**
   * Purpose: Renders legend
   */
  renderLegend() {
    let vis = this;

    // Add legend boxes
    vis.renderLegendColourBoxes();
    // Add legend labels
    vis.renderLegendElemLabels();
  }

  /**
   * Purpose: Renders legend's colour boxes
   */
  renderLegendColourBoxes() {
    let vis = this;
    const {SELECTED_COUNTRY, OTHER_COUNTRIES} = vis.config.legend.labelText;
    let labelYOffset = 0;

    vis.legend.selectAll('.legend-box')
      .data([SELECTED_COUNTRY, OTHER_COUNTRIES])
    .join('rect')
      .attr('class', 'legend-box')
      .attr('x', 0)
      .attr('y', (d, i) => i === 0 ? labelYOffset : labelYOffset -= vis.config.legend.yPadding)
      .attr('width', vis.config.legend.colourBox.width)
      .attr('height', vis.config.legend.colourBox.height)
      .style('fill', d => vis.getColourOfLegendBoxes(d));
  }

  /**
   * Purpose: Renders labels for legend's colour boxes
   */
  renderLegendElemLabels() {
    let vis = this;
    const {SELECTED_COUNTRY, OTHER_COUNTRIES} = vis.config.legend.labelText;
    let labelYOffset = 0 - 14;

    vis.legend.selectAll('.box-label')
      .data([SELECTED_COUNTRY, OTHER_COUNTRIES])
    .join('text')
      .attr('class', 'box-label')
      .attr('x', () => vis.config.legend.colourBox.width + 10)
      .attr('y', (d, i) => i === 0 ? labelYOffset : labelYOffset += vis.config.legend.yPadding)
      .text(d => d);
  }

  /**
   * Purpose: Renders x- and y-axis titles dynamically using enter-update-exit pattern
   * @param {string} xAxisTitle 
   * @param {string} yAxisTitle 
   */
  renderAxisTitles(xAxisTitle, yAxisTitle) {
    let vis = this; 
    let newYAxisTitle = `Average ${yAxisTitle} from ${vis.selected.timeInterval.min}-${vis.selected.timeInterval.max}`;

    // Append x-axis title to svg
    vis.chartArea.selectAll('.barchart-x-axis-title')
        .data([xAxisTitle])
      .join('text')
        .attr('class', 'axis-title barchart-x-axis-title')
        .attr('y', vis.height + 25)
        .attr('x', vis.width)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(xAxisTitle);
  
    if (yAxisTitle) {
      // Append y-axis title to svg
      vis.chartArea.selectAll('.barchart-y-axis-title')
          .data([yAxisTitle])
        .join('text')
          .attr('class', 'axis-title barchart-y-axis-title')
          .attr('y', -vis.config.margin.top + 10)
          .attr('x', -vis.config.margin.left)
          .attr('dy', '.71em')
          .style('text-anchor', 'start')
          .text(newYAxisTitle);
    }
  }

  /**
   * Purpose: Returns a default timeInterval such that 
   *          min is the earliest year of dataset and 
   *          max is the most recent year of dataset   
   * @returns {Object} timeInterval = {min, max} : 
   *                   min, max are the lowerBound and upperBound years of the interval respectively
   */
  getDefaultTimeInterval() {
    let vis = this;

    let years = vis.data.map(d => d.Year);

    let timeInterval = {};
    timeInterval.min = d3.min(years);
    timeInterval.max = d3.max(years);

    return timeInterval;
  }

  getColourOfLegendBoxes(d) {
    let vis = this;
    let {colour, legend} = vis.config;
    const {SELECTED_COUNTRY, OTHER_COUNTRIES} = legend.labelText;

    switch (d) {
      case SELECTED_COUNTRY:
        return colour.comparisonCountry;
      case OTHER_COUNTRIES:
      default:
        return colour.selectedCountry;
    }
  }

  /**
   * Purpose: Renders x- and y-axis groups
   */
  renderAxisGroups() {
    let vis = this;
  
    vis.xAxisG
      .call(vis.xAxis)
      .attr('transform', `translate(0 ,${vis.height})`);

    vis.yAxisG
      .call(vis.yAxis)
  }

  /**
   * Purpose: Returns all the averages in the aggregatedData array
   * @returns {Array} of numbers
   */
  getAllAverages() {
    let vis = this;
    return vis.aggregatedData.map(d => d.avg);
  }

  /**
   * Purpose: Returns an array of objects containing 
   *          regions/countries paired with their averages for the indicator of interest
   * TODO: Need to implement ability to aggregate by both region and country. Currently can only aggregate via CountryName
   * @param {Array} selectedAreas
   * @param {string} indicator 
   * @param {Object} timeInterval = {min: YYYY, max: YYYY}
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
    // TODO: Allow regions to also be aggregated if regions are selected
    let res = d3.rollups(dataOfInterest, v => d3.mean(v, d => d.Value), d => d.CountryName);
    res = Array.from(res, ([key, avg]) => ({ key, avg }));

    return res;
  }

  /**
   * Purpose: Renders bars using enter-update-exit pattern
   * TODO: Need to style bar-width when no comparison areas are selected and there is only focusedArea
   */
  renderBars() {
    let vis = this;

    // TODO: Need to style bar-width when no comparison areas are selected and there is only focusedArea
    // Bind data to visual elements
    const bars = vis.chart.selectAll('.bar')
        .data(vis.aggregatedData, vis.xValue)
      .join('rect')
        .attr('class', d => `bar bar-${d.key.toLowerCase()}`)
        .attr('x', d => vis.xScale(vis.xValue(d)))
        .attr('y', d => vis.yScale(vis.yValue(d)))
        .attr('width', vis.xScale.bandwidth())
        .attr('height', d => vis.getBarHeight(d))
        .attr('fill', d => vis.getBarColour(d))
        .on('mouseover', e => vis.handleMouseOver(e))
        .on('mouseleave', e => vis.handleMouseLeave(e))
        .on('click', (e) => vis.handleClick(e));
    }

  /**
   * Purpose: Returns colour depending on state/status of bar/bar data
   * @param {Object} data = ex. {key: "World", avg: 4019} 
   */
  getBarColour(data) {
    let vis = this;
  
    let isSelectedArea =  data.key === vis.selected.area.country 
                          || data.key === vis.selected.area.region;

    let isHovered = false;

    if (isHovered) {
      return vis.config.colour.hoveredBar;
    } else if (isSelectedArea) {
      return vis.config.colour.selectedCountry;
    } else {
      return vis.config.colour.comparisonCountry;
    }
  }

  /**
   * Purpose: Returns a calculated height for country's bar
   * @param {Object} data = ex. {key: "Canada", avg: 0}
   * @returns {Number} : height of bar
   */
  getBarHeight(data) {
    let vis = this;

    let height = vis.height - vis.yScale(vis.yValue(data));
    return height ? height : 0;
  }

  /**
   * Purpose: Returns a filtered array containing only items that fit the selectedItems
   * TODO: Need to adjust to incorporate regions
   * @param {Array} dataArr 
   * @param {Selected} selectedItems 
   * @returns {Array} of objects
   */
  filterData(dataArr, selectedItems) {
    let {allSelectedAreas, indicator, timeInterval} = selectedItems;
    let isWithinTimeInterval = d => d.Year >= timeInterval.min && d.Year <= timeInterval.max;

    // TODO: Need to adjust to incorporate regions
    let filtered = dataArr.filter(d => allSelectedAreas.includes(d.CountryName) 
                                        && d.IndicatorName === indicator 
                                        && isWithinTimeInterval(d));

                                        console.log(filtered)
    return filtered;
  }

  handleMouseOver(event) {
    //TODO
  }

  handleMouseLeave(event) {
    //TODO
  }

  handleClick(event) {
    //TODO
  }
  
}