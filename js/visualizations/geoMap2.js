class GeoMapNew {
    constructor(_config, _data, _countries, _selected, _constants) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 600,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || { top: 0, right: 0, bottom: 0, left: 0 },
            zoom: { min: 1, },
            defaultCoords: [36.1408, 5.3536]
        }
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


        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define size of SVG drawing area

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
        // vis.geoPath = d3.geoPath().projection(vis.config.projection);

    }

    updateVis() {
        let vis = this;

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        let countries = vis.chart.selectAll("path");

        countries
            .data(vis.countries.features)
        .join("path")
            .attr("class", "map-country")
            .attr("cursor", "default")
            .attr("d", vis.geoPath)
            .attr("fill", "lightblue")
            .attr("fill-opacity", 0.5)
            .attr("stroke", "white");

        // // Function to place svg based on zoom
        const onZoom = () =>{ 
            vis.chart.selectAll("path").attr('d', vis.geoPath)
        };

        // initialize positioning
        onZoom();

        // reset whenever map is moved
        vis.map.on('zoomend', onZoom);

    }
    

}