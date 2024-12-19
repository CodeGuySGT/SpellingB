const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const { onRequest } = require("firebase-functions/v2/https");
const { getDownloadURL, getStorage } = require('firebase-admin/storage');

const app = admin.initializeApp();
const storage = admin.storage(app);

const pangramsPath = "filtered_words.txt";
const wordsPath = "word.list";

// GET request event handler; returns a random pangram
exports.getPangram = onRequest((request, response) => {
  return cors(request, response, async () => {

    let pangram = await choosePangram();
    console.log(pangram);

    // return choosePangram();
    response.send(pangram);
  })
});

// Downloads the file at the specified path in Firebase storage
// and returns all the text within it as a single string
const getFile = async (path) => {
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

// Helper method to read from full word list text and return a list of words
// matching a regex pattern
const validWords = async (pangram) => {
  const text = await getFile(wordsPath);

  // Initialize a set and add each character to the set
  // result is all 7 the unique letters in the pangram
  const uniqueLetters = new Set();
  for (let step = 0; step < pangram.length; step++) {
    uniqueLetters.add(pangram.charAt(step));
  }

  // Build a string 7 chars long from the unique letters in the set
  const letterString = "";
  uniqueLetters.forEach((letter) => {
    letterString.concat(letter);
  })

  const randIndex = randomInteger(0, letterString.length - 1); // choose a random index in the letters string
  const anchorLetter = letterString[randIndex]; // Grab a letter at random to be anchor

  // Define a regex pattern and use it to find all matches from the input text
  const pattern = new RegExp(`^[${letterString}]*${anchorLetter}[${letterString}]*$`) // avert your eyes
  const words = text.matchAll(pattern);
  return words;
}

// Helper method to read from pangram list text from Firebase storage and pick a word
// at random, then return that word
const choosePangram = async () => {
  const text = await getFile(pangramsPath); // should be a long string full of pangrams
  const pangramLine = randPangramLine(); // choose random line index for pangram word

  try {
    const lines = text.split('\n'); // split single string text into an array of pangram strings
    const pangram = lines[pangramLine]; // Grab the pangram at the specified random array index

    return pangram;
  } catch (error) {
    console.error('Error parsing file:', error);
    return '';
  }
};

// Returns a random number in range min-max, both inclusive
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Uses randomInteger RNG to choose a random line number from the lines in pangram list (filtered_words.txt)
function randPangramLine() {
  // Count of lines in Pangram list, I don't anticipate this changing unless I switch word lists or update pangram definition
  const linesCount = 54825; 
  return randomInteger(0, linesCount);
}