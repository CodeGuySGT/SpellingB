# SpellingB

The game is live now, and playable [here](https://spellingb-11a56.web.app/)!

This is a personal project inspired by the word game "[Spelling Bee](https://www.nytimes.com/puzzles/spelling-bee)" from the New York Times. The goal is to replicate the basic functionality of that game, but on my own web app and in a way that allows users to play the game an unlimited number of times. The original game only allows users to play once a day. Otherwise, the main purpose of this project is for my own learning and fun!

This project is my own work, and I did not use a guide or walkthrough to trivially follow steps. I did draw some insight and inspiration from [this walkthrough](https://medium.com/@charpellumeh/build-a-serverless-full-stack-app-using-firebase-cloud-functions-81afe34a64fc) by Ebuka Umeh; but that walkthrough is for a much simpler, and completely different, app, which doesn't include reCAPTCHA security, web hosting, or file storage.

## Gameplay

At the time of writing, the deployed code is for the 'MVP' version of the game, which includes only the basic gameplay. This functionality loads the fully-playable game to the browser on page load, using a random set of 7 distinct letters that is guaranteed to always spell at least one word that uses all 7 letters (called a 'pangram'). There is also simple messaging for different types of invalid inputs such as words missing the key letter, or using the wrong letters, not long enough, or not in dictionary. Finally, the game keeps a running score and list of already-guessed words for a single game until the page is refreshed.

The string of random letters are all the letters the player can use to try to form words. Words must be at least four letters long, and must use the 'anchor letter', which is the letter found to the right of the two dashes, like this: -- 'x'

## Tech stack

- JavaScript
- HTML
- CSS
- React.js
- Node.js
- Firebase
    - Serverless functions
    - Web Hosting
    - File storage
    - App Check
- ReCAPTCHA v3

## Roadmap

- [ ] Add unit tests and any other tests as needed to support further development
- [ ] Separate individual letters so each letter is in its own box or bubble in the UI, with the anchor letter more clearly demarcated
- [ ] Tweak scoring logic to add more weight to longer words. Current logic is simply word length - 3
- [ ] Add special scoring and messaging whenever user finds a 'pangram', a word using all 7 letters at least once
- [ ] Build out database in Cloud Firestore to track users and add user login
- [ ] Add high score page to track each user by their total accumulated score
- [ ] Potentially improve UI visually by implementing some simple design system

## License

Copyright (c) 2025 Sherrick Thuesmunn

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.