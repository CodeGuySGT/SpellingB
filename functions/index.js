const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const { onRequest } = require("firebase-functions/v2/https");
const { getDownloadURL, getStorage } = require('firebase-admin/storage');

admin.initializeApp();

const pangramsPath = "filtered_words.txt";
const wordsPath = "word.list";

// GET request event handler; returns a random pangram
exports.getPangram = onRequest((request, response) => {
  return cors(request, response, async () => {

    // Error handling to only allow get requests to this endpoint
    if (request.method !== 'GET') {
      return response.status(404).json({
          message: 'Not allowed'
      });
    };

    // Choose and store a random pangram from pre-made list 
    let pangram;
    try {
      pangram = await choosePangram();
    } catch (e) {
      console.error(e);
    }

    // Initialize a set and add each character to the set
    // result is all 7 the unique letters in the pangram
    const uniqueLetters = new Set();
    for (let step = 0; step < pangram.length; step++) {
      uniqueLetters.add(pangram.charAt(step));
    }

    // Build a string 7 chars long from the unique letters in the set
    let letterString = "";
    uniqueLetters.forEach((letter) => {
      letterString += letter;
    })
    letterString = letterString.trim();
    
    // Grab a letter at random to be anchor
    let randIndex; 
    try {
      randIndex = await randomInteger(0, letterString.length - 1);
    } catch (e) {
      console.error(e);
    }
    const anchorLetter = letterString[randIndex]; 
    
    let wordsArray;
    try {
      wordsArray = await validWords(letterString, anchorLetter);
    } catch (e) {
      console.error(e);
    }

    // Create a JavaScript object with required info
    const data = {
      pangram: pangram,
      letters: letterString,
      anchorLetter: anchorLetter,
      validWords: wordsArray
    };

    // Convert the object to a JSON string
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));    
  })
});

// Downloads the file at the specified path in Firebase storage
// and returns all the text within it as a single string
const dlFile = async (path) => {
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

// Reads from full word list text and return a list of words
// matching a regex pattern
// letterString = 7-letter string containing one copy of each unique letter from pangram
// anchorLetter = unique letter chosen at random from letterString. All 'valid' words contain
// the anchorLetter
const validWords = async (letterString, anchorLetter) => {

  if (letterString == null || anchorLetter == null) {
    throw new Error('Null arguments');
  }

  // Save dictionary text as one large string
  const text = await dlFile(wordsPath);

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
const choosePangram = async () => {
  const text = await dlFile(pangramsPath); // should be a long string full of pangrams
  const pangramLine = randPangramLine(); // choose random line index for pangram word

  try {
    const lines = text.split('\r\n'); // split single string text into an array of pangram strings
    const pangram = lines[pangramLine]; // Grab the pangram at the specified random array index
    console.log(pangram)

    return pangram;
  } catch (error) {
    throw new Error('Error parsing file:', error);
  }
};

// Returns a random number in range min-max, both inclusive
function randomInteger(min, max) {
  if (min > max) {
    throw new Error('Invalid range');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Uses randomInteger RNG to choose a random line number from the lines in pangram list (filtered_words.txt)
function randPangramLine() {
  // Count of lines in Pangram list, I don't anticipate this changing unless I switch word lists or update pangram definition
  const linesCount = 54825; 
  let index = null;
  try {
    index = randomInteger(0, linesCount);
  } catch (e) {
    console.error(e);
  }
  return index;
}
