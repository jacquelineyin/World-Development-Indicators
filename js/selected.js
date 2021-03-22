class Selected {
    constructor(selectedArea, selectedComparisonAreas, selectedIndicator, selectedTimeInterval) {
        
        this.availableIndicators = new Indicators();
        this.area = selectedArea ? selectedArea : {};
        this.comparisonAreas = selectedComparisonAreas ? selectedComparisonAreas : [];
        this.indicator = selectedIndicator ? selectedIndicator : this.availableIndicators.POPULATION_TOTAL;
        this.timeInterval = selectedTimeInterval ? selectedTimeInterval : null;

        this.allSelectedAreas = [];
        this.updateAllSelectedAreas(this.area, this.comparisonAreas);
    }

    /**
     * Purpose:
     * @param {Object} area = {region: "", country: ""}
     */
    addComparisonArea(area) {
        if (!this.comparisonAreas.includes(area) && this.comparisonAreas.length < 5) {
            this.comparisonAreas.push(area);
        } else if (this.comparisonAreas.length >= 5) {
            //TODO: Error handling - show warning label
        }

        //update allSelectedAreas
        this.updateAllSelectedAreas(this.area, this.comparisonAreas);
    }

    /**
     * Purpose: 
     * @param {Object} area = {region: "", country: ""} 
     */
    removeComparisonArea(area) {
        let index = this.comparisonAreas.indexOf(area);
        if (index > -1) {
            this.comparisonAreas.splice(index);
            
            //update allSelectedAreas
            this.updateAllSelectedAreas(this.area, this.comparisonAreas);
        }
    }

    /**
     * Purpose:
     * @param {Object} area = {region: "", country: ""} 
     */
    setArea({region, country}) {
        this.area.region = !!!region ? region : "World";
        this.area.country = !!!country ? country : "";

        //update allSelectedAreas
        this.updateAllSelectedAreas(this.area, this.comparisonAreas);
    }

    /**
     * Purpose:
     * @param {string} indicator 
     */
    setIndicator(indicator) {
        if (indicator) {
            this.indicator = indicator;
        }
    }

    /**
     * Purpose:
     * @param {Integer} min = lowerBound year (format: YYYY) 
     * @param {Integer} max = upperBound year (format: YYYY)
     */
    setTimeInterval(min, max) {
        if (min && max) {
            this.timeInterval = {min, max};
        }
    }

    /**
     * Purpose:
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
     * Purpose: 
     */
    updateAllSelectedAreas(area, comparisonAreas) {
        let {region, country} = area;
 
        this.allSelectedAreas = country !== "" ? [country, ...comparisonAreas] : [region, ...comparisonAreas];
 
    }
    
}