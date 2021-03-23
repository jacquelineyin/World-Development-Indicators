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
      containerHeight: _config.containerHeight || 500,
      legendWidth: 250,
      margin: _config.margin || { top: 25, right: 100, bottom: 30, left: 50 }
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
    const newData = [];

    vis.data.forEach((d) => {
      const obj = {
        countryName: d.CountryName,
        values: [
          { year: d.year, avg: d.value }
        ]
      }
      newData.push(obj);
    })
    //console.log(newData);
    //console.log(vis.data);
    //vis.data = newData;
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
    vis.lines.selectAll('.country')
      .data(vis.data)
      .join("g")
      .attr("class", "country")
      .append("path")
      .attr("class", "line")
      .attr("d", (d) => vis.line(d.values))
      .style("stroke", (d, i) => vis.colorScale(i));

    vis.lines.selectAll('.country')
      .append("text")
      .datum(function (d) {
        return {
          name: d.name,
          value: d.values[d.values.length - 1]
        };
      })
      .attr("transform", function (d) {
        return `translate(${vis.xScale(d.value.year)}, ${vis.yScale(d.value.avg) + 20})`;
      })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function (d) {
        return d.name;
      });
    var mouseG = vis.lines.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(vis.data)
      .join("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", (d, i) => vis.colorScale(i))
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(10,3)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', vis.width) // can't catch mouse events on a g element
      .attr('height', vis.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function () { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function () { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function (event) { // mouse moving over canvas
        var mouse = d3.pointer(event, this)[0];
        d3.select(".mouse-line")
          .attr("d", function () {
            var d = "M" + mouse + "," + vis.height;
            d += " " + mouse + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function (d, i) {
            var beginning = 0;
            var end = lines[i].getTotalLength();
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

            return "translate(" + mouse + "," + pos.y + ")";
          });
      });


    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}


