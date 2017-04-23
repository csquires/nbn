// external
import React, { Component } from 'react';
import { connect } from 'react-redux';
import SpeechRecognition from 'react-speech-recognition';
import Notifications from 'react-notification-system-redux';
// components
import Canvas from './components/Canvas';
import ElementSelector from './components/ElementSelector';
// style
import logo from './logo.svg';
import './styles/App.css';
// other
import * as utils from './utils/utils';
import * as shapeActions from './actions/shapeActions';


class App extends Component {

    constructor(props) {
        super(props);
        this.listenFor =
            utils.listenFor([
                {
                    command: 'undo',
                    action: this.props.undo
                }
            ])
    }

    componentWillReceiveProps(nextProps) {
        this.listenFor(nextProps);
    }

    render() {
        console.log("transcript:", this.props.transcript);
        return (
            <div className="App">
                <Notifications
                    notifications={this.props.notifications}
                />
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Nothing But Net</h2>
                </div>
                <Canvas
                    transcript={this.props.transcript}
                    resetTranscript={this.props.resetTranscript}
                />
                <ElementSelector
                    transcript={this.props.transcript}
                    resetTranscript={this.props.resetTranscript}
                />
                <button onClick={() => {console.log('undo'); this.props.undo()}} >
                    Undo
                </button>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    notifications: state.notifications
});

const mapDispatchToProps = (dispatch) => ({
    undo: () => dispatch(shapeActions.undo())
});

export default connect(mapStateToProps, mapDispatchToProps)(SpeechRecognition(App));
