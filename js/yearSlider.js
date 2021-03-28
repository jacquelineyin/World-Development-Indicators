class YearSlider {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _dispatcher, _dispatcherEvents) {
    this.config = {
      parentElement: _config.parentElement,
      width: 1500,
      height: 150,
      margin: { top: 10, right: 10, bottom: 100, left: 45 },
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
        
        const minYear = val.map(d3.format('d'))[0];
        const maxYear = val.map(d3.format('d'))[1];
        const selectedYears = [];

        for (let year = minYear; year <= maxYear; year++) {
         selectedYears.push(year.toString());
       }

       vis.dispatcher.call(vis.dispatcherEvents.FILTER_YEAR, this, selectedYears);
      });

    var gRange = d3
      .select('div#slider-range')
      .append('svg')
      .attr("viewBox", `0 0 ${vis.config.width + 100} ${vis.config.height}`)
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