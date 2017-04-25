// external
import React, { Component } from 'react';
import { connect } from 'react-redux';
import SpeechRecognition from 'react-speech-recognition';
import Notifications from 'react-notification-system-redux';
import Modal from 'react-modal';
import Dropzone from 'react-dropzone';
import { Table } from 'react-bootstrap';
// components
import Canvas from './components/Canvas';
import ElementSelector from './components/ElementSelector';
// style
import logo from './logo.svg';
import './styles/App.css';
// other
import * as networkActions from './actions/networkActions';
import { commandMap } from './reducers/commandReducer';
import * as notificationActions from './actions/notificationActions';
import * as modeActions from './actions/modeActions';
import * as utils from './utils/utils';


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listening: false,
            recognizedSpeech: null
        };
        this._handleKeyPress = this._handleKeyPress.bind(this);
        this._handleUploadedFile = this._handleUploadedFile.bind(this);
    }

    componentDidMount() {
        this.reader = new FileReader();
        this.reader.onload = () => {
            const networkJson = JSON.parse(this.reader.result);
            this.props.setNetwork(networkJson);
        };
        window.addEventListener('keypress', this._handleKeyPress);
        // const SpeechRecognition = SpeechRecognition;
        // this.recognition = new SpeechRecognition();
        // this.recognition.start();
        // this.recognition.onresult = (e) => {
        //     console.log(e);
        // }
    }

    componentWillUnmount() {
        window.removeEventListener('keypress');
    }

    componentWillReceiveProps(nextProps) {
        const transcript = nextProps.transcript.toLowerCase();
        if (nextProps.numSelected > 1) {
            this.props.showHint('connect');
        }
        if (utils.includesCloseMatch(transcript, 'yo alex')) {
            this.setState({listening: true});
            setTimeout(() => this.setState({listening: false}), 10000);
            this.props.resetTranscript();
        }
        if (this.state.listening) {
            this.props.commands.forEach((command, commandKey) => {
                const commandSpeech = command.get('command');
                if (utils.includesCloseMatch(transcript, commandSpeech)) {
                    const response = command.get('response');
                    const action = this.props.commandMap.get(commandKey);
                    action();
                    this.props.resetTranscript();
                    this.setState({listening: false, recognizedSpeech: commandSpeech});
                    setTimeout(() => this.setState({recognizedSpeech: null}), 2000);
                    if (response) this.speak(response);
                }
            })
        }
        // this.listenFor(nextProps);
    }

    speak(response) {
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = response;
        window.speechSynthesis.speak(utterance);
    }

    _handleKeyPress(e) {
        const matchingCommandKey = this.props.commands.findKey((command) => command.get('key') === e.key);
        if (matchingCommandKey) {
            const command = this.props.commandMap.get(matchingCommandKey);
            command();
        }
    }

    _handleUploadedFile(files) {
        const file = files[0];
        this.reader.readAsText(file);
    }

    render() {
        const defaultBanner = () => {
            return [
                <img src={logo} className='App-logo' alt='logo' />,
                <h2>Nothing But Net</h2>
            ]
        };
        return (
            <div className='App'>
                <Notifications
                    notifications={this.props.notifications}
                />
                <Modal
                    isOpen={this.props.fileUploadOpen}
                    contentLabel='hi'
                >
                    <button onClick={this.props.closeFileUploadModal} >Close</button>
                    <Dropzone
                        onDrop={this._handleUploadedFile}
                        accept={'.nbn.txt'}
                        multiple={false}
                    />
                </Modal> :
                <div className={`App-header${this.state.listening ? ' listening' : ''}`}>
                    {
                        this.state.listening ?
                            <h1>{this.state.recognizedSpeech ? this.state.recognizedSpeech : this.props.transcript}</h1> :
                            defaultBanner()
                    }

                </div>
                <Canvas
                    transcript={this.props.transcript}
                    resetTranscript={this.props.resetTranscript}
                />
                {/*<ElementSelector*/}
                    {/*transcript={this.props.transcript}*/}
                    {/*resetTranscript={this.props.resetTranscript}*/}
                {/*/>*/}
                <Table
                    className="command-table"
                    striped
                    hover
                >
                    <thead>
                        <th>Action</th>
                        <th>Keyboard shortcut</th>
                        <th>To use the assistant, say:</th>
                    </thead>
                    <tbody>
                    {
                        this.props.commands.map((command, commandKey) => {
                            const title = command.get('title');
                            const key = command.get('key');
                            const speech = command.get('command');
                            return (
                                <tr onClick={this.props.commandMap.get(commandKey)}>
                                    <td className='text-left'>{title}</td>
                                    <td className='text-left'>{key}</td>
                                    <td className='text-left'>{speech}</td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </Table>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    notifications: state.notifications,
    commands: state.commandReducer.get('commands'),
    numSelected: state.shapes.getIn(['present', 'num_selected']),
    fileUploadOpen: state.modeReducer.getIn(['modals', 'file_upload', 'is_open'])
});

const mapDispatchToProps = (dispatch) => ({
    undo: () => dispatch(networkActions.undo()),
    commandMap: commandMap.map((action) => () => dispatch(action())),
    showHint: (hintName) => dispatch(notificationActions.showHint(hintName)),
    closeFileUploadModal: () => dispatch(modeActions.closeModal('file_upload')),
    setNetwork: (network) => dispatch(networkActions.setNetwork(network))
});

export default connect(mapStateToProps, mapDispatchToProps)(SpeechRecognition(App));
