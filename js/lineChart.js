class LineChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _selectedItems, _dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 50, right: 300, bottom: 70, left: 50 }
    }
    this.selected = _selectedItems;
    this.data = _data;
    this.dispatcher = _dispatcher;
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
    let format = (strInput) => d3.format(".2~s")(strInput).replace(/G/,"B"); 

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
      .attr("viewBox", `0 0 ${vis.config.containerWidth} ${vis.config.containerHeight}`);

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

    vis.legends = vis.chart.append('g')
      .attr('class', 'legend');

    vis.values = vis.chart.append('g')
      .attr('class', 'values')

    vis.mouseG = vis.lines.append('g')
      .attr('class', 'mouse-over-effects');
    
    vis.svg.append('text')
      .attr('class', 'axis-title')
      .attr('y', 20)
      .attr('x', 10)
      .attr('dy', '.71em')
      .text('Total ' + vis.selected.indicator);
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

    // group data by country
    const countryGroups = d3.groups(filteredSelectedData, d => d.CountryName);

    // re-arrange data
    vis.formattedData = [];
    countryGroups.forEach(g => {
      const obj = {
        countryName: g[0],
        values: g[1]
      }
      vis.formattedData.push(obj);
    })

    // Specificy x- and y-accessor functions
    vis.xValue = d => d.year;
    vis.yValue = d => d.value;

    // Initialize line generator
    vis.line = d3.line()
      .x(d => vis.xScale(d.year))
      .y(d => vis.yScale(d.value));

    // Set the scale input domains
    vis.xScale.domain(d3.extent(filteredSelectedData, d => d.year));
    vis.yScale.domain([0, d3.max(filteredSelectedData, d => d.value)]);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    const legend = vis.legends.selectAll('g')
      .data(vis.formattedData)
      .join('g')
      .attr('class', 'legend');

    legend.append('rect')
      .attr('x', (d, i) => {
        return (i * 100) + 150;
      })
      .attr('y', vis.config.containerHeight - 85)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d, i) => vis.colorScale(i));

    legend.append('text')
      .attr('x', (d, i) => (i * 100) + 165)
      .attr('y', vis.config.containerHeight - 75)
      .text(d => d.countryName);

    const compareValues = vis.values.selectAll('g')
      .data(vis.formattedData)
      .join('g')
      .attr('class', 'value');

    compareValues.append('text')
      .attr('x', vis.width + 120)
      .attr('y', (d, i) => {
        return (i * 20) + 5
      });


    // Add line path
    const country = vis.countries.selectAll('.country')
      .data(vis.formattedData)
      .join('g')
      .attr('class', 'country');

    country.append('path')
      .attr('class', 'line')
      .attr('d', (d) => vis.line(d.values))
      .style('stroke', (d, i) => vis.colorScale(i));

    country.selectAll("circle-group")
      .data(vis.formattedData)
      .join("g")
      .attr('class', 'circle-group')
      .style("fill", (d, i) => vis.colorScale(i))
      .selectAll('circle')
      .data(d => d.values)
      .join('g')
      .attr('class', 'circle')
      .append('circle')
      .attr('r', 3)
      .attr('cx', d => vis.xScale(d.year))
      .attr('cy', d => vis.yScale(d.value));

    vis.mouseG.append('path') // this is the black vertical line to follow mouse
      .attr('class', 'mouse-line')
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    const lines = document.getElementsByClassName('line');

    const mousePerLine = vis.mouseG.selectAll('.mouse-per-line')
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
      .attr('class', 'mouse-text')
      .attr('transform', `translate(10,3)`);

    vis.mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
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
      })
      .on('mousemove', function (event) { // mouse moving over canvas
        const mouse = d3.pointer(event, this)[0];
        d3.select('.mouse-line')
          .attr('d', () => {
            let d = 'M' + mouse + ',' + vis.height;
            d += ' ' + mouse + ',' + 0;
            return d;
          });

        const formatNumbers = d3.format(',')

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
              .text(formatNumbers(vis.yScale.invert(pos.y).toFixed(0)));

            return `translate(${mouse},${pos.y})`;
          });

        d3.selectAll('.value')
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
              .text(d => d.countryName + ': ' + formatNumbers(vis.yScale.invert(pos.y).toFixed(0)));
          });
      });

    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}


