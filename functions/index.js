const admin = require('firebase-admin');
const { onCall } = require("firebase-functions/v2/https");
const helpers = require('./helpers.cjs');

admin.initializeApp();

// GET request event handler; returns a random pangram
exports.getPangram = onCall(

  // Reject requests with missing or invalid App Check tokens.
  { enforceAppCheck: true }, async () => { 

    let pangram;
    try {
      pangram = await helpers.choosePangram();
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
    const shuffled = helpers.shuffleSet(uniqueLetters);
    shuffled.forEach((letter) => {
      letterString += letter;
    })
    letterString = letterString.trim();
    
    // Grab a letter at random to be anchor
    let randIndex; 
    try {
      randIndex = helpers.randomInteger(0, letterString.length - 1);
    } catch (e) {
      console.error(e);
    }
    const anchorLetter = letterString[randIndex]; 
    
    let wordsArray;
    try {
      wordsArray = await helpers.validWords(letterString, anchorLetter);
    } catch (e) {
      console.error(e);
    }

    // return data to client
    return { 
      pangram: pangram,
      letters: letterString,
      anchorLetter: anchorLetter,
      validWords: wordsArray
    };
  }
);
