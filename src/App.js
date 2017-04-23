import React, { Component } from 'react';
import Touch from './touch/Touch';
import ElementSelector from './ElementSelector';
import logo from './logo.svg';
import './App.css';
import SpeechRecognition from 'react-speech-recognition';

class App extends Component {

    constructor(props) {
        super(props);
        this._setSelection = this._setSelection.bind(this);
    }

    render() {
        console.log("transcript:", this.props.transcript);
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Nothing But Net</h2>
                </div>
                <Touch
                    transcript={this.props.transcript}
                    resetTranscript={this.props.resetTranscript}
                />
                <ElementSelector
                    transcript={this.props.transcript}
                    resetTranscript={this.props.resetTranscript}
                />
            </div>
        );
    }
}

export default SpeechRecognition(App);
