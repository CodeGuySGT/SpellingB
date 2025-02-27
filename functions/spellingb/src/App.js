import React, { Component } from 'react';
import './App.css';
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "firebase/app-check";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  reCAPTCHAKey: process.env.REACT_APP_RECAPTCHA_SITE_KEY,
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

const app = initializeApp( firebaseConfig );

// Create a ReCaptchaEnterpriseProvider instance using your reCAPTCHA Enterprise
// site key and pass it to initializeAppCheck().
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(firebaseConfig.reCAPTCHAKey),
  isTokenAutoRefreshEnabled: true // Set to true to allow auto-refresh.
});

const functions = getFunctions();
const getPangram = httpsCallable(functions, 'getPangram');

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      validWords: [],
      message: '',
      letters: '',
      anchor: '',
      currentWord: '',
      alreadyFound: [],
      score: 0
    }
  }

  componentDidMount() {
    return getToken(appCheck, /* forceRefresh= */ false)
      .then((tokenResponse) => {
        const token = tokenResponse.token;
  
        return getPangram({
          headers: {
            'X-Firebase-AppCheck': token,
            'Content-Type': 'application/json'
          }
        });
      })
      .then((response) => {
        this.setState({
          validWords: response.data.validWords,
          letters: response.data.letters,
          anchor: response.data.anchorLetter
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  addWord(event) {
    event.preventDefault()
    const { validWords, anchor } = this.state;
    let { score, alreadyFound } = this.state;
    const newWord = this.newWord.value.toLowerCase();
    
    if (!newWord.includes(anchor)) {
      this.setState({
        message: `Missing key letter ${ anchor }`
      })
    } else if (alreadyFound.includes(newWord)) {
      this.setState({
        message: 'Already found'
      })
    } else if (!validWords.includes(newWord)) {
      this.setState({
        message: 'Not in word list'
      })
    } else {
      const points = newWord.length - 3;
      score += points;
      alreadyFound.push(newWord);
      this.setState({
        alreadyFound: alreadyFound,
        score: score,
        message: `'${ newWord }' added; +${ points } points!`
      })
    }
    this.addForm.reset();
  }

  render() {
    const { score, message, letters, anchor, alreadyFound } = this.state;
    return (
      <div className="container">
        <h1>SpellingB</h1>
        <div className="content">
          <h2>{ letters } -- '{ anchor }'</h2>
          <form ref={input => {this.addForm = input}} className="form-inline" onSubmit={this.addWord.bind(this)}>
            <div className="form-group">
              <label htmlFor="newWordInput" className="sr-only">Add New Word</label>
              <input ref={input => {this.newWord = input}}
                type="text" className="form-control" id="newWordInput" />
            </div>
            <button className="btn btn-primary">Add</button>
          </form>
          {
            message !== '' && <p className="message text-danger">{message}</p>
          }
          <h3>Score: { score }</h3>
          <div>
            {alreadyFound.map((item, index) => (
              <span key={index}>
                {item}
                {index < alreadyFound.length - 1 ? ', ' : ''} 
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }
} 
export default App;
