/**
 * Class to create
 */
class ComparisonWidget {
    /**
     * Class constructor
     * @param {Selected} _selected 
     * @param {Object} _constants = {regionMapper, countries, regions, dispatcherEvents}
     * @param {Object} _dispatcher : d3 dispatcher
     */
     constructor(_selected, _constants, _dispatcher) {
        this.selected = _selected;
        this.regionMapper = _constants.regionMapper;
        this.countries = _constants.countries;
        this.regions = _constants.regions;
        this.dispatcherEvents = _constants.dispatcherEvents;
        this.dispatcher = _dispatcher;
    }

    createComparisonSection() {
        this.createTitleSection();
        this.createInputSection();
        this.createWarningSection();
        this.createTagSection();
    }

    /**
     * Purpose: Creates a title for the comparison section
     */
    createTitleSection() {
        let parent = document.getElementById('select-comparison');
        let title = 'Compare ' + this.selected.indicator;

        let titleElem = document.createElement('h6');
        titleElem.id = 'comparison-title';
        titleElem.className = 'sub-title';
        titleElem.innerText = title;

        parent.prepend(titleElem);
    }

    /**
     * Purpose: Creates input section for comparison countries
     * TODO: adjust to have text also include 'region' if region gets implemented
     */
    createInputSection() {
        let parent = document.getElementById('comparison-selector-container');

        // Create container div
        let div = document.createElement('div');
        div.className = 'container';
        
        // Create input
        let input = document.createElement('input');
        input.placeholder = 'Add country to compare...'
        input.id = 'comparison-input';

        // Create submit button
        let submitButton = document.createElement('button');
        submitButton.innerHTML = 'Submit';
        submitButton.type = 'button';
        submitButton.className = 'button';
        submitButton.name = 'comparison-submit-button';
        submitButton.id = submitButton.name;

        div.appendChild(input);
        div.appendChild(submitButton);

        parent.appendChild(div);

    }

    createWarningSection() {

    }

    createTagSection() {
        let div = document.createElement('div');
    }
}