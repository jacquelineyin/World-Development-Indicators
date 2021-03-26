class YearSlider {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      width: 2000,
      height: 150,
      margin: { top: 10, right: 10, bottom: 100, left: 45 },
    }
    this.data = _data;
    this.initVis();
  }

  /**
   * Initialize scales/axes and append static chart elements
   */
  initVis() {
    let vis = this;

    var sliderRange = d3
      .sliderBottom()
      .width(vis.config.width)
      .domain(d3.extent(vis.data, d => d.Year))
      .tickFormat(d3.format('d'))
      .ticks(25)
      .default([1960, 1965])
      .fill('#2196f3')
      .on('onchange', val => {
        d3.select('p#value-range').text(val.map(d3.format('d')).join('-'));
      });

    var gRange = d3
      .select('div#slider-range')
      .append('svg')
      .attr('width', vis.config.width + 100)
      .attr('height', vis.config.height)
      .append('g')
      .attr('transform', 'translate(30,50)');

    gRange.call(sliderRange);

    d3.select('p#value-range').text(
      sliderRange
        .value()
        .map(d3.format('d'))
        .join('-')
    );
  }
}