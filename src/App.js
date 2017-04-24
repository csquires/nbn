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
import { commandMap } from './reducers/commandReducer';
import * as notificationActions from './actions/notificationActions';

class App extends Component {

    constructor(props) {
        super(props);
        this.listenFor =
            utils.listenFor([
                {
                    command: 'undo',
                    action: this.props.undo
                }
            ]);
        this._handleKeyPress = this._handleKeyPress.bind(this);
    }

    componentDidMount() {
        window.addEventListener('keypress', this._handleKeyPress);
    }

    componentWillUnmount() {
        window.removeEventListener('keypress');
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.numSelected > 1) {
            this.props.showHint('connect');
        }
        this.listenFor(nextProps);
    }

    _handleKeyPress(e) {
        const matchingCommandKey = this.props.commands.findKey((command) => command.get('key') === e.key);
        if (matchingCommandKey) {
            const command = this.props.commandMap.get(matchingCommandKey);
            command();
        }
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
    notifications: state.notifications,
    commands: state.commandReducer.get('commands'),
    numSelected: state.shapes.getIn(['present', 'num_selected'])
});

const mapDispatchToProps = (dispatch) => ({
    undo: () => dispatch(shapeActions.undo()),
    commandMap: commandMap.map((action) => () => dispatch(action())),
    showHint: (hintName) => dispatch(notificationActions.showHint(hintName))
});

export default connect(mapStateToProps, mapDispatchToProps)(SpeechRecognition(App));
