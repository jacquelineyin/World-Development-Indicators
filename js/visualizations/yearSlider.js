class YearSlider {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _dispatcher, _dispatcherEvents) {
    this.config = {
      parentElement: _config.parentElement,
      width:  1500,
      height: 1500,
      contextHeight: 50,
      margin: {top: 10, right: 10, bottom: 100, left: 45},
      contextMargin: {top: 280, right: 10, bottom: 20, left: 25},
    }
    this.data = _data;
    this.dispatcher = _dispatcher;
    this.dispatcherEvents = _dispatcherEvents;
    this.initVis();
  }
  
  /**
   * Initialize scales/axes and append static chart elements
   */
  initVis() {
    let vis = this;

    const containerWidth = vis.config.width + vis.config.margin.left + vis.config.margin.right;
    const containerHeight = vis.config.height + vis.config.margin.top + vis.config.margin.bottom;
  
    vis.xScale = d3.scaleTime()
        .rangeRound([0, vis.config.width]);
  
    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSizeOuter(0)
      .ticks(52);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', containerWidth)
        .attr('height', containerHeight);

    // Append chart group with x- and y-axes
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(200,100)rotate(90)`);
    //.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);


    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis slider')
        .attr('transform', `translate(0,20)`);

    vis.brushG = vis.chart.append('g')
        .attr('class', 'brush x-brush')
        .attr('id', 'x-brush');


    // Initialize brush component
    vis.brush = d3.brushX()
        .extent([[0, 0], [vis.config.width, vis.config.contextHeight]])
        .on("end", (e) => vis.brushended(e));
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    
    vis.xValue = d => d.year;

    // Set the scale input domains
    vis.xScale.domain(d3.extent(vis.data, vis.xValue));
  
    vis.renderVis();
  }

  /**
   * This function contains the D3 code for binding data to visual elements
   */
  renderVis() {
    let vis = this;

    
    // Update the axes
    vis.xAxisG.call(vis.xAxis);

    // Update the brush and define a default position
    vis.brushG
        .call(vis.brush)
        .call(vis.brush.move, [0, 140]);
  }

  /**
   * React to brush events
   */

  brushended(event) {
    let vis = this;
    let brushGroup = document.getElementById('x-brush');

    const selection = event.selection;
    if (!event.sourceEvent || !selection) return;
    const selectedDomain = selection.map(vis.xScale.invert, vis.xScale);
    const selectedYears = [];
    const minYear = selectedDomain[0].getFullYear();
    const maxYear = selectedDomain[1].getFullYear();
    for (let year = minYear; year <= maxYear; year++) {
      selectedYears.push(year.toString());
    }

    vis.dispatcher.call(vis.dispatcherEvents.FILTER_YEAR, brushGroup, selectedYears);

    const d0 = selection.map(vis.xScale.invert)
    const d1 = d0.map(d3.timeYear.round);

    // If empty when rounded, use floor & ceil instead.
    if (d1[0] >= d1[1]) {
      d1[0] = d3.timeYear.floor(d0[0]);
      d1[1] = d3.timeYear.offset(d1[0]);
    }

    d3.select(brushGroup).call(vis.brush.move, d1.map(vis.xScale));
  }
}