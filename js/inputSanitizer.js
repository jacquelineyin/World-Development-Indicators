class InputSanitizer {
    /**
     * Purpose: Capitalizes the first letter of each word in given string
     * @param {string} input 
     * @returns {string} formatted string
     */
    formatCountryOrRegionNames(input) {
    let words = input.split(' ');
    let capitalizedWords = [];
    let res = '';

    for (let word of words) {
        word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        capitalizedWords.push(word);
    }

    for (let word of capitalizedWords) {
        res = res + ' ' + word;
    }

    return res.trim();
    }
}