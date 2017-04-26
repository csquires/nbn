// external
import React, { Component } from 'react';
import { connect } from 'react-redux';
// style
import '../styles/ElementSelector.css';
// other
import * as utils from '../utils/utils';
import * as modeActions from '../actions/modeActions';


class ElementSelector extends Component {

    constructor(props) {
        super(props);
        this.listenFor =
            utils.listenFor([
                {
                    command: 'select node',
                    action: () => this.props.setSelection('node')
                },
                {
                    command: 'select connection',
                    action: () => this.props.setSelection('connection')
                },
                {
                    command: 'select interaction',
                    action: () => this.props.setSelection('interaction')
                }
            ]);
    }

    _getClass(selection) {
        return this.props.selection === selection ? 'selected' : '';
    }

    componentWillReceiveProps(nextProps) {
        this.listenFor(nextProps);
    }

    render() {
        return (
            <div className="selector-container">
                <h3>Elements</h3>
                <ul className='selector-list'>
                    <li onClick={() => this.props.setSelection('node')} className={this._getClass('node')}>
                        <svg viewBox='0 0 100 100'>
                            <circle cx={50} cy={50} r={50} className='node-selector'/>
                        </svg>
                        <p>Node</p>
                    </li>
                    <li onClick={() => this.props.setSelection('connection')} className={this._getClass('connection')}>
                        <svg viewBox='0 0 100 100'>
                            <line x1={0} y1={0} x2={100} y2={100} className='connection-selector' />
                        </svg>
                        <p>Connection</p>
                    </li>
                    <li onClick={() => this.props.setSelection('interaction')} className={this._getClass('interaction')}>
                        <svg viewBox='0 0 100 100'>
                            <rect x={10} y={10} width={80} height={80} className='interaction-selector'/>
                        </svg>
                        <p>Interaction</p>
                    </li>
                </ul>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    selection: state.modeReducer.get('selection')
});

const mapDispatchToProps = (dispatch) => ({
    setSelection: (selection) => dispatch(modeActions.setSelection(selection))
});

export default connect(mapStateToProps, mapDispatchToProps)(ElementSelector);
