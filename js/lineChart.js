class LineChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _selectedItems) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 50, right: 300, bottom: 70, left: 50 }
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

    // Replace the 'G' (Giga) SI-prefix of d3 with 'B' to stand for 'Billion' when formatting
    let format = (strInput) => d3.format('.2~s')(strInput).replace(/G/, 'B');

    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSize(-vis.height - 4)
      .tickSizeOuter(0)
      .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickSize(-vis.width - 20)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat(format);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('viewBox', `0 0 ${vis.config.containerWidth} ${vis.config.containerHeight}`);

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

    vis.countries = vis.lines.append('g')
      .attr('class', 'countries');

    vis.legend = vis.chart.append('g')
      .attr('class', 'legend');

    vis.values = vis.chart.append('g')
      .attr('class', 'values');

    vis.yearValue = vis.svg.append('text')
      .attr('class', 'yearValue')
      .attr('y', 20)
      .attr('x', vis.width + 180)
      .attr('dy', '.71em');

    vis.mouseG = vis.lines.append('g')
      .attr('class', 'mouse-over-effects');

    vis.svg.append('text')
      .attr('class', 'axis-title')
      .attr('y', 20)
      .attr('x', 10)
      .attr('dy', '.71em')
      .text('Total ' + vis.selected.indicator);

      vis.updateVis();
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    const selectedCountries = vis.selected.allSelectedAreas;
    const selectedIndicator = vis.selected.indicator;
    const selectedYears = vis.selected.selectedYears;
    const filteredSelectedData = vis.data.filter(d => d.IndicatorName === selectedIndicator
      && selectedCountries.includes(d.CountryName) && selectedYears.includes(d.Year));

    // group data by country
    const countryGroups = d3.groups(filteredSelectedData, d => d.CountryName);

    // re-arrange data
    vis.formattedData = [];

    countryGroups.forEach(g => {
      const obj = {
        countryName: g[0],
        values: g[1]
      }
      if (obj.countryName === vis.selected.area.country) {
        vis.formattedData.unshift(obj);
      } else {
        vis.formattedData.push(obj);
      }
    });

    // Specificy x- and y-accessor functions
    vis.xValue = d => d.year;
    vis.yValue = d => d.value;
    vis.colorValue = d => d.countryName;

    // Initialize line generator
    vis.line = d3.line()
      .x(d => vis.xScale(d.year))
      .y(d => vis.yScale(d.value));

    // Set the scale input domains
    vis.colorScale.domain(vis.selected.allSelectedAreas);
    vis.xScale.domain(d3.extent(filteredSelectedData, d => d.year));
    vis.yScale.domain([0, d3.max(filteredSelectedData, d => d.value)]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    vis.legend.selectAll('.legend-box')
      .data(vis.formattedData, d => d.values)
      .join('rect')
      .attr('class', 'legend-box')
      .attr('x', (d, i) => {
        return (i * 200) + 10;
      })
      .attr('y', vis.config.containerHeight - 85)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d, i) => {
        if(d.countryName === vis.selected.area.country) {
          return 'gold'
      } else {
        return vis.colorScale(i);
      }});

    vis.legend.selectAll('.box-label')
      .data(vis.formattedData, d => d.values)
      .join('text')
      .attr('class', 'box-label')
      .attr('x', (d, i) => (i * 200) + 25)
      .attr('y', vis.config.containerHeight - 75)
      .text(d => d.countryName);

    const compareValues = vis.values.selectAll('g')
      .data(vis.formattedData, d => d.values)
      .join('g')
      .attr('class', 'value');

    compareValues.append('text')
      .attr('x', vis.width + 130)
      .attr('y', (d, i) => {
        return (i * 20) + 5
      });

    // Add line path
    vis.countries.selectAll('.line')
      .data(vis.formattedData, d => d.values)
      .attr('class', d => d.countryName)
      .join('path')
      .attr('class', 'line')
      .attr('d', (d) => vis.line(d.values))
      .style('stroke', (d, i) => {
        if(d.countryName === vis.selected.area.country) {
          return 'gold'
      } else {
        return vis.colorScale(i);
      }});

    const mouseG = vis.mouseG.selectAll('.mouseG')
      .data(vis.formattedData, d => d.values)
      .join('g')
      .attr('class', 'mouseG');

    mouseG.append('path') // this is the black vertical line to follow mouse
      .attr('class', 'mouse-line')
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    const mousePerLine = vis.mouseG.selectAll('.mouse-per-line')
      .data(vis.formattedData, d => d.values)
      .join('g')
      .attr('class', 'mouse-per-line');

    mousePerLine.append('circle')
      .attr('r', 7)
      .style('stroke', (d, i) => {
        if(d.countryName === vis.selected.area.country) {
          return 'gold'
      } else {
        return vis.colorScale(i);
      }})
      .style('fill', 'none')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    mousePerLine.append('text')
      .attr('class', 'mouse-text')
      .attr('transform', `translate(10,3)`);

    mouseG.append('rect') // append a rect to catch mouse movements on canvas
      .attr('width', vis.width) // can't catch mouse events on a g element
      .attr('height', vis.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', () => { // on mouse out hide line, circles and text
        d3.select('.mouse-line')
          .style('opacity', '0');
        d3.selectAll('.mouse-per-line circle')
          .style('opacity', '0');
        d3.selectAll('.mouse-per-line text')
          .style('opacity', '0');
        d3.selectAll('.value')
          .style('opacity', '0');
        d3.select('.yearValue')
          .style('opacity', '0');
      })
      .on('mouseover', () => { // on mouse in show line, circles and text
        d3.select('.mouse-line')
          .style('opacity', '1');
        d3.selectAll('.mouse-per-line circle')
          .style('opacity', '1');
        d3.selectAll('.mouse-per-line text')
          .style('opacity', '1');
        d3.selectAll('.value')
          .style('opacity', '1');
        d3.select('.yearValue')
          .style('opacity', '1');
      })
      .on('mousemove', function (event) { // mouse moving over canvas
        const mouse = d3.pointer(event, this)[0];
        const formatNumbers = d3.format(',');

        d3.selectAll('.mouse-per-line')
          .attr('transform', function (d, i) {
            const xDate = vis.xScale.invert(mouse);
            const bisect = d3.bisector(d => d.year).left;
            const idx = bisect(d.values, xDate);
            const currentYear = d.values[idx].Year;
            d3.select(this).select('text')
              .text(formatNumbers(vis.yScale.invert(vis.yScale(d.values[idx].value)).toFixed(0)));

            d3.selectAll('.value').select('text')
              .text(d => d.countryName + ': ' + formatNumbers(vis.yScale.invert(vis.yScale(d.values[idx].value)).toFixed(0)));
            
            d3.select('.yearValue')
              .text(currentYear);

            vis.svg.select('.mouse-line')
              .attr('d', function () {
                var data = 'M' + vis.xScale(d.values[idx].year) + ',' + vis.height;
                data += ' ' + vis.xScale(d.values[idx].year) + ',' + 0;
                return data;
              });

            return `translate(${vis.xScale(d.values[idx].year)},${vis.yScale(d.values[idx].value)})`;
          });
      });

    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}


