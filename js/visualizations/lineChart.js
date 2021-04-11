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
      circle: { radius: 3 },
      containerWidth: _config.containerWidth || 2100,
      containerHeight: _config.containerHeight || 800,
      margin: _config.margin || { top: 50, right: 500, bottom: 110, left: 50 }
    }
    this.selected = _selectedItems;
    this.data = _data;
    this.constants = { countries: new Countries() }
    this.initVis();
  }

  /**
   * Initialize scales/axes and append static chart elements
   */
  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.colorScale = d3.scaleOrdinal()
      .range(vis.config.colour.otherAreas);

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
      .attr('x', vis.width + 250)
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
      .data(vis.selected.allSelectedAreas, d => d)
      .join('rect')
      .attr('class', 'legend-box')
      .attr('x', (d, i) => {
        return (i * 250) + 10;
      })
      .attr('y', vis.config.containerHeight - 75)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d, i) => vis.getColourForLegend(d, i));

    vis.legend.selectAll('.box-label')
      .data(vis.selected.allSelectedAreas, d => d)
      .join('text')
      .attr('class', 'box-label')
      .attr('x', (d, i) => (i * 250) + 25)
      .attr('y', vis.config.containerHeight - 65)
      .text(d => d);

    vis.values.selectAll('text')
      .data(vis.formattedData, d => d.values)
      .join('text')
      .attr('class', 'value');

    // Add line path
    vis.countries.selectAll('.line')
      .data(vis.formattedData, d => d.values)
      // .attr('class', d => vis.constants.countries.getKey(d.countryName))
      .join('path')
      .attr('class', d => `line line-${vis.constants.countries.getKey(d.countryName)}`)
      .attr('d', d => vis.line(d.values))
      .style('stroke', d => vis.getColour(d));

    // Add data points(dots) on line
    vis.circles.selectAll('.circle-group')
      .data(vis.formattedData)
      .join('g')
      .attr('class', 'circle-group')
      .style('fill', d => vis.getColour(d))
      .selectAll('circle')
      .data(d => d.values.filter(d => d.value !== null))
      .join('circle')
      .attr('class', d => `circle circle-${vis.constants.countries.getKey(d.CountryName)}`)
      .attr('r', vis.config.circle.radius)
      .attr('cx', d => vis.xScale(d.year))
      .attr('cy', d => {
        if (vis.selected.indicator === 'Inflation, GDP deflator (annual %)') {
          return vis.yScaleNeg(d.value)
        } else {
          return vis.yScalePos(d.value)
        }
      });

    const mouseG = vis.mouseG.selectAll('.mouseG')
      .data(vis.formattedData, d => d)
      .join('g')
      .attr('class', 'mouseG');

    const mouseGEnter = mouseG.enter().append('g')
      .attr('class', 'mouseG');

    mouseGEnter.merge(mouseG);

    mouseG.exit().remove();

    // Create black vertical line to follow mouse
    const mouseLine = mouseG.merge(mouseGEnter).selectAll('.mouse-line')
      .data(d => [d], d =>d);

    const mouseLineEnter = mouseLine.enter().append('path')
      .attr('class', 'mouse-line');

    mouseLineEnter.merge(mouseLine)
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('display', 'none');

    mouseLine.exit().remove();



    const mousePerLine = vis.mouseG.selectAll('.mouse-per-line')
      .data(vis.formattedData, d => d);

    const mousePerLineEnter = mousePerLine.enter().append('g')
      .attr('class', 'mouse-per-line');

    mousePerLineEnter.merge(mousePerLine);

    mousePerLine.exit().remove();

    const mplCircle = mousePerLine.merge(mousePerLineEnter).selectAll('.mouseCircle')
      .data(d => [d], d => d);

    const mplCircleEnter = mplCircle.enter().append('circle')
      .attr('class', 'mouseCircle');

    mplCircleEnter.merge(mplCircle)
      .attr('r', 7)
      .style('stroke', d => vis.getColour(d))
      .style('fill', 'none')
      .style('stroke-width', '1px')
      .style('display', 'none');

    mplCircle.exit().remove();

    const mplText = mousePerLine.merge(mousePerLineEnter).selectAll('.mouse-text')
      .data(d => [d], d => d);

    const mplTextEnter = mplText.enter().append('text')
      .attr('class', 'mouse-text');

    mplTextEnter.merge(mplText)
      .attr('transform', `translate(10,3)`);

    mplText.exit().remove();



    // append a rect to catch mouse movements on canvas
    const rect = mouseG.merge(mouseGEnter).selectAll('.rect-overlay')
      .data(d => [d], d => d);

    const rectEnter = rect.enter().append('rect')
      .attr('class', 'rect-overlay');

    rectEnter.merge(rect)
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
                  .attr('x', vis.width + 200)
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
                  .attr('x', vis.width + 200)
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
              
              let circle = d3.select(this).select('.mouseCircle');
              circle.attr('visibility', 'visible');

              if (item.value !== null || item.value === 0) {
                if (vis.selected.indicator === 'Inflation, GDP deflator (annual %)') {
                  return `translate(${vis.xScale(item.year)},${vis.yScaleNeg(item.value)})`;
                } else {
                  return `translate(${vis.xScale(item.year)},${vis.yScalePos(item.value)})`;
                }
              }
              
              circle.attr('visibility', 'hidden');
              return 'translate(0,0)'
            }
          });
      });

      rect.exit().remove();

    // Update the axes
    vis.xAxisG.call(vis.xAxis.ticks(d3.timeYear));
    if (vis.selected.indicator === 'Inflation, GDP deflator (annual %)') {
      vis.yAxisG.call(vis.yAxisNeg)
    } else {
      vis.yAxisG.call(vis.yAxisPos);
    }
  }

  /**
   * Purpose: Toggles target country's elems as active and emphasizes them
   *          De-emphasizes the elems of other countries
   * @param {string} country : Name of Country
   */
  emphasizeLine(country) {
    let vis = this;

    const countryKey = vis.constants.countries.getKey(country);

    vis.emphasizeActiveElems(countryKey);
    vis.deEmphasizeInactiveElems();
  }

  /**
   * Purpose: Toggles country elems as inactive and resets all elems to
   *          default styling
   * @param {string} country : Name of Country
   */
  deEmphasizeLine(country) {
    let vis = this;

    const countryKey = vis.constants.countries.getKey(country);

    vis.toggleOff(countryKey);
    vis.resetAllElemStyles();
  }

  // ------------------ Helpers ------------------ //

  getColourForLegend(d, i) {
    let vis = this;

    let isFocusedCountry = vis.constants.countries.isSameCountryName(d, vis.selected.area.country);

    if (isFocusedCountry) {
      return vis.config.colour.selectedArea;
    } else {
      return vis.colorScale(i);
    }
  }

  getColour(d) {
    let vis = this;

    let isFocusedCountry = d.countryName.toLowerCase().trim() === vis.selected.area.country.toLowerCase().trim();

    if (isFocusedCountry) {
      return vis.config.colour.selectedArea;
    } else {
      return vis.colorScale(vis.colorValue(d));
    }
  }

  getInactiveElems(className, activeClassName) {
    let vis = this;

    return vis.lines.selectAll(className).filter(function() {
      return !this.classList.contains(activeClassName);
    })
  }

  deEmphasizeInactiveElems() {
    let vis = this;

    let opacityOfInactive = 0.3;

    const inactiveLines = vis.getInactiveElems('.line', 'active-line');
    inactiveLines.attr('opacity', opacityOfInactive);

    const inactiveCircles = vis.getInactiveElems('.circle', 'active-circle');
    inactiveCircles.attr('opacity', opacityOfInactive);
  }

  emphasizeActiveElems(countryKey) {
    let vis = this;

    const activeCircles = vis.circles.selectAll(`.circle-${countryKey}`);
    activeCircles
      .classed('active-circle', true)
      .attr('r', vis.config.circle.radius * 1.5)
      .attr('opacity', 1);

    const activeLine = vis.countries.selectAll(`.line-${countryKey}`);
    activeLine
      .classed('active-line', true)
      .attr('opacity', 1)
      .style('stroke-width', 3);
  }

  resetAllElemStyles() {
    let vis = this;

    const lines = vis.countries.selectAll('.line');
    lines
      .attr('opacity', 1)
      .style('stroke-width', 1);

    const circles = vis.circles.selectAll('.circle');
    circles
      .classed('active-circle', false)
      .attr('opacity', 1)
      .attr('r', vis.config.circle.radius);
  }

  toggleOff(countryKey) {
    let vis = this;

    const activeLine = vis.countries.selectAll(`.line-${countryKey}`);
    activeLine.classed('active-line', false);

    const activeCircle = vis.circles.selectAll(`.circle-${countryKey}`);
    activeCircle.classed('active-circle', false);
  }

}


