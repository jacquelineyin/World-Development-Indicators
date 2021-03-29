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
        const td = d3.select('#' + d);
        td.append('svg')
          .attr('width', this.wedgeWidth)
          .attr('height', this.wedgeHeight)
          .append('g')
          .attr('transform', `translate(${this.wedgeWidth/2}, ${this.wedgeHeight/2})`);
      });

      // Initialize pie generator
      this.pie = d3.pie()
        .startAngle(0)
        .endAngle(6.28); // 360 degrees in rad

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
      // 1. maximum value for that indicator (maxDataMap)
      // 2. average value for the selected country (countryDataMap)
      // 3. average value for the world (worldDataMap)
      const filteredToYearsDataNoWLD = this.data.filter(d => this.selected.selectedYears.includes(d.Year) && d.CountryCode != "WLD");
      const filteredCountryData = this.data.filter(d => this.selected.selectedYears.includes(d.Year) && d.CountryName == selected.area.country);
      console.log(selected.area.country);
      // https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
      this.maxDataMap = d3.rollup(filteredToYearsDataNoWLD, v => Math.max.apply(Math, v.map((o) => o.Value)), d => d.IndicatorName);
      this.countryDataMap = d3.rollup(filteredCountryData, v => d3.mean(v, i => i.Value), d => d.IndicatorName);
      this.worldDataMap = d3.rollup(filteredToYearsDataNoWLD, v => d3.mean(v, i => i.Value), d => d.IndicatorName);
      this.renderVis();
    }
  
    // Bind data to visual elements, update axes
    renderVis() {

      Object.keys(this.indicators).forEach(d => {
        var max = this.maxDataMap.get(this.indicators[d]);
        var countryAvg = this.countryDataMap.get(this.indicators[d]);
        var worldAvg = this.worldDataMap.get(this.indicators[d]);
        
        // Country
        if (max && countryAvg) {
        const countryData = [countryAvg, (max - countryAvg)];
        // https://stackoverflow.com/questions/24118919/how-do-i-get-the-index-number-from-the-array-in-d3/24118970
        const countryWedges = d3.select('#' + d + ' svg g')
          .selectAll('.c-arc')
          .data(this.pie(countryData), d => d.data);
        countryWedges.enter().append('path')
              .attr('class', 'c-arc')
              .attr('num', d => d.index)
              .attr('d', this.countryArc);
        countryWedges.exit().remove();
        }

        // World
        if (max && worldAvg) {
        const worldData = [worldAvg, (max - worldAvg)];
        const worldWedges = d3.select('#' + d + ' svg g')
          .selectAll('.w-arc')
          .data(this.pie(worldData), d => d.data);
        worldWedges.enter().append('path')
              .attr('class', 'w-arc')
              .attr('num', d => d.index)
              .attr('d', this.worldArc);
        worldWedges.exit().remove();
        }
      });
    }
  }