# CPSC 436V Project


## Table of Contents
  - **[External Resources](#external-resources)**
      - [Data Sources](#data-sources)   
      - [Referenced Material](#referenced-material)
  - **[Tools](#tools)**
  - **[Pre-processing](#pre-processing)**
  

## External Resources
#### Data Sources
1. [Kaggle: Indicators.csv](https://www.kaggle.com/worldbank/world-development-indicators?select=Indicators.csv)
2. [Kaggle: continents2.csv](https://www.kaggle.com/andradaolteanu/country-mapping-iso-continent-region)

#### Referenced Material
##### Data Processing
1. [Create Table And Put Data In SQL Server Using CSV File](https://www.c-sharpcorner.com/article/create-table-and-put-data-in-sql-server-using-csv-file/) by Yogeshkumar Hadiya

##### Map
- [How-to add a Leaflet map](https://gis.stackexchange.com/questions/182442/whats-the-most-appropriate-way-to-load-mapbox-studio-tiles-in-leaflet)
- [436V Leaflet example](https://codesandbox.io/s/vigilant-worker-9ohh6?file=/js/main.js )
- [Countries GeoJSON](https://datahub.io/core/geo-countries)
- [Loading GeoJSON files in Leaflet with leaflet-ajax](https://gis.stackexchange.com/questions/68489/loading-external-geojson-file-into-leaflet-map)


## Dataset
### Sources
- See [External Resources: Data Sources](#data-sources)

### Pre-processing
1. Filtered dataset `Indicators.csv` of all rows containing irrelevant `IndicatorName` values and created a temporary dataset `Dataset.csv` that held the results
2. Joined two datasets (`Dataset.csv` and `continents2.csv`)
3. From the result of the join, removed all rows that assigned anything other than a country to `CountryName` column (unless the value was "World")
4. **Note:** _For a more detailed breakdown of how we pre-processed our data, please refer to [the `README.md` in ./data](./data/README.md)_
