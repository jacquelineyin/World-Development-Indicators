class LineChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _selectedItems) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 900,
      containerHeight: _config.containerHeight || 600,
      legendWidth: 250,
      margin: _config.margin || { top: 25, right: 100, bottom: 100, left: 100 }
    }
    this.selected = _selectedItems;
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
      .tickSize(-vis.width)
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

    // Initialize clipping mask that covers the whole chart
    vis.lines.append('defs')
      .append('clipPath')
      .attr('id', 'chart-mask')
      .append('rect')
      .attr('width', vis.width)
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', vis.height);

    // Apply clipping mask to 'vis.chart' to clip semicircles at the very beginning and end of a year
    vis.lines = vis.lines.append('g')
      .attr('clip-path', 'url(#chart-mask)');


    vis.countries = vis.lines.append('g')
      .attr('class', 'countries');

    vis.legends = vis.chart.append('g')
      .attr('class', 'legend');
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    const selectedCountries = vis.selected.allSelectedAreas;
    const selectedIndicator = vis.selected.indicator;
    const selectedYears = vis.selected.selectedYears;
    const filteredSelectedData = vis.data.filter(d => d.IndicatorName == selectedIndicator
      && selectedCountries.includes(d.CountryName) && selectedYears.includes(d.Year));

    filteredSelectedData.forEach(d => {
      delete d.CountryCode;
      delete d.IndicatorCode;
      delete d.Value;
    })

    const countryGroups = d3.groups(filteredSelectedData, d => d.CountryName);

    vis.formattedData = [];
    countryGroups.forEach(g => {
      const obj = {
        countryName: g[0],
        values: g[1]
      }
      vis.formattedData.push(obj);
    })

    console.log(vis.formattedData);

    // Specificy x- and y-accessor functions
    vis.xValue = d => d.Year;
    vis.yValue = d => d.value;

    // Initialize line generator
    vis.line = d3.line()
      .curve(d3.curveBasis)
      .x(d => vis.xScale(d.Year))
      .y(d => vis.yScale(d.value));

    // Set the scale input domains
    vis.xScale.domain(d3.extent(vis.formattedData[0].values, d => d.Year));
    vis.yScale.domain([0, d3.max(vis.formattedData[0].values, d => d.value)]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    const legend = vis.legends.selectAll('g')
      .data(vis.formattedData)
      .join('g')
      .attr('class', 'legend');

    legend.append('rect')
      .attr('x', (d, i) => (i * 100) + 130)
      .attr('y', vis.config.containerHeight - 60)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d, i) => vis.colorScale(i));

    legend.append('text')
      .attr('x', (d, i) => (i * 100) + 145)
      .attr('y', vis.config.containerHeight - 50)
      .text(function (d) {
        return d.countryName;
      });

    // Add line path
    vis.countries.selectAll('.country')
      .data(vis.formattedData)
      .join('g')
      .attr('class', 'country')
      .append('path')
      .attr('class', 'line')
      .attr('d', (d) => vis.line(d.values))
      .style('stroke', (d, i) => vis.colorScale(i));

    // MAYBE: add labels next to lines
    // vis.lines.selectAll('.country')
    //   .append('text')
    //   .datum(function (d) {
    //     return {
    //       countryName: d.countryName,
    //       values: d.values[d.values.length - 1]
    //     };
    //   })
    //   .attr('transform', function (d) {
    //     return `translate(${vis.xScale(d.values.Year)}, ${vis.yScale(d.values.value) + 20})`;
    //   })
    //   .attr('x', 3)
    //   .attr('dy', '.35em')
    //   .text(function (d) {
    //     return d.countryName;
    //   });

    const mouseG = vis.lines.append('g')
      .attr('class', 'mouse-over-effects');

    mouseG.append('path') // this is the black vertical line to follow mouse
      .attr('class', 'mouse-line')
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    const lines = document.getElementsByClassName('line');

    const mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(vis.formattedData)
      .join('g')
      .attr('class', 'mouse-per-line');

    mousePerLine.append('circle')
      .attr('r', 7)
      .style('stroke', (d, i) => vis.colorScale(i))
      .style('fill', 'none')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    mousePerLine.append('text')
      .attr('transform', `translate(10,3)`);

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', vis.width) // can't catch mouse events on a g element
      .attr('height', vis.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function () { // on mouse out hide line, circles and text
        d3.select('.mouse-line')
          .style('opacity', '0');
        d3.selectAll('.mouse-per-line circle')
          .style('opacity', '0');
        d3.selectAll('.mouse-per-line text')
          .style('opacity', '0');
      })
      .on('mouseover', function () { // on mouse in show line, circles and text
        d3.select('.mouse-line')
          .style('opacity', '1');
        d3.selectAll('.mouse-per-line circle')
          .style('opacity', '1');
        d3.selectAll('.mouse-per-line text')
          .style('opacity', '1');
      })
      .on('mousemove', function (event) { // mouse moving over canvas
        const mouse = d3.pointer(event, this)[0];
        d3.select('.mouse-line')
          .attr('d', function () {
            let d = 'M' + mouse + ',' + vis.height;
            d += ' ' + mouse + ',' + 0;
            return d;
          });

        d3.selectAll('.mouse-per-line')
          .attr('transform', function (d, i) {
            let beginning = 0;
            let end = lines[i].getTotalLength();
            let target = null;

            while (true) {
              target = Math.floor((beginning + end) / 2);
              var pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse) {
                break;
              }
              if (pos.x > mouse) end = target;
              else if (pos.x < mouse) beginning = target;
              else break; //position found
            }

            d3.select(this).select('text')
              .text(vis.yScale.invert(pos.y).toFixed(2));

            return `translate(${mouse},${pos.y})`;
          });
      });

    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}


