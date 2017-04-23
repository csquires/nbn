// external
import React, { Component } from 'react';
import { connect } from 'react-redux';
// style
import './ElementSelector.css';
// other
import * as utils from './utils/utils';
import * as modeActions from './actions/modeActions';


class ElementSelector extends Component {

    constructor(props) {
        super(props);
        this.listenFor =
            utils.listenFor([
                {
                    command: 'select circle',
                    action: () => this.props.setSelection('circle')
                },
                {
                    command: 'select arrow',
                    action: () => this.props.setSelection('arrow')
                },
                {
                    command: 'select box',
                    action: () => this.props.setSelection('box')
                }
            ]);
    }

    _getClass(selection) {
        return this.props.selection === selection ? 'selected' : '';
    }

    componentWillReceiveProps(nextProps) {
        this.listenFor(nextProps.transcript, nextProps.resetTranscript);
    }

    render() {
        return (
            <div className="selector-container">
                <h3>Elements</h3>
                <ul className='selector-list'>
                    <li onClick={() => this.props.setSelection('circle')} className={this._getClass('circle')}>
                        <svg viewBox='0 0 100 100'>
                            <circle cx={50} cy={50} r={50} className='circle-selector'/>
                        </svg>
                        <p>Circle</p>
                    </li>
                    <li onClick={() => this.props.setSelection('arrow')} className={this._getClass('arrow')}>
                        <svg viewBox='0 0 100 100'>
                            <line x1={0} y1={0} x2={100} y2={100} className='arrow-selector' />
                        </svg>
                        <p>Arrow</p>
                    </li>
                    <li onClick={() => this.props.setSelection('box')} className={this._getClass('box')}>
                        <svg viewBox='0 0 100 100'>
                            <rect x={10} y={10} width={80} height={80} className='box-selector'/>
                        </svg>
                        <p>Box</p>
                    </li>
                </ul>
            </div>
        );
    }
}

ElementSelector.propTypes = {
};

const mapStateToProps = (state) => ({
    selection: state.modeReducer.get('selection')
});

const mapDispatchToProps = (dispatch) => ({
    setSelection: (selection) => dispatch(modeActions.setSelection(selection))
});

export default connect(mapStateToProps, mapDispatchToProps)(ElementSelector);
