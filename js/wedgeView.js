class WedgeView {

    constructor(_data, _selected) {
      this.data = _data;
      this.selected = _selected;
      this.initVis();
    }
  
    // Create SVG area, initialize scales and axes
    initVis() {
      this.wedgeWidth = 50;
      this.wedgeHeight = 50;
      this.margin = 5;
      // Add an svg drawing space to each td
      this.indicators = new Indicators(); 
      Object.keys(indicators).forEach(d => {
        var td = d3.select('#' + d);
        td.append('svg')
          .attr('width', this.wedgeWidth)
          .attr('height', this.wedgeHeight)
          .append('g')
          .attr('transform', `translate(${this.wedgeWidth/2}, ${this.wedgeHeight/2})`);
      });

      // Initialize pie generator
      this.pie = d3.pie(); 

      // Intialize arc generators
      this.countryArc = d3.arc()
        .innerRadius(10)
        .outerRadius(20);

      this.worldArc = d3.arc()
        .innerRadius(15)
        .outerRadius(20);
    }
  
    // Prepare data and scales
    updateVis() {
      // Each wedge (indicator) needs three pieces of data from the subset of data within the range of selected years
      // 1. maximum value for that indicator
      // 2. average value for the selected country
      // 3. average value for the world
      var filteredToYearsData = this.data.filter(d => this.selected.selectedYears.includes(d.Year));
      var filteredCountryData = this.data.filter(d => this.selected.selectedYears.includes(d.Year) && d.CountryName == "Canada");
      var filteredWorldData = this.data.filter(d => this.selected.selectedYears.includes(d.Year) && d.CountryCode == "WLD");
      // https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
      this.maxDataMap = d3.rollup(filteredToYearsData, v => Math.max.apply(Math, v.map((o) => o.Value)), d => d.IndicatorName);
      this.countryDataMap = d3.rollup(filteredCountryData, v => d3.mean(v, i => i.Value), d => d.IndicatorName);
      this.worldDataMap = d3.rollup(filteredWorldData, v => d3.mean(v, i => i.Value), d => d.IndicatorName);
      this.renderVis();
    }
  
    // Bind data to visual elements, update axes
    renderVis() {

      Object.keys(this.indicators).forEach(d => {
        var max = this.maxDataMap.get(this.indicators[d]);
        var countryAvg = this.countryDataMap.get(this.indicators[d]);
        var worldAvg = this.worldDataMap.get(this.indicators[d]);
        if (max && countryAvg) {
        var countryData = [countryAvg, (max - countryAvg)];
        // https://stackoverflow.com/questions/24118919/how-do-i-get-the-index-number-from-the-array-in-d3/24118970
        d3.select('#' + d + ' svg g')
          .selectAll('c-arc')
          .data(this.pie(countryData))
          .enter()
          .append('path')
          .attr('class', 'c-arc')
          .attr('num', function(d,i){return i;})
          .attr('d', this.countryArc);
        }
        if (max && worldAvg) {
        var worldData = [worldAvg, (max - worldAvg)];
        d3.select('#' + d + ' svg g')
          .selectAll('w-arc')
          .data(this.pie(worldData))
          .enter()
          .append('path')
          .attr('class', 'w-arc')
          .attr('num', function(d,i){return i;})
          .attr('d', this.worldArc);
        }
      });
    }
  }