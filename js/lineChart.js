class LineChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 900,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 25, right: 20, bottom: 30, left: 50 }
    }
    this.data = _data;
    this.initVis();
  }

  /**
   * Initialize scales/axes and append static chart elements
   */
  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    vis.xScale = d3.scaleTime()
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0])
      .nice();

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(6)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat(d3.format('d'));

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(6)
      .tickSizeOuter(0)
      .tickPadding(10);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);
      
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    // We need to make sure that the tracking area is on top of other chart elements
    vis.lines = vis.chart.append('g')
      .attr('class', 'lines');
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    // const newData = [];

    // vis.data.forEach((d) => {
    //   const obj = {
    //     countryName: d.CountryName,
    //     values: [
    //       { year: d.year, avg: d.value }
    //     ]
    //   }
    //   newData.push(obj);
    // })

    // vis.newData = newData;
    // console.log(vis.newData);
    //const aggregatedDataMap = d3.rollups(newData, v => d3.mean(v, d => d.avg), d => d.countryName);
    //vis.aggregatedData = Array.from(aggregatedDataMap, ([country, years]) => ({ country, years }));

    //console.log(vis.aggregatedData.years);
    // Specificy x- and y-accessor functions
    vis.xValue = d => d.year;
    vis.yValue = d => d.value;
    // Initialize line generator
    vis.line = d3.line()
      .curve(d3.curveBasis)
      .x(d => vis.xScale(d.year))
      .y(d => vis.yScale(d.avg));

    // Set the scale input domains
    vis.xScale.domain(d3.extent(vis.data[0].values, d => d.year));
    vis.yScale.domain([0, d3.max(vis.data[0].values, d => d.avg)]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // Add line path
    vis.lines.selectAll('.line-group')
    .data(vis.data)
    .enter()
    .append("g")
    .attr("class", "line-group")
    .on("mouseover", function (d, i) {
      vis.svg
        .append("text")
        .attr("class", "title-text")
        .style("fill", vis.colorScale(i))
        .text(d.countryName)
        .attr("text-anchor", "middle")
        .attr("x", (vis.config.containerWidth - 50) / 2)
        .attr("y", 5);
    })
    .on("mouseout", function (d) {
      vis.svg.select(".title-text").remove();
    })
    .append("path")
    .attr("class", "line")
    .attr("d", (d) => vis.line(d.values))
    .style("stroke", (d, i) => vis.colorScale(i));


    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}


