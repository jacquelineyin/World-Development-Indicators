/**
 * Class to create autocomplete for input field
 * Credit: https://www.w3schools.com/howto/howto_js_autocomplete.asp
 */
class AutocompleteCreator {

    constructor() {
        this.keyEventMapper = new KeyEventMapper();
    }

    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    autocomplete(inputElem, submitButton, arr) {
        let indexOfFocus;
        let autoCreator = this;
        autoCreator.inputElem = inputElem;

        /*execute a function when someone writes in the text field:*/
        inputElem.addEventListener("input", function(e) {
            // let itemContainer, item, index;
            let val = this.value;

            /*close any already open lists of autocompleted values*/
            autoCreator.closeAllLists();

            if (!val) { return false;}

            // Initialize index of current focused item
            indexOfFocus = -1;
            
            /*create a DIV element that will contain the items (values):*/
            const itemContainer = autoCreator.createItemContainer(inputElem);

            /*for each item in the array...*/
            autoCreator.createItems(arr, autoCreator, val, inputElem, itemContainer);
        });
        
        /*execute a function presses a key on the keyboard:*/
        inputElem.addEventListener("keydown", function(e) {
            let itemContainer = document.getElementById(inputElem.id + '-autocomplete-list');
            let items;

            if (itemContainer) items = itemContainer.getElementsByTagName("div");
         
            // Handle key events & update index as appropriate to event
            indexOfFocus = autoCreator.handleKeyEvent(e, indexOfFocus, items)

        });

        /*execute a function when someone clicks in the document:*/
        document.addEventListener("click", function (e) {
            autoCreator.closeAllLists(e.target);
        });
      }

    handleKeyEvent(e, indexOfFocus, items) {
        let {keyCode} = e;
        const {ENTER, ESC, UP, DOWN} = this.keyEventMapper;

        switch (keyCode) {
            case DOWN:
                return this.handleDownKey(indexOfFocus, items);
            case UP:
                return this.handleUpKey(indexOfFocus, items);
            case ESC:
                this.handleEscKey();
                return indexOfFocus;
            case ENTER:
                return this.handleEnterKey(e, indexOfFocus, items);
            default: return indexOfFocus;
        }
    }

    handleDownKey(index, items) {
        index++;
        return this.addActive(items, index);
    }

    handleUpKey(index, items) {
        index--;
        return this.addActive(items, index);
    }

    handleEnterKey(e, index, items) {
        e.preventDefault();
        if (index > -1 && items) {
            /*and simulate a click on the "active" item:*/
            items[index].click();
        }
        return index;
    }

    handleEscKey() {
        this.closeAllLists(null, true);
    }

    closeAllLists(clickedElem, isEsc) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        let autocompleteItems = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < autocompleteItems.length; i++) {
            if (this.isClickOutside(clickedElem, autocompleteItems, i, this.inputElem) || isEsc) {
                autocompleteItems[i].parentNode.removeChild(autocompleteItems[i]);
            }
        }
    }

    isClickOutside(clickedElem, autocompleteItems, index, inputElem) {
        return clickedElem != autocompleteItems[index] && clickedElem != inputElem;
    }

    /*a function to classify an item as "active":*/
    addActive(items, index) {
        if (!items) return false;

        /*start by removing the "active" class on all items:*/
        this.removeActive(items);

        // Adjust index in a modular fashion that handles negative values
        if (index >= items.length) index = 0;
        if (index < 0) index = (items.length - 1);

        /*add class "autocomplete-active":*/
        items[index].classList.add("autocomplete-active");
        return index;
      }

    removeActive(items) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < items.length; i++) {
          items[i].classList.remove("autocomplete-active");
        }
      }


    createItems(arr, autoCreator, val, inputElem, closeAllLists, itemContainer) {
        let index;
        for (index = 0; index < arr.length; index++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (autoCreator.checkIfSameString(arr, index, val)) {
                /*create a DIV element for each matching element:*/
                this.createItem(arr, index, val, inputElem, closeAllLists, itemContainer);
            }
        }
    }

    createItem(arr, index, val, inputElem, itemContainer) {
        let item = document.createElement('div');
        let autoCreator = this;
        console.log(val);
        console.log(index);
        
        /*make the matching letters bold:*/
        this.makeMatchingLettersBold(item, arr, index, val);
        
        /*insert a input field that will hold the current array item's value:*/
        item.innerHTML += `<input type='hidden' value='${arr[index]}'>`;
        
        /*execute a function when someone clicks on the item value (DIV element):*/
        item.addEventListener("click", function (e) {
            /*insert the value for the autocomplete text field:*/
            inputElem.value = this.getElementsByTagName("input")[0].value;

            autoCreator.closeAllLists();
        });
        itemContainer.appendChild(item);
    }

    makeMatchingLettersBold(item, arr, index, val) {
        let matchingSubstr = arr[index].substr(0, val.length);
        let restOfSubstr = arr[index].substr(val.length);

        item.innerHTML = `<strong> ${matchingSubstr}</strong>`;
        item.innerHTML += restOfSubstr;
    }

    createItemContainer(inputElem) {
        const itemContainer = document.createElement('div');
        itemContainer.setAttribute("id", inputElem.id + "-autocomplete-list");
        itemContainer.setAttribute("class", "autocomplete-items");
        
        /*append the DIV element as a child of the autocomplete container:*/
        inputElem.parentNode.appendChild(itemContainer);
        return itemContainer;
    }

    checkIfSameString(arr, i, val) {
        return arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase();
    }
}