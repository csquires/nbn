import React, { Component } from 'react';
import Touch from './touch/Touch';
import ElementSelector from './ElementSelector';
import logo from './logo.svg';
import './App.css';
import SpeechRecognition from 'react-speech-recognition';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selection: null
        };
        this._setSelection = this._setSelection.bind(this);
    }

    _setSelection(selection) {
        this.setState({selection: selection})
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
                    selection={this.state.selection}
                    transcript={this.props.transcript}
                    resetTranscript={this.props.resetTranscript}
                />
                <ElementSelector
                    selection={this.state.selection}
                    setSelection={this._setSelection}
                    transcript={this.props.transcript}
                    resetTranscript={this.props.resetTranscript}
                />
            </div>
        );
    }
}

export default SpeechRecognition(App);
