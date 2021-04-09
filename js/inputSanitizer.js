class InputSanitizer {
    /**
     * Purpose: Capitalizes the first letter of each word in given string unless word is "and"
     * @param {string} input 
     * @returns {string} formatted string
     */
    formatCountryOrRegionNames(input) {
    let words = input.split(' ');
    let capitalizedWords = [];
    let res = '';

    for (let word of words) {
        if (word !== 'and') {
            word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        capitalizedWords.push(word);
    }

    for (let word of capitalizedWords) {
        res = res + ' ' + word;
    }

    return res.trim();
    }
}