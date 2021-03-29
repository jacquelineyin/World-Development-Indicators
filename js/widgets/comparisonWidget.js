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

        this.updateTags();
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

    updateWarningSection() {

    }

    updateTags() {
        // Clear previous tags
        let parent = document.getElementById('tag-container');
        this.clearChildNodes(parent);

        let {area, comparisonAreas} = this.selected;

        // Create tag for focused country
        this.createTag(area.country, true);

        // Create tag for each comparison area
        for (let i = 0; i < comparisonAreas.length; i++) {
            this.createTag(comparisonAreas[i], false);
        }
    }

    /**
     * 
     * @param {string} countryOrRegion 
     */
    createTag(countryOrRegion, isFocusedArea) {
        let parent = document.getElementById('tag-container');

        // Create tag
        let chip = document.createElement('div');
        chip.className = isFocusedArea ? 
                                'tag chip tag-focusedArea' : 
                                'tag chip';
        chip.innerText = countryOrRegion;
        chip.value = countryOrRegion;
        chip.id = `tag-${countryOrRegion.toLowerCase()}`

        if (!isFocusedArea) {
            // Create delete button for tag
            let xButton = document.createElement('span');
            xButton.className = 'close-button';
            xButton.innerHTML = '&times;';
            xButton.value = chip.value;
            xButton.addEventListener('click', e => {
                console.log(e.target.value);
                this.removeTag(e.target.value);
            });

            chip.appendChild(xButton);
        }


        parent.appendChild(chip);
    }

    removeTag(country) {
        let parent = document.getElementById('tag-container');
        
        // get tag to remove
        let lowercase = country.toLowerCase();
        let id = `tag-${lowercase}`;
        let tagToRemove = document.getElementById(id);

        parent.removeChild(tagToRemove);
    }

    clearChildNodes(parentNode) {
        while (parentNode.firstChild) {
          parentNode.firstChild.remove();
        }
    }
}