import React, { Component } from 'react';
import Touch from './touch/Touch';
import ElementSelector from './ElementSelector';
import logo from './logo.svg';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selection: null
        }
    }

    _setSelection(selection) {
        this.setState({selection: selection})
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Welcome to React</h2>
                </div>
                <Touch />
                <ElementSelector setSelection={this._setSelection} />
            </div>
        );
    }
}

export default App;
