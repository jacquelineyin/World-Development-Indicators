class BarChart {

  /**
   * Class constructor with initial configuration
   * @param {Object} _config : object holding configuration settings
   * @param {Array} _data : given data array
   * @param {Selected} _selectedItems : Selected class object holding selectedItem values
   * @param {Object} _dispatcher : d3 dispatcher
   */
  constructor(_config, _data, _selectedItems, _dispatcher, _constants) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 50, right: 320, bottom: 70, left: 50 },
      colour: _config.colour || { selectedCountry: 'blue', comparisonCountry: 'green' },
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
      tooltip: _config.tooltip || { padding: 15 },
    }
    this.data = _data;
    this.dispatcher = _dispatcher;
    this.constants = _constants || { countries: new Countries(), indicators: new Indicators() };
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
      .attr('viewBox', `0 0 ${vis.config.containerWidth} ${vis.config.containerHeight}`);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chartArea = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.chart = vis.chartArea.append('g');

    vis.aggregatedData = vis.getAverages(vis.selected);

    // Initialize scales, axes, static elements, etc.
    vis.initScales();
    vis.initAxes();

    // Append axis groups
    vis.appendAxisGroups();

    // Update separator for positive and negative values
    vis.appendSeparatorLine();

    
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

    // // Update separator line's positioning if applicable
    // vis.hasNegMin() ? vis.updateSeparatorLine() : null;

    // Update Scale domains
    // polylinear scale
    let averages = vis.getAllAverages();
    let [min, max] = d3.extent(averages);
    console.log('min, max', min, max)
    vis.yScalePos.domain([0, max]);
    vis.yScaleNeg.domain([min, max])
    vis.xScale.domain(vis.selected.allSelectedAreas);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    // Bind data to visual elements, update axes
    vis.renderBarElems();

    // Update axes
    vis.renderAxisGroups();

    // Render separator line if applicable
    vis.hasNegMin() ? vis.showSeparatorLine() : vis.hideSeparatorLine();
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

    // Handles pos values
    vis.yScalePos = d3.scaleLinear()
      .range([vis.height, 0]);
    
    // If has neg vals, we need a different scale for drawing the y-axis. It needs
    // a reversed range, and a larger domain to accomodate negaive values.
    vis.yScaleNeg = d3.scaleLinear()
      .range([vis.height, 0]);
  }

  /**
   * Purpose: Initializes x- and y-axes
   */
  initAxes() {
    let vis = this;

    // Replace the 'G' (Giga) SI-prefix of d3 with 'B' to stand for 'Billion' when formatting
    let format = (strInput) => d3.format('.2~s')(strInput).replace(/G/, 'B');

    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSizeOuter([0]);

    vis.yAxisPos = d3.axisLeft(vis.yScalePos)
      .tickSize(-vis.width)
      .tickSizeOuter([0])
      .tickPadding(10)
      .tickFormat(format);

    vis.yAxisNeg = d3.axisLeft(vis.yScaleNeg)
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
    const { SELECTED_COUNTRY, OTHER_COUNTRIES } = vis.config.legend.labelText;
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
    const { SELECTED_COUNTRY, OTHER_COUNTRIES } = vis.config.legend.labelText;
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

  /**
   * Purpose: Returns a colour based off the country of the data given
   * @param {Object} d = {key: <string>, avg: <Number>} : key is country name 
   * @returns {string} representing a hex colour
   */
  getColourOfLegendBoxes(d) {
    let vis = this;
    let { colour, legend } = vis.config;
    const { SELECTED_COUNTRY, OTHER_COUNTRIES } = legend.labelText;

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
    let yAxis = vis.hasNegMin() ? vis.yAxisNeg : vis.yAxisPos;

    vis.xAxisG
      .call(vis.xAxis)
      .attr('transform', `translate(0 ,${vis.height})`);

    vis.yAxisG
      .call(yAxis);
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
    let res = d3.rollups(dataOfInterest, v => d3.mean(v, d => d.Value), d => d.CountryName);
    res = Array.from(res, ([key, avg]) => ({ key, avg }));

    return res;
  }

  /**
   * Purpose: Renders bars using enter-update-exit pattern
   */
  renderBarElems() {
    let vis = this;
    // Bind data to visual elements

    // Create group
    const { barG, barGEnter } = vis.createBarGroup();

    // Append and render grouped elems
    vis.renderBars(barG, barGEnter);
    // vis.renderBarLabels(barG, barGEnter);
  }

  /**
   * Purpose: Renders bar labels by appending them to .barG elems using 'enter-update-exit' pattern
   * @param {Selection} barG : d3 selection of .barG elems
   * @param {Selection} barGEnter : d3 selection of .barG.enter().append('g') elems
   */
  renderBarLabels(barG, barGEnter) {
    let vis = this;

    // Round averages and format them with commas for thousands
    let round = (val) => d3.format('d')(val);
    let format = (val) => d3.format(',')(round(val));

    // Bind data to selection
    const barText = barG.merge(barGEnter).selectAll('.bar-label')
      .data(d => [d]);

    // Enter
    const barTextEnter = barText.enter().append('text')
      .attr('class', d => `bar-label bar-label-${vis.constants.countries.getKey(d.key)}`);

    // Enter + Update
    barTextEnter.merge(barText)
      .attr('x', (d) => vis.xScale(vis.xValue(d)) + (vis.xScale.bandwidth() / 2))
      .attr('y', (d) => vis.getYPosOfBarLabel(d))
      .attr('display', d => isNaN(d.avg) ? 'block' : 'none')
      .attr('text-anchor', 'middle')
      .text(d => isNaN(d.avg) ? 'N/A' : format(d.avg));

    // Exit
    barText.exit().remove();
  }

  /**
   * Purpose: Renders bars by appending them to .barG elems using 'enter-update-exit' pattern
   * @param {Selection} barG : d3 selection of .barG elems 
   * @param {Selection} barGEnter : d3 selection of .barG.enter().append('g') elems
   */
  renderBars(barG, barGEnter) {
    let vis = this;

    // Bind data to selection
    const bars = barG.merge(barGEnter).selectAll('.bar')
      .data(d => [d]);

    // Enter
    const barsEnter = bars.enter().append('rect')
      .attr('class', d => `bar bar-${vis.constants.countries.getKey(d.key)}`);

    // Enter + Update
    barsEnter.merge(bars)
      .attr('x', d => vis.xScale(vis.xValue(d)))
      .attr('y', d => vis.getYPosOfBar(d))
      .attr('width', vis.xScale.bandwidth())
      .attr('height', d => vis.getBarHeight(d))
      .attr('fill', d => vis.getBarColour(d))
      .on('mouseover', e => vis.handleMouseOver(e))
      .on('mouseleave', e => vis.handleMouseLeave(e));

    // Exit
    bars.exit().remove();
  }

  getYPosOfBar(d) {
    let vis = this;
    let hasNegDomain = vis.hasNegMin();
    let val = d.avg;
    let yScale = hasNegDomain ? vis.yScaleNeg : vis.yScalePos;
    let yPos; 
    console.log(hasNegDomain);
    console.log(val <= 0);
    
    if (hasNegDomain && val <= 0) {
      yPos = yScale(0);
      console.log(yPos)
    } else {
      yPos = yScale(val);
    }
    console.log(yPos)

    return yPos;
    // return vis.height - Math.max(0, yScale(vis.yValue(d)));
  }

  /**
   * Purpose: Creates (and updates) a group ('g') element to hold bar elements
   *          Uses 'enter-update-exit' pattern
   * @returns { Selection, Selection } : d3 selection of all .barG elements
   */
  createBarGroup() {
    let vis = this;

    // Bind data to selection
    const barG = vis.chart.selectAll('.barG')
      .data(vis.aggregatedData, vis.xValue);

    // Enter
    const barGEnter = barG.enter().append('g')
      .attr('class', 'barG');

    // Enter + Update
    barGEnter.merge(barG);

    // Exit
    barG.exit().remove();

    return { barG, barGEnter };
  }

  /**
   * Purpose: Returns a y-position of bar label
   * @param {Object} d = {key: <string>, avg: <Number>}
   * @returns {Integer} : y-position of bar label
   */
  getYPosOfBarLabel(d) {
    let vis = this;
    const bottomPaddingOffset = 5;

    let yPos = vis.yScalePos(vis.yValue(d)) + 15;

    if (yPos > vis.height) {
      yPos = vis.yScalePos(vis.yValue(d)) - bottomPaddingOffset;
    }

    return yPos ? yPos : vis.height - bottomPaddingOffset;
  }

  /**
   * Purpose: Returns colour depending on state/status of bar/bar data
   * @param {Object} data = ex. {key: "World", avg: 4019} 
   */
  getBarColour(data) {
    let vis = this;

    let isSelectedArea = data.key === vis.selected.area.country
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
    let height;
    let domainHasNeg = vis.hasNegMin();
    let yScale = domainHasNeg ? vis.yScaleNeg : vis.yScalePos;
    let yPos;
    let val = vis.yValue(data);

    if (domainHasNeg) {
      if (val < 0) {
        height = vis.height - yScale(0);
      } else {
        height = yScale(0)
      }
    } else {
      yPos = yScale(val);
      height = vis.height - yPos;
      height = height ? height : 0;

    }
    console.log(height);
    return height;
  }

  /**
   * Purpose: Returns a filtered array containing only items that fit the selectedItems
   * @param {Array} dataArr 
   * @param {Selected} selectedItems 
   * @returns {Array} of objects
   */
  filterData(dataArr, selectedItems) {
    let { allSelectedAreas, indicator, timeInterval } = selectedItems;
    let isWithinTimeInterval = d => d.Year >= timeInterval.min && d.Year <= timeInterval.max;

    let filtered = dataArr.filter(d => allSelectedAreas.includes(d.CountryName)
      && d.IndicatorName === indicator
      && isWithinTimeInterval(d));

    return filtered;
  }

  /**
   * Purpose: Handles mouseover event by creating a stroke around target bar 
   *          and calling dispatcher for other chart interactions
   * @param {Event} event : Native JS event (i.e. 'mouseover')
   */
  handleMouseOver(event) {
    let vis = this;

    const { labelClass, barClass, countryKey } = vis.getClassesOfBarElems(event);

    // Display value of country
    const targetLabel = vis.chart.selectAll(labelClass);
    targetLabel.attr('display', 'block');

    // Emphasize target bar
    const targetBar = vis.chart.selectAll(barClass);
    targetBar.attr('stroke', 'black');

    // Dispatch dispatchEvent
    const country = vis.constants.countries[countryKey];
    dispatcher.call(dispatcherEvents.BAR_HOVER, vis, country);
  }

  /**
   * Purpose: Returns the classes of the bar that triggered the event and its label
   * @param {Event} event : native JS event (i.e. 'mouseover'/'mouseleave')
   * @returns {Object} = {labelClass: <string>, barClass: <string>}
   */
  getClassesOfBarElems(event) {
    const { target } = event;
    const classes = target.className.baseVal.split(' ');
    const countryKey = classes[1].split('-')[1];

    const labelClass = `.bar-label-${countryKey}`;
    const barClass = `.bar-${countryKey}`;
    return { labelClass, barClass, countryKey };
  }

  /**
   * Purpose: Handles mouseleave event by removing strokes from target bar 
   *          and calling dispatcher for other chart interactions
   * @param {Event} event : Native JS event (i.e. 'mouseleave')
   */
  handleMouseLeave(event) {
    let vis = this;

    const { target } = event;
    const classes = target.className.baseVal.split(' ');
    const countryKey = classes[1].split('-')[1];
    const targetLabel = `.bar-label-${countryKey}`;

    // Hide value of country
    const label = vis.chart.selectAll(targetLabel);
    label.attr('display', 'none');

    // Remove stroke emphasis of any bar
    const bars = d3.selectAll('.bar');
    bars.attr('stroke', 'none')
      .attr('stroke-width', 2);

    // Dispatch dispatchEvent
    const country = vis.constants.countries[countryKey];
    dispatcher.call(dispatcherEvents.BAR_UNHOVER, vis, country);
  }

  appendSeparatorLine() {
    let vis = this;

    vis.chartArea.append('line')
      .attr('class', 'separator')
      .style('stroke', 'red')
      .style('stroke-width', 2)
      .attr('x1', 0)
      .attr('x2', vis.width)
      // .attr('y1', vis.getYPosOfBar({avg: 0}))//so that the line passes through the y 0
      // .attr('y2', vis.getYPosOfBar({avg: 0}))//so that the line passes through the y 0
      .style('visibility', 'hidden');
  }

  updateSeparatorLine() {
    let vis = this;
    let separator = vis.chartArea.selectAll('.separator');
    separator
      .attr('y1', () => {console.log( vis.getYPosOfBar({avg: 0})); return vis.getYPosOfBar({avg: 0})})//so that the line passes through the y 0
      .attr('y2', vis.getYPosOfBar({avg: 0}))//so that the line passes through the y 0
  }

  updateYAxisScale() {
    let vis = this;
    let averages = vis.getAllAverages();
    let [min, max] = d3.extent(averages);

    min = min > 0 ? 0: min;

    const range = vis.hasNegMin() ? [vis.height - vis.yScalePos(min), 0] : [vis.height, 0];
    console.log('min, max', min, max)
    vis.yScaleNeg.domain([min, max]).range(range);
  }

  showSeparatorLine() {
    let vis = this;
    
    vis.chartArea.selectAll('.separator')
    .attr('y1', () => {console.log( vis.getYPosOfBar({avg: 0})); return vis.getYPosOfBar({avg: 0})})//so that the line passes through the y 0
      .attr('y2', vis.getYPosOfBar({avg: 0}))//so that the line passes through the y 0
      .style('visibility', 'visible');
  }

  hideSeparatorLine() {
    let vis = this; 
    console.log('hide separator')
    vis.chartArea.selectAll('.separator')
    .style('visibility', 'hidden');
  }

  hasNegMin() {
    let vis = this;
    let averages = vis.getAllAverages();
    let [min, max] = d3.extent(averages);

    return min < 0;
  }

}