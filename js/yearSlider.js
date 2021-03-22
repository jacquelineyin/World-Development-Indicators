class YearSlider {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        width:  1500,
        height: 50,
        contextHeight: 50,
        margin: {top: 10, right: 10, bottom: 100, left: 45},
        contextMargin: {top: 280, right: 10, bottom: 20, left: 25}
      }
      this.data = _data;
      this.initVis();
    }
    
    /**
     * Initialize scales/axes and append static chart elements
     */
    initVis() {
      let vis = this;
  
      const containerWidth = vis.config.width + vis.config.margin.left + vis.config.margin.right;
      const containerHeight = vis.config.height + vis.config.margin.top + vis.config.margin.bottom;
    
      vis.xScaleContext = d3.scaleTime()
          .range([0, vis.config.width]);
    
      // Initialize axes
      vis.xAxisContext = d3.axisBottom(vis.xScaleContext)
        .tickSizeOuter(0)
        .tickFormat(d3.format('d'))
        .ticks(25);
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', containerWidth)
          .attr('height', containerHeight);
  
      // Append context group with x- and y-axes
      vis.context = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.contextMargin.left}, 0)`);
  
      vis.contextAreaPath = vis.context.append('path')
          .attr('class', 'chart-area');
  
      vis.xAxisContextG = vis.context.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,20)`);
  
      vis.brushG = vis.context.append('g')
          .attr('class', 'brush x-brush');
  
  
      // Initialize brush component
      vis.brush = d3.brushX()
          .extent([[0, 0], [vis.config.width, vis.config.contextHeight]])
          .on('brush', function({selection}) {
            if (selection) vis.brushed(selection);
          })
          .on('end', function({selection}) {
            if (!selection) vis.brushed(null);
          });
    }
  
    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
      let vis = this;
      
      vis.xValue = d => d.Year;
  
      // Set the scale input domains
      vis.xScaleContext.domain(d3.extent(vis.data, vis.xValue));
    
      vis.renderVis();
    }
  
    /**
     * This function contains the D3 code for binding data to visual elements
     */
    renderVis() {
      let vis = this;
 
      
      // Update the axes
      vis.xAxisContextG.call(vis.xAxisContext);
  
      // Update the brush and define a default position
      vis.brushG
          .call(vis.brush)
          .call(vis.brush.move, [0,94]);
    }
  
    /**
     * React to brush events
     */
    brushed(selection) {
      let vis = this;
  
      // Check if the brush is still active or if it has been removed
      if (selection) {
        // Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
        const selectedDomain = selection.map(vis.xScaleContext.invert, vis.xScaleContext);
  
        // Update x-scale of the focus view accordingly
        //vis.xScaleFocus.domain(selectedDomain);
      } else {
        // Reset x-scale of the focus view (full time period)
        //vis.xScaleFocus.domain(vis.xScaleContext.domain());
      }
    }
  }