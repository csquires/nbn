// external
import React, { Component } from 'react';
import { connect } from 'react-redux';
import SpeechRecognition from 'react-speech-recognition';
import Notifications from 'react-notification-system-redux';
import Modal from 'react-modal';
import Dropzone from 'react-dropzone';
// components
import Canvas from './components/Canvas';
import ElementSelector from './components/ElementSelector';
// style
import logo from './logo.svg';
import './styles/App.css';
// other
import * as utils from './utils/utils';
import * as networkActions from './actions/networkActions';
import { commandMap } from './reducers/commandReducer';
import * as notificationActions from './actions/notificationActions';
import * as modeActions from './actions/modeActions';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listening: false,
        };
        this.listenFor =
            utils.listenFor([
                {
                    command: 'undo',
                    action: this.props.undo
                }
            ]);
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
        if (nextProps.numSelected > 1) {
            this.props.showHint('connect');
        }
        console.log(nextProps.transcript);
        if (nextProps.transcript.toLowerCase().includes('hey network builder')) {
            this.setState({listening: true});
            setTimeout(() => this.setState({listening: false}), 2000);
            this.props.resetTranscript();
        }
        // this.listenFor(nextProps);
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
                    <img src={logo} className='App-logo' alt='logo' />
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
