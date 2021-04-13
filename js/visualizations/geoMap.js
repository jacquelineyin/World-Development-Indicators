class GeoMap {
    /**
     * Class constructor with initial configuration
     * @param {Object} _config : object holding configuration settings
     * @param {Array} _data : given data array
     * @param {Object} _countries : given geoJson (converted from topoJson) of all countries in world
     * @param {Selected} _selected : Selected class object holding selectedItem values
     * @param {Object} _constants : Object holding constants
     */
    constructor(_config, _data, _countries, _selected, _constants) {
        this.config = {
            parentElement: _config.parentElement,
            zoom: { min: 1, },
            defaultCoords: [36.1408, 5.3536],
            defaultBorder: {
                colour: 'white',
                strokeWidth: 1,
            }
        };
        this.data = _data;
        this.countries = _countries;
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

        // Set up other initial constants
        vis.initOtherConstants();

        // Initialize map and retrieve raster layer
        vis.initLeafletMap();

        // Legend
        // https://leafletjs.com/examples/choropleth/
        vis.initLegendContainer();


        // Initialize svg to add to map
        vis.initVisSvg();

        // Append group element that will contain our actual chart 
        vis.chart = vis.svg.append('g')
            .attr('class', 'leaflet-zoom-hide');

        // Initialize scale
        vis.indicatorScale = d3.scaleLinear()
            .range([0, 1]);

        // Use Leaflets projection API for drawing svg path (creates a stream of projected points)
        vis.initGeoPathGenerator();

    }

    updateVis() {
        let vis = this;

        // Prepare data
        vis.updateData();

        // Set map bounds
        vis.updateMapBounds();

        // Update domains
        let [min, max] = d3.extent(vis.groupedData.values());
        min = min > 0 ? 0 : min;
        max = max === 0 && max === min ? 1 : max;
        vis.indicatorScale.domain([min, max])

        vis.renderVis();
    }

    updateMapBounds() {
        let vis = this;

        const selectedGJsonLayer = L.geoJson(vis.selectedCountries);

        selectedGJsonLayer.getLayers().length > 0 ?
            vis.map.fitBounds(selectedGJsonLayer.getBounds()) :
            vis.map.setView(vis.config.defaultCoords, 1);
    }

    updateData() {
        let vis = this;

        vis.countryCodesOfSelected =
            vis.constants.countryCodeMapper.getCountryNumCodes(vis.selected.allSelectedAreas);
        vis.alpha3CodesOfSelected =
            vis.constants.countryCodeMapper.getCountryAlpha3s(vis.selected.allSelectedAreas);
        vis.selectedCountries =
            vis.countries.features.filter(d => vis.countryCodesOfSelected.includes(d.id));


        // Filter data by selected years and selected indicator
        const filteredData = this.data.filter(d => this.selected.selectedYears.includes(d.Year) && d.IndicatorName == this.selected.indicator);

        // Aggregate data by country and calculate the mean
        vis.groupedData = d3.rollup(filteredData, v => d3.mean(v, i => i.Value), d => d.CountryCode);

        // Remove countries for which we do not have a corresponding vector tile, e.g. "WLD"
        for (let countryCode of vis.groupedData.keys()) {
            if (countryCode === "WLD") {
                vis.groupedData.delete(countryCode);
            }
        }
    }

    renderVis() {
        let vis = this;

        // Function to place svg based on zoom
        const onZoom = () => {
            vis.chart.selectAll(".map-country").attr('d', vis.geoPath);
            vis.chart.selectAll(".map-selected-country").attr('d', vis.geoPath)
        };

        const countriesPaths = vis.chart.selectAll(".map-country");
        countriesPaths
            .data(vis.countries.features)
            .join("path")
            .attr("class", d => d.id ? `map-country map-country-${d.id}` : 'map-country')
            .attr("cursor", "default")
            .attr("d", vis.geoPath)
            .attr("fill", d => vis.getFillColour(d))
            .attr("fill-opacity", 0.5)
            .attr("stroke", "white")
            .on('mouseenter', d => vis.handleMouseEnter(d))
            .on('mouseleave', d => vis.handleMouseLeave(d));

        const selectedCountriesPaths = vis.chart.selectAll(".map-selected-country");
        selectedCountriesPaths
            .data(vis.selectedCountries, d => d.id)
            .join("path")
            .attr("class", d => d.id ? `map-selected-country map-selected-country-${d.id}` : 'map-selected-country')
            .attr("cursor", "default")
            .attr("d", vis.geoPath)
            .attr("fill", "none")
            .attr("stroke", d => vis.getBorderColour(d))
            .attr("stroke-width", d => vis.getStrokeWidth(d))
            .on('mouseenter', d => vis.handleMouseEnter(d))
            .on('mouseleave', d => vis.handleMouseLeave(d));

        // reset whenever map is moved
        vis.map.on('zoomend', onZoom);

        vis.renderLegend();

    }

    // ------------------------------ Helpers ---------------------------------- //

    initGeoPathGenerator() {
        let vis = this;

        const projectPoint = function (x, y) {
            const point = vis.map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        };

        // Use d3's custom geo transform method to implement the above
        vis.projection = d3.geoTransform({ point: projectPoint });
        // creates geopath from projected points (SVG)
        vis.geoPath = d3.geoPath().projection(vis.projection);
    }

    initVisSvg() {
        let vis = this;

        L.svg({ clickable: true }).addTo(vis.map);

        vis.overlay = d3.select(vis.map.getPanes().overlayPane);

        // Set svg as being able to be interacted with
        vis.svg = vis.overlay.select('svg')
            .attr('pointer-events', 'auto');
    }

    initLegendContainer() {
        let vis = this;

        vis.legendContainer = L.control({ position: 'bottomleft' });

        vis.legendContainer.onAdd = function () {
            const div = L.DomUtil.create('div', 'info-legend-container');
            const svg = d3.select(div).append('svg');
            vis.legend = svg.append('g').attr('class', 'legend');
            const legendBackground = vis.legend.append('rect');
            legendBackground
                .attr('class', 'legend-background')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('x', 0)
                .attr('y', 0)
                .attr('rx', 6)
                .attr('ry', 6)
                .attr('fill', 'white')
                .attr('fill-opacity', 0.5);

            return div;
        };

        vis.legendContainer.addTo(vis.map);
    }

    initLeafletMap() {
        let vis = this;

        vis.map = L.map('map', {
            minZoom: vis.config.zoom.min,
        }).setView(vis.config.defaultCoords, 2);

        L.Icon.Default.imagePath = "images/";
        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            zoomOffset: -1,
            tileSize: 512,
            attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            accessToken: 'sk.eyJ1IjoiYnJldHRwYXN1bGEiLCJhIjoiY2ttaThjenpqMGVyMDJzcmh6d2w5anQ2aiJ9.x43UBzwi3iRfsZSSb5ubIQ'
        }).addTo(vis.map);
    }

    initOtherConstants() {
        let vis = this;

        vis.countryCodes = vis.constants.countryCodeMapper.getAllAlpha3s();

        // Round averages and format them with commas for thousands
        let round = (val) => val > 100 ? Math.round(val) : val.toFixed(2);
        vis.format = (val) => val >= 0 ? d3.format(',')(round(val)) : round(val);
    }


    getBorderColour(data) {
        let vis = this;
        const { countryCodeMapper, colourPalette } = vis.constants;

        let focusCountryCode
            = countryCodeMapper.getCountryNumCode(vis.selected.area.country);

        if (data.id === focusCountryCode) {
            return colourPalette.getFocusedAreaColour();
        } else if (vis.countryCodesOfSelected.includes(data.id)) {
            return colourPalette.getComparisonAreaColour();
        } else {
            return vis.config.defaultBorder.colour;
        }
    }

    getFillColour(data) {
        let vis = this;

        let alpha3 = vis.constants.countryCodeMapper.convertToAlpha3(data.id);
        let num = vis.indicatorScale(vis.groupedData.get(alpha3));

        return vis.getTileColor(num);
    }

    getStrokeWidth(data) {
        let vis = this;

        if (vis.countryCodesOfSelected.includes(data.id)) {
            return vis.config.defaultBorder.strokeWidth * 2;
        } else {
            return vis.config.defaultBorder.strokeWidth;
        }
    }

    emphasizeCountry(country) {
        let vis = this;

        const { countryCodeMapper } = vis.constants;
        let countryCode = countryCodeMapper.getCountryNumCode(country);

        const id = `.map-selected-country-${countryCode}`;
        vis.chart.selectAll(id)
            .attr("stroke", "black");
    }

    deEmphasizeCountry(country) {
        let vis = this;

        const { countryCodeMapper } = vis.constants;
        let countryCode = countryCodeMapper.getCountryNumCode(country);

        const id = `.map-selected-country-${countryCode}`;
        vis.chart.selectAll(id)
            .attr("stroke", vis.getBorderColour({ id: countryCode }));
    }

    getTileColor(d) {
        return d > 0.8 ? '#08519c' :
            d > 0.6 ? '#3182bd' :
                d > 0.4 ? '#6baed6' :
                    d > 0.2 ? '#bdd7e7' :
                        isNaN(d) ? '#808080' :
                            '#eff3ff';
    }

    renderLegend() {
        let vis = this;
        const bins = [1, 0.8, 0.6, 0.4, 0.2, NaN];
        const boxLength = 12;
        const leftMargin = 10;
        // Replace the 'G' (Giga) SI-prefix of d3 with 'B' to stand for 'Billion' when formatting
        const format = (strInput) => d3.format('.2~s')(strInput).replace(/G/, 'B');

        vis.legend.selectAll('.title-container')
            .data([vis.selected.indicator])
            .join('foreignObject')
            .attr('class', 'title-container')
            .attr('width', '90%')
            .attr('height', 20)
            .attr('x', leftMargin)
            .attr('y', 0)
            .html(d => `<div class='title'>${d}</div>`);

        const legendBoxes = vis.legend.selectAll('.bin');
        legendBoxes
            .data(bins)
            .join('rect')
            .attr('class', 'bin info-legend-bins')
            .attr('width', boxLength)
            .attr('height', boxLength)
            .attr('x', leftMargin)
            .attr('y', (d, i) => { return (i * boxLength) + 20 })
            .attr('fill', d => vis.getTileColor(d))
            .attr('opacity', 0.7);

        const legendLabels = vis.legend.selectAll('.label');
        legendLabels
            .data(bins)
            .join('text')
            .attr('class', 'label')
            .attr('font-size', `${boxLength - 1}px`)
            .attr('x', leftMargin + boxLength + 5)
            .attr('y', (d, i) => { return (i * boxLength) + 30 })
            .text(d => isNaN(d) ? 'N/A' : format(vis.indicatorScale.invert(d)));
    }

    handleMouseEnter(e) {
        let vis = this;

        const classes = e.target.classList;
        const countryCode = classes[1] ? parseInt(classes[1].split('-')[2]) : false;

        let classOfInterest = vis.countryCodesOfSelected.includes(countryCode) ? 'map-selected-country-' : 'map-country-';
        classOfInterest += countryCode;
        d3.selectAll(`.${classOfInterest}`)
            .attr("stroke", "black");

        const { countryCodeMapper, countries } = vis.constants;

        const { indicator, timeInterval } = vis.selected;
        let alpha3 = countryCodeMapper.convertToAlpha3(countryCode);
        let average = vis.groupedData.get(alpha3);
        average = average ? vis.format(average) : 'N/A'
        let key = countryCodeMapper.getKey(countryCode);
        const countryName = countries[key];
        let test = vis.countries.features.filter(d => d.id === countryCode);
        test = test[0] ? test[0].properties.name : null;

        if (countryName || test) {
            d3.select('#tooltip')
                .attr('display', true)
                .style('top', `${e.clientY}px`)
                .style('left', `${e.clientX}px`)
                .html(`<strong>${countryName ? countryName : test}</strong><br>
                      <i>${timeInterval.min}-${timeInterval.max}</i><br>
                        ${'Average ' + indicator + ':'}<br>
                        ${'   ' + average}`);
        }
    }

    handleMouseLeave(e) {
        let vis = this;

        const classes = e.target.classList;
        let countryCode = classes[1] ? parseInt(classes[1].split('-')[2]) : null;

        if (!isNaN(countryCode)) {
            let classOfInterest = vis.countryCodesOfSelected.includes(countryCode) ? 'map-selected-country-' : 'map-country-';
            classOfInterest += countryCode;

            d3.select('#tooltip')
                .attr('display', false);

            d3.selectAll(`.${classOfInterest}`)
                .attr("stroke", () => vis.getBorderColour({ id: countryCode }));
        }
    }


}