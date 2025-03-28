const { getDownloadURL, getStorage } = require('firebase-admin/storage');

const pangramsPath = process.env.REACT_APP_PANGRAMS_PATH_STORAGE;
const wordsPath = process.env.REACT_APP_WORDS_PATH_STORAGE;

// Takes a set as argument and returns an array with the elements shuffled
exports.shuffleSet = (set) => {
    const array = Array.from(set);
  
    // Shuffle the array (using Fisher-Yates algorithm)
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  
    return new Set(array);
}

// Downloads the file at the specified path in Firebase storage
// and returns all the text within it as a single string
exports.dlFile = async (path) => {
    const file = getStorage().bucket().file(path);

    try {
        const downloadURL = await getDownloadURL(file);
        const response = await fetch(downloadURL);
        const text = await response.text();

        return text;
    } catch (error) {
        console.error('Error reading file:', error);
        return '';
    }
}

// Reads from full word list text and return a list of words matching a regex pattern
// letterString = 7-letter string containing one copy of each unique letter from pangram
// anchorLetter = unique letter chosen at random from letterString. All 'valid' words contain
// the anchorLetter
exports.validWords = async (letterString, anchorLetter) => {
    if (letterString == null || anchorLetter == null) {
        throw new Error('Null arguments');
    }

    // Save dictionary text as one large string
    const text = await exports.dlFile(wordsPath);

    // Define a regex pattern and use it to find all matches from the input text
    const pattern = new RegExp(`^[${letterString}]*${anchorLetter}[${letterString}]*$`, 'gm'); 
    
    // array containing all valid words
    const matches = text.match(pattern);

    // Array containing only words between length 4 and 20 from above array
    const correctLengthMatches = []; 
    for (const match of matches) {
        if (match.length >= 4 && match.length <= 20) {
            correctLengthMatches.push(match);
        }
    }

    return correctLengthMatches;
}

// Helper method to read from pangram list text from Firebase storage and pick a word
// at random, then return that word
exports.choosePangram = async () => {
    const text = await exports.dlFile(pangramsPath); // should be a long string full of pangrams
    const pangramLine = exports.randPangramLine(); // choose random line index for pangram word

    try {
        const lines = text.split(/\r?\n/); // split single string text into an array of pangram strings
        const pangram = lines[pangramLine]; // Grab the pangram at the specified random array index
        
        return pangram;
    } catch (error) {
        throw new Error('Error parsing file:', error);
    }
}

// Returns a random number in range min-max, both inclusive
exports.randomInteger = (min, max) => {
    if (min > max) {
        throw new Error('Invalid range');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Uses randomInteger RNG to choose a random line number from the lines in pangram list (filtered_words.txt)
exports.randPangramLine = () => {
    // Count of lines in Pangram list, I don't anticipate this changing unless I switch word lists or update pangram definition
  const linesCount = 54825; 
  let index = null;
  try {
    index = exports.randomInteger(0, linesCount);
  } catch (e) {
    console.error(e);
  }
  return index;
}