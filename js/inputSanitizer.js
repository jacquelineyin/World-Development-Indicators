class InputSanitizer {
    constructor() {
        this.countries = new Countries();
        this.regions = new Regions();
    }
    /**
     * Purpose: Returns country or region name as is standardized by values in constants
     * @param {string} input 
     * @returns {string} formatted string
     */
    formatCountryOrRegionNames(input) {
        let key = this.countries.getKey(input);
        if (key) {
            return this.countries[key];
        }

        key = this.regions.getKey(input);
        if (key) {
            return this.regions[key];
        }

        return null;
    }

}