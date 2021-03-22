
/**
 * Class to store selectedItems
 */
class Selected {
    /**
     * Class constructor
     * @param {Object} selectedArea = {region: "", country: ""} : holds selected country and/or region of focus
     * @param {Array} selectedComparisonAreas = ["", "", ...] : list of strings representing countries or regions we wish to compare focusedArea to
     * @param {string} selectedIndicator : indicator that is selected. Default value: POPULATION_TOTAL 
     * @param {Object} selectedTimeInterval = {minYear, maxYear} : minYear as lowerBound year and maxYear as upperBound of timeInterval
     *                                                              Default = NULL;
     */
    constructor(selectedArea, selectedComparisonAreas, selectedIndicator, selectedTimeInterval) {
        
        this.availableIndicators = new Indicators();
        this.area = selectedArea ? selectedArea : {region: "World", country: ""};
        this.comparisonAreas = selectedComparisonAreas ? selectedComparisonAreas : [];
        this.indicator = selectedIndicator ? selectedIndicator : this.availableIndicators.POPULATION_TOTAL;
        this.timeInterval = selectedTimeInterval ? selectedTimeInterval : null;

        this.allSelectedAreas = [];
        this.updateAllSelectedAreas(this.area, this.comparisonAreas);
    }

    /**
     * Purpose: If given country/region is not already in the comparisonAreas list, add to list
     *          TODO: will throw error if list is already full
     * Note: Will not add currently selected focused country/region to comparison list
     * @param {string} countryOrRegion = country or region that user has added as comparison countries/regions
     */
    addComparisonArea(countryOrRegion) {
        let isFocusArea = this.area.region === countryOrRegion || this.area.country === countryOrRegion;
        let isComparisonListFull = this.comparisonAreas.length < 5;
        let isAlreadyInList = this.comparisonAreas.includes(countryOrRegion);

        if (!isFocusArea && !isComparisonListFull && !isAlreadyInList) {
            // add to list
            this.comparisonAreas.push(countryOrRegion);
        } else if (isComparisonListFull) {
            //TODO: Error handling - show warning label
        }

        //update allSelectedAreas
        this.updateAllSelectedAreas(this.area, this.comparisonAreas);
    }

    /**
     * Purpose: Removes given country/region from comparisonAreas list
     * @param {string} countryOrRegion = country or region to remove from comparison list
     */
    removeComparisonArea(countryOrRegion) {
        let index = this.comparisonAreas.indexOf(countryOrRegion);
        if (index > -1) {
            this.comparisonAreas.splice(index);
            
            //update allSelectedAreas
            this.updateAllSelectedAreas(this.area, this.comparisonAreas);
        }
    }

    /**
     * Purpose: Sets the focusedArea as given area. 
     *          If no region is given, default region is set to "World"
     *          If no country is given, default country is set to ""
     * @param {Object} area = {region: "", country: ""} 
     */
    setArea({region, country}) {
        this.area.region = !!!region ? region : this.area.region;
        this.area.country = !!!country ? country : this.area.country;

        //update allSelectedAreas
        this.updateAllSelectedAreas(this.area, this.comparisonAreas);
    }

    /**
     * Purpose: Sets selected indicator as given indicator
     * @param {string} indicator 
     */
    setIndicator(indicator) {
        if (indicator) {
            this.indicator = indicator;
        }
    }

    /**
     * Purpose: Sets the selected timeInterval to {min, max}
     * @param {Integer} min = lowerBound year (format: YYYY) 
     * @param {Integer} max = upperBound year (format: YYYY)
     */
    setTimeInterval(min, max) {
        if (min && max) {
            this.timeInterval = {min, max};
        }
    }

    /**
     * Purpose: Sets selected area, indicator, and timeInterval
     * @param {Object} area = {region: "", country: ""} 
     * @param {string} indicator 
     * @param {Integer} minYear = lowerBound year (format: YYYY) 
     * @param {Integer} maxYear = upperBound year (format: YYYY)
     */
    setItems(area, indicator, minYear, maxYear) {
        this.setArea(area);
        this.setIndicator(indicator);
        this.setTimeInterval(minYear, maxYear);
    }

    /**
     * Purpose: Updates allSelectedAreas area with focusedArea and comparisonAreas. 
     *          If focusedArea has country, the country is added to the list.
     *          Otherwise, the region of the focusedArea is added instead.
     */
    updateAllSelectedAreas(area, comparisonAreas) {
        let {region, country} = area;
 
        this.allSelectedAreas = country !== "" ? [country, ...comparisonAreas] : [region, ...comparisonAreas];
 
    }
    
}