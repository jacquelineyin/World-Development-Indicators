class GeoMapNew {
    constructor(_config, _data, _selected, _constants) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || { top: 0, right: 0, bottom: 0, left: 0 },
            projection: _config.projection || d3.geoMercator(),
            zoom: { min: 1, },
            defaultCoords: [36.1408, 5.3536]
        }
        this.data = _data;
        this.selected = _selected;
        this.constants = _constants || {
            countryCodeMapper: new CountryCodeMapper(),
            countries: new Countries(),
            colourPalette: new ColourPalette(),
        }
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain our actual chart 
        // and position it according to the given margin config
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.geoPath = d3.geoPath().projection(vis.config.projection);
    }

    updateVis() {
        let vis = this;

        vis.renderVis();
    }

    renderVis() {
        let vis = this;
    }
}