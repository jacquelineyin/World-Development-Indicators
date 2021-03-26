class Regions {
    constructor() {
        this.WORLD = "World",
        this.AFRICA = "Africa",
        this.ASIA = "Asia",
        this.EUROPE = "Europe",
        this.OCEANIA = "Oceania",
        this.NORTH_AMERICA = "North America",
        this.SOUTH_AMERICA = "South America"
    }

    getAllRegions() {
        return Object.keys(this);
    }
}