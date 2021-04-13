class GeoMapNew {
    constructor(_config, _data, _countries, _selected, _constants) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || { top: 0, right: 0, bottom: 0, left: 0 },
            zoom: { min: 1, },
            defaultCoords: [36.1408, 5.3536],
            defaultBorder: {
                colour: "white",
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

        vis.countryCodes = vis.constants.countryCodeMapper.getAllAlpha3s();

        // Initialize map and retrieve raster layer
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

        // Initialize svg to add to map
        L.svg({ clickable: true }).addTo(vis.map)// we have to make the svg layer clickable

        // Initialize indicator scale
        vis.indicatorScale = d3.scaleLinear()
            .range([0, 1]);

        vis.overlay = d3.select(vis.map.getPanes().overlayPane);
        vis.svg = vis.overlay.select('svg')
            .attr("pointer-events", "auto");

        // Append group element that will contain our actual chart 
        // and position it according to the given margin config
        vis.chart = vis.svg.append('g')
            .attr("class", "leaflet-zoom-hide");

        // Use Leaflets projection API for drawing svg path (creates a stream of projected points)
        const projectPoint = function (x, y) {
            const point = vis.map.latLngToLayerPoint(new L.LatLng(y, x))
            this.stream.point(point.x, point.y);
        }

        // Use d3's custom geo transform method to implement the above
        vis.projection = d3.geoTransform({ point: projectPoint })
        // creates geopath from projected points (SVG)
        vis.geoPath = d3.geoPath().projection(vis.projection);

    }

    updateVis() {
        let vis = this;

        // If a legend exists, remove to re-render on update
        if (this.legend) {
            d3.select('.info.legend.leaflet-control').remove();
        }

        // Prepare data
        vis.countryCodesOfSelected =
            vis.constants.countryCodeMapper.getCountryNumCodes(vis.selected.allSelectedAreas);
        vis.alpha3CodesOfSelected =
            vis.constants.countryCodeMapper.getCountryAlpha3s(vis.selected.allSelectedAreas);

        vis.selectedCountries = vis.countries.features.filter(d => vis.countryCodesOfSelected.includes(d.id));

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

        // Set map bounds
        let selectedGJsonLayer = L.geoJson(vis.selectedCountries);
        vis.map.fitBounds(selectedGJsonLayer.getBounds());

        // Update domains
        let [min, max] = d3.extent(vis.groupedData.values());
        min = min > 0 ? 0 : min;
        vis.indicatorScale.domain([min, max])

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        // Function to place svg based on zoom
        const onZoom = () => {
            vis.chart.selectAll(".map-country").attr('d', vis.geoPath);
            vis.chart.selectAll(".map-selected-country").attr('d', vis.geoPath)
        };

        // Legend
        // https://leafletjs.com/examples/choropleth/
        vis.legend = L.control({ position: 'bottomleft' });

        vis.legend.onAdd = function () {

            const div = L.DomUtil.create('div', 'info legend');
            const bins = [1, 0.8, 0.6, 0.4, 0.2, NaN];

            div.innerHTML += `${vis.selected.indicator}<br>`;

            // Loop through bins, adding a legend entry for each
            for (let i = 0; i < bins.length; i++) {
                if (bins[i]) {
                    div.innerHTML +=
                        '<i style="background:' + GeoMap.getTileColor(bins[i]) + '"></i> ' + Number(vis.indicatorScale.invert(bins[i])).toFixed(0).toLocaleString() + '<br>';
                } else {
                    div.innerHTML += '<i style="background:' + GeoMap.getTileColor(bins[i]) + '"></i>No data<br>';
                }
            }

            return div;
        };

        vis.legend.addTo(vis.map);



        const countriesPaths = vis.chart.selectAll(".map-country");
        countriesPaths
            .data(vis.countries.features)
            .join("path")
            .attr("class", "map-country")
            .attr("cursor", "default")
            .attr("d", vis.geoPath)
            .attr("fill", d => vis.getFillColour(d))
            .attr("fill-opacity", 0.5)
            .attr("stroke", "white");

        const selectedCountriesPaths = vis.chart.selectAll(".map-selected-country");
        selectedCountriesPaths
            .data(vis.selectedCountries, d => d.id)
            .join("path")
            .attr("class", d => `map-selected-country map-selected-country-${d.id}`)
            .attr("cursor", "default")
            .attr("d", vis.geoPath)
            .attr("fill", "none")
            .attr("stroke", d => vis.getBorderColour(d))
            .attr("stroke-width", d => vis.getStrokeWidth(d));

        // reset whenever map is moved
        vis.map.on('zoomend', onZoom);

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
        console.log(countryCode);

        const id = `.map-selected-country-${countryCode}`;
        vis.chart.selectAll(id)
            .attr("stroke", "black");
    }

    deEmphasizeCountry(country) {
        let vis = this;

        const { countryCodeMapper } = vis.constants;
        let countryCode = countryCodeMapper.getCountryNumCode(country);
        console.log(countryCode);

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


}