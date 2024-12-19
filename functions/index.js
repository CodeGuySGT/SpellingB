const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const { onRequest } = require("firebase-functions/v2/https");
const { getDownloadURL, getStorage } = require('firebase-admin/storage');

const app = admin.initializeApp();
const storage = admin.storage(app);

// GET request event handler; returns a random pangram
exports.getPangram = onRequest((request, response) => {
  return cors(request, response, async () => {

    let pangram = await choosePangram();
    console.log(pangram);

    // return choosePangram();
    response.send(pangram);
  })
});

// Helper method to read from pangram list file in Firebase storage and pick a word
// at random, then return that word
const choosePangram = async () => {
  const pangramList = getStorage().bucket().file("filtered_words.txt");
  const pangramLine = randPangramLine(); // choose random line index for pangram word

  try {
    const downloadURL = await getDownloadURL(pangramList);
    const response = await fetch(downloadURL);
    const text = await response.text();
    const lines = text.split('\n');
    const pangram = lines[pangramLine];

    return pangram;
  } catch (error) {
    console.error('Error reading file:', error);
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