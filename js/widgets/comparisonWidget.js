/**
 * Class to create Comparison Country/Region input field + tags
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
        this.inputSanitizer = new InputSanitizer();
    }

    /**
     * Purpose: Initailizes or Updates Comparison Country/Region Input field, Submit Button, and tags
     */
    updateComparisonSection() {
        this.createTitleSection();
        this.createInputSection();

        this.updateTags();
    }

    /**
     * Purpose: Creates a title for the comparison section
     */
    createTitleSection() {
        let parent = document.getElementById('select-comparison');

        // Remove any previous titles
        let titleElem = document.getElementById('comparison-title');
        if (titleElem) parent.removeChild(titleElem);

        let title = 'Compare ' + this.selected.indicator;

        titleElem = document.createElement('h6');
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

        // Clear previously created inputs
        this.clearChildNodes(parent);

        // Create container div
        let div = document.createElement('div');
        div.className = 'container';

        // Create autocomplete div
        let autocompleteContainer = document.createElement('div');
        autocompleteContainer.className = 'autocomplete';
        
        // Create input field & submit button
        let input = this.createInputElem();
        let submitButton = this.createSubmitButton();

        autocompleteContainer.appendChild(input);
        
        // Autocomplete dropdown functionality
        const autocompleteCreator = new AutocompleteCreator(input, submitButton);
        autocompleteCreator.autocomplete(this.regionMapper.getCountriesOfRegion(this.regions.WORLD))


        div.appendChild(autocompleteContainer);
        div.appendChild(submitButton);

        parent.appendChild(div);
    }

    /**
     * Purpose: Creates a "submit" button
     * @returns {Node} : DOM element of tag type 'button'
     */
    createSubmitButton() {
        let submitButton = document.createElement('button');
        submitButton.innerHTML = 'Submit';
        submitButton.type = 'button';
        submitButton.className = 'button';
        submitButton.name = 'comparison-submit-button';
        submitButton.id = submitButton.name;
        submitButton.addEventListener('click', e => this.handleSubmitInput(e));
        return submitButton;
    }

    /**
     * Purpose: Creates an input field with default autocomplete turned off
     * @returns {Node} : DOM element of type 'input'
     */
    createInputElem() {
        let input = document.createElement('input');
        input.placeholder = 'Add country to compare...';
        input.autocomplete = 'off';
        input.id = 'comparison-input';
        return input;
    }

    /**
     * Purpose: Adds comparison area to selected and updates view if valid input
     * TODO: implement warning display
     * @param {Event} event : Native JS event
     */
    handleSubmitInput(event) {
        let inputValue = this.getInputValue();
        inputValue = this.inputSanitizer.formatCountryNames(inputValue);

        let isCountry = this.regionMapper.getCountriesOfRegion(this.countries.WORLD).includes(inputValue);
        
        if (isCountry) {
            this.dispatcher.call(this.dispatcherEvents.SELECT_COMPARISON_ITEM, event, inputValue);
        } else {
            //TODO: show warning
        }
        this.clearInputValue();
    }

    /**
     * Purpose: Retrieves value in input field
     * @returns {string} : value in text field
     */
    getInputValue() {
        let input = document.getElementById('comparison-input');
        return input.value;
    }

    /**
     * Purpose: Clears input field
     */
    clearInputValue() {
        let input = document.getElementById('comparison-input');
        input.value = '';
    }

    
    updateWarningSection() {
        //TODO
    }

    /**
     * Purpose: Updates tags to display tags 
     *          of selected focused area and selected comparison countries
     */
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
     * Purpose: Creates individual tag (div element) and appends it to parent
     * @param {string} countryOrRegion 
     */
    createTag(countryOrRegion, isFocusedArea) {
        let parent = document.getElementById('tag-container');

        // Create tag
        let tag = document.createElement('div');
        tag.className = isFocusedArea ? 
                                'tag chip tag-focusedArea' : 
                                'tag chip';
        tag.innerText = countryOrRegion;
        tag.value = countryOrRegion;
        tag.id = `tag-${countryOrRegion.toLowerCase()}`

        if (!isFocusedArea) {
            // Create delete button for tag
            this.createDeleteForTag(tag);
        }

        parent.appendChild(tag);
    }

    /**
     * Purpose: Creates the "x" (i.e. close) button for each tag item
     * @param {Node} tag : div element representing a tag
     */
    createDeleteForTag(tag) {
        let xButton = document.createElement('span');
        xButton.className = 'close-button';
        xButton.innerHTML = '&times;';
        xButton.value = tag.value;
        xButton.addEventListener('click', e => {
            this.dispatcher.call(this.dispatcherEvents.DELETE_COMPARISON_ITEM, e, e.target.value);
        });

        tag.appendChild(xButton);
    }

    /**
     * Purpose: Removes all child nodes from given parentNode
     * @param {Node} parentNode 
     */
    clearChildNodes(parentNode) {
        while (parentNode.firstChild) {
          parentNode.firstChild.remove();
        }
    }

}