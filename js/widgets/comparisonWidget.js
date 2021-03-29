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

        // Create autocomplete div
        let autocomplete = document.createElement('div');
        autocomplete.className = 'autocomplete';
        
        // Create input field
        let input = document.createElement('input');
        input.placeholder = 'Add country to compare...';
        input.autocomplete = false;
        input.id = 'comparison-input';

        // Workaround to remove chrome's autocomplete
        input.readOnly = true;
        input.onfocus = () => {
            input.removeAttribute('readOnly');
        }

        // Autocomplete dropdown functionality
        this.autocomplete(input, this.regionMapper.getCountriesOfRegion(this.regions.WORLD))

        // Create submit button
        let submitButton = document.createElement('button');
        submitButton.innerHTML = 'Submit';
        submitButton.type = 'button';
        submitButton.className = 'button';
        submitButton.name = 'comparison-submit-button';
        submitButton.id = submitButton.name;
        submitButton.addEventListener('click', e => this.handleSubmitInput(e))

        autocomplete.appendChild(input);

        div.appendChild(autocomplete);
        div.appendChild(submitButton);

        parent.appendChild(div);

    }

    handleSubmitInput(event) {
        let inputValue = this.getInputValue();
        this.dispatcher.call(this.dispatcherEvents.SELECT_COMPARISON_ITEM, event, inputValue);
        this.clearInputValue();
    }

    getInputValue() {
        let input = document.getElementById('comparison-input');
        return input.value;
    }

    clearInputValue() {
        let input = document.getElementById('comparison-input');
        input.value = '';
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
            this.createDeleteForTag(chip);
        }

        parent.appendChild(chip);
    }

    createDeleteForTag(chip) {
        let xButton = document.createElement('span');
        xButton.className = 'close-button';
        xButton.innerHTML = '&times;';
        xButton.value = chip.value;
        xButton.addEventListener('click', e => {
            this.dispatcher.call(this.dispatcherEvents.DELETE_COMPARISON_ITEM, e, e.target.value);
        });

        chip.appendChild(xButton);
    }

    clearChildNodes(parentNode) {
        while (parentNode.firstChild) {
          parentNode.firstChild.remove();
        }
    }

    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
     autocomplete(inp, arr) {
        var currentFocus;
        /*execute a function when someone writes in the text field:*/
        inp.addEventListener("input", function(e) {
            let a, b, i, val;
            val = this.value;

            /*close any already open lists of autocompleted values*/
            closeAllLists();

            if (!val) { return false;}

            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.length; i++) {
              /*check if the item starts with the same letters as the text field value:*/
              if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                    b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
              }
            }
        });
        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function(e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
              /*If the arrow DOWN key is pressed,
              increase the currentFocus variable:*/
              currentFocus++;
              /*and and make the current item more visible:*/
              addActive(x);
            } else if (e.keyCode == 38) { //up
              /*If the arrow UP key is pressed,
              decrease the currentFocus variable:*/
              currentFocus--;
              /*and and make the current item more visible:*/
              addActive(x);
            } else if (e.keyCode == 13) {
              /*If the ENTER key is pressed, prevent the form from being submitted,*/
              e.preventDefault();
              if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
              }
            }
        });
        function addActive(x) {
          /*a function to classify an item as "active":*/
          if (!x) return false;
          /*start by removing the "active" class on all items:*/
          removeActive(x);
          if (currentFocus >= x.length) currentFocus = 0;
          if (currentFocus < 0) currentFocus = (x.length - 1);
          /*add class "autocomplete-active":*/
          x[currentFocus].classList.add("autocomplete-active");
        }
        function removeActive(x) {
          /*a function to remove the "active" class from all autocomplete items:*/
          for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
          }
        }
        function closeAllLists(elmnt) {
          /*close all autocomplete lists in the document,
          except the one passed as an argument:*/
          var x = document.getElementsByClassName("autocomplete-items");
          for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
            x[i].parentNode.removeChild(x[i]);
          }
        }
      }
      /*execute a function when someone clicks in the document:*/
      document.addEventListener("click", function (e) {
          closeAllLists(e.target);
      });
      }
}