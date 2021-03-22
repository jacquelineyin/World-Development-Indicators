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

    addComparisonArea(area) {
        if (!this.comparisonAreas.includes(area) && this.comparisonAreas.length < 5) {
            this.comparisonAreas.push(area);
        } else if (this.comparisonAreas.length >= 5) {
            //TODO: Error handling - show warning label
        }

        //update allSelectedAreas
        this.updateAllSelectedAreas(this.area, this.comparisonAreas);
    }

    removeComparisonArea(area) {
        let index = this.comparisonAreas.indexOf(area);
        if (index > -1) {
            this.comparisonAreas.splice(index);
            
            //update allSelectedAreas
            this.updateAllSelectedAreas(this.area, this.comparisonAreas);
        }
    }

    /**
     * 
     * @param {Object} area = {region: "", country: ""} 
     */
    setArea({region, country}) {
        this.area.region = !!!region ? region : "World";
        this.area.country = !!!country ? country : "";

        //update allSelectedAreas
        this.updateAllSelectedAreas(this.area, this.comparisonAreas);
    }

    // setArea(area) {
    //     // this.area.region = !!!region ? region : "World";
    //     // this.area.country = !!!country ? country : "";
    //     this.area = area;
    // }

    setIndicator(indicator) {
        if (indicator) {
            this.indicator = indicator;
        }
    }

    setTimeInterval(min, max) {
        if (min && max) {
            this.timeInterval = {min, max};
        }
    }

    setItems(area, indicator, minYear, maxYear) {
        this.setArea(area);
        this.setIndicator(indicator);
        this.setTimeInterval(minYear, maxYear);
    }

    updateAllSelectedAreas(area, comparisonAreas) {
        let {region, country} = area;
 
        this.allSelectedAreas = country !== "" ? [country, ...comparisonAreas] : [region, ...comparisonAreas];
 
    }
    
}