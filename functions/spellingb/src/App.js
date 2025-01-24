import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

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
    return axios.get('https://getpangram-3kfmj5xhqq-uc.a.run.app').then((response) => {
      this.setState({
        validWords: response.data.validWords,
        letters: response.data.letters,
        anchor: response.data.anchorLetter
      }, () => {
        console.log(this.state.validWords);
        console.log(this.state.letters);
        console.log(this.state.anchor);
      })
    })
  }

  addWord(event) {
    event.preventDefault()
    const { validWords, anchor } = this.state;
    let { score, alreadyFound } = this.state;
    const newWord = this.newWord.value.toLowerCase();
    
    console.log(newWord);

    
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
