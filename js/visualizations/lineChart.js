class LineChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _selectedItems) {
    this.config = {
      parentElement: _config.parentElement,
      colour: _config.colour ||
      {
        selectedArea: 'blue',
        otherAreas: d3.schemeCategory10,
      },
      containerWidth: _config.containerWidth || 1500,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 50, right: 300, bottom: 110, left: 50 }
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

    vis.colorScale = d3.scaleOrdinal(vis.config.colour.otherAreas);

    vis.xScale = d3.scaleTime()
      .range([0, vis.width]);

    vis.yScalePos = d3.scaleLinear()
      .range([vis.height, 0]);

    vis.yScaleNeg = d3.scaleLinear()
      .range([vis.height, 0]);

    // Initialize axes

    // Replace the 'G' (Giga) SI-prefix of d3 with 'B' to stand for 'Billion' when formatting
    let format = (strInput) => d3.format('.2~s')(strInput).replace(/G/, 'B');

    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSize(-vis.height - 4)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat(d3.timeFormat('%Y'));

    vis.yAxisPos = d3.axisLeft(vis.yScalePos)
      .tickSize(-vis.width - 20)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat(format);

    vis.yAxisNeg = d3.axisLeft(vis.yScaleNeg)
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
      .attr('class', 'axis x-axis linechart')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis');

    // We need to make sure that the tracking area is on top of other chart elements
    vis.lines = vis.chart.append('g')
      .attr('class', 'lines');

    vis.countries = vis.lines.append('g')
      .attr('class', 'countries');

    // Need to fix redrawing
    vis.circles = vis.lines.append('g')
      .attr('class', 'circles')

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
      .y(d => {
        if (vis.selected.indicator === 'Inflation, GDP deflator (annual %)') {
          return vis.yScaleNeg(d.value)
        } else {
          return vis.yScalePos(d.value)
        }
      })
      .defined(d => { return d.value !== null });

    // Set the scale input domains
    vis.colorScale.domain(vis.selected.allSelectedAreas);
    vis.xScale.domain(d3.extent(filteredSelectedData, d => d.year));
    vis.yScalePos.domain([0, d3.max(filteredSelectedData, d => d.value), d3.max(filteredSelectedData, d => d.value)]);
    vis.yScaleNeg.domain(d3.extent(filteredSelectedData, d => d.value), d3.max(filteredSelectedData, d => d.value));


    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    vis.chart.selectAll('.y-axis-title')
      .data([vis.selected.indicator])
      .join('text')
      .attr('class', 'y-axis-title')
      .attr('y', -vis.config.margin.top + 10)
      .attr('x', -vis.config.margin.left)
      .attr('dy', '.71em')
      .style('font-weight', 'bold')
      .text('Total ' + vis.selected.indicator);

    vis.legend.selectAll('.legend-box')
      .data(vis.formattedData, d => d.values)
      .join('rect')
      .attr('class', 'legend-box')
      .attr('x', (d, i) => {
        return (i * 200) + 10;
      })
      .attr('y', vis.config.containerHeight - 75)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d, i) => vis.getColour(d, i));

    vis.legend.selectAll('.box-label')
      .data(vis.formattedData, d => d.values)
      .join('text')
      .attr('class', 'box-label')
      .attr('x', (d, i) => (i * 200) + 25)
      .attr('y', vis.config.containerHeight - 65)
      .text(d => d.countryName);

    vis.values.selectAll('text')
      .data(vis.formattedData, d => d.values)
      .join('text')
      .attr('class', 'value');

    // Add line path
    vis.countries.selectAll('.line')
      .data(vis.formattedData, d => d.values)
      .attr('class', d => d.countryName)
      .join('path')
      .attr('class', 'line')
      .attr('d', d => vis.line(d.values))
      .style('stroke', (d, i) => vis.getColour(d, i));

    // Add data points(dots) on line
    vis.circles.selectAll('.circle-group')
      .data(vis.formattedData)
      .join('g')
      .attr('class', 'circle-group')
      .style('fill', (d, i) => vis.getColour(d, i))
      .selectAll('circle')
      .data(d => d.values.filter(d => d.value !== null))
      .join('circle')
      .attr('class', 'circle')
      .attr('r', 3)
      .attr('cx', d => vis.xScale(d.year))
      .attr('cy', d => {
        if (vis.selected.indicator === 'Inflation, GDP deflator (annual %)') {
          return vis.yScaleNeg(d.value)
        } else {
          return vis.yScalePos(d.value)
        }
      });

    const mouseG = vis.mouseG.selectAll('.mouseG')
      .data(vis.formattedData, d => d.values)
      .join('g')
      .attr('class', 'mouseG');

    mouseG.append('path') // this is the black vertical line to follow mouse
      .attr('class', 'mouse-line')
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('display', 'none');

    const mousePerLine = vis.mouseG.selectAll('.mouse-per-line')
      .data(vis.formattedData, d => d.values)
      .join('g')
      .attr('class', 'mouse-per-line');

    mousePerLine.append('circle')
      .attr('class', 'mouseCircle')
      .attr('r', 7)
      .style('stroke', (d, i) => vis.getColour(d, i))
      .style('fill', 'none')
      .style('stroke-width', '1px')
      .style('display', 'none');

    mousePerLine.append('text')
      .attr('class', 'mouse-text')
      .attr('transform', `translate(10,3)`);

    mouseG.append('rect') // append a rect to catch mouse movements on canvas
      .attr('width', vis.width) // can't catch mouse events on a g element
      .attr('height', vis.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseleave', () => { // on mouse out hide line, circles and text
        d3.select('.mouse-line')
          .style('display', 'none');
        d3.selectAll('.mouse-per-line circle')
          .style('display', 'none');
        d3.selectAll('.mouse-per-line text')
          .style('display', 'none');
        d3.selectAll('.value')
          .style('display', 'none');
        d3.select('.yearValue')
          .style('display', 'none');
      })
      .on('mouseenter', () => { // on mouse in show line, circles and text
        d3.select('.mouse-line')
          .style('display', 'block');
        d3.selectAll('.mouse-per-line circle')
          .style('display', 'block');
        d3.selectAll('.mouse-per-line text')
          .style('display', 'block');
        d3.selectAll('.value')
          .style('display', 'block');
        d3.select('.yearValue')
          .style('display', 'block');
      })
      .on('mousemove', function (event) { // mouse moving over canvas
        const mouse = d3.pointer(event, this)[0];
        const formatNumbers = d3.format(',');

        d3.selectAll('.mouse-per-line')
          .attr('transform', function (d, i) {
            const xDate = vis.xScale.invert(mouse);
            const bisect = d3.bisector(d => d.year).left;
            const idx = bisect(d.values, xDate);
            const item = d.values[idx];
            if (item) {
              const currentYear = item.Year;

              if (vis.selected.indicator === 'Inflation, GDP deflator (annual %)') {
                d3.select(this).select('text')
                  .text(d => item.value !== null || item.value === 0 ?
                    formatNumbers(vis.yScaleNeg.invert(vis.yScaleNeg(item.value)).toFixed(2)) : null);

                d3.select('.values').selectAll('.value')
                  .attr('x', vis.width + 130)
                  .attr('y', (d, i) => {
                    return (i * 20) + 5
                  })
                  .text(d => d.values[idx].value !== null || d.values[idx].value === 0 ?
                    d.countryName + ': ' + formatNumbers(vis.yScaleNeg.invert(vis.yScaleNeg(d.values[idx].value)).toFixed(2))
                    : d.countryName + ': N/A');

              } else {
                d3.select(this).select('text')
                  .text(d => item.value !== null || item.value === 0 ?
                    formatNumbers(vis.yScalePos.invert(vis.yScalePos(item.value)).toFixed(2)) : null);

                d3.select('.values').selectAll('.value')
                  .attr('x', vis.width + 130)
                  .attr('y', (d, i) => {
                    return (i * 20) + 5
                  })
                  .text(d => d.values[idx].value !== null || d.values[idx].value === 0 ?
                    d.countryName + ': ' + formatNumbers(vis.yScalePos.invert(vis.yScalePos(d.values[idx].value)).toFixed(2))
                    : d.countryName + ': N/A');
              }

              if (currentYear) {
                d3.select('.yearValue')
                  .text(currentYear);
              }

              vis.svg.select('.mouse-line')
                .attr('d', function () {
                  var data = 'M' + vis.xScale(item.year) + ',' + vis.height;
                  data += ' ' + vis.xScale(item.year) + ',' + 0;
                  return data;
                });

              if (item.value !== null || item.value === 0) {
                if (vis.selected.indicator === 'Inflation, GDP deflator (annual %)') {
                  return `translate(${vis.xScale(item.year)},${vis.yScaleNeg(item.value)})`;
                } else {
                  return `translate(${vis.xScale(item.year)},${vis.yScalePos(item.value)})`;
                }
              }
              return `translate(${vis.xScale(item.year)},${vis.width / 2})`;
            }
            return null;
          });
      });

    // Update the axes
    vis.xAxisG.call(vis.xAxis.ticks(d3.timeYear));
    if (vis.selected.indicator === 'Inflation, GDP deflator (annual %)') {
      vis.yAxisG.call(vis.yAxisNeg)
    } else {
      vis.yAxisG.call(vis.yAxisPos);
    }
  }

  // ------------------ Helpers ------------------ //

  getColour(d, i) {
    let vis = this;

    if (d.countryName === vis.selected.area.country) {
      return vis.config.colour.selectedArea;
    } else {
      return vis.colorScale(i);
    }
  }
}


