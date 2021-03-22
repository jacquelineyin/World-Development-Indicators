# Data Processing

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
1. [Create Table And Put Data In SQL Server Using CSV File](https://www.c-sharpcorner.com/article/create-table-and-put-data-in-sql-server-using-csv-file/) by Yogeshkumar Hadiya

## Tools
1. Microsoft SQL Server Management Studio (MSSM)
    |   Component Name                               |  Versions          |
    |------------------------------------------------|--------------------|
    |   SQL Server Management Studio				 | 15.0.18369.0       |
    |   SQL Server Management Objects (SMO)			 | 16.100.46041.41    |
    |   Microsoft Analysis Services Client Tools	 | 15.0.19342.0       |
    |   Microsoft Data Access Components (MDAC)		 | 10.0.19041.1       |
    |   Microsoft MSXML						         | 3.0 6.0            |
    |   Microsoft .NET Framework				     | 4.0.30319.42000    |   
    |   Operating System						     | 10.0.19041         |
2. Visual Studios Code
    - version: 1.54.2
  

## Pre-processing
<!-- TODO: Need to include the pre-processing we did to get our original Dataset.csv -->
1. First, we created a database using MSSM, then, following the steps in [this guide](https://www.c-sharpcorner.com/article/create-table-and-put-data-in-sql-server-using-csv-file/), we created two tables, `Indicators` and `continents2` by importing the "flat files" `Indicators.csv` and `continents2.csv`
   
2. Then, we created a new query in which we created a view by doing a joining the two tables on the country code (i.e. ISO code formed of 3 letters)
    ```
    CREATE VIEW dataset AS
    SELECT CountryName, CountryCode, IndicatorName, IndicatorCode, Year, Value, region AS Region, sub_region AS SubRegion
    FROM Indicators
    LEFT JOIN continents2
    ON CountryCode = alpha_3;
    ```

3. We go on to filter out rows in which the Region is null (i.e. the rows where the CountryName held values that were not true countries but rather were regions grouped by economic status, development, etc.) - with the exception of the row where the `CountryName` held the value "World";
    ```
    SELECT * from dataset
    WHERE (Region is not null or CountryCode='WLD')
    ORDER BY IndicatorName, Year ASC;
    ```

1. We then exported the results to a `.csv` file. Because the results didn't export the column names, we then opened the newly created file in vscode and manually added the column names
