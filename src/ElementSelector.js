import React, { Component } from 'react';
import './ElementSelector.css';

class ElementSelector extends Component {



    render() {
        return (
            <ul className='element-selector'>
                <li onClick={() => this.props.setSelection('circle')}>
                    <svg viewBox='0 0 100 100'>
                        <circle cx={50} cy={50} r={50} className='circle-selector'/>
                    </svg>
                    <p>Circle</p>
                </li>
                <li onClick={() => this.props.setSelection('line')}>
                    <svg viewBox='0 0 100 100'>
                        <line x1={0} y1={0} x2={100} y2={100} className='line-selector' />
                    </svg>
                    <p>Line</p>
                </li>
            </ul>
        );
    }
}

export default ElementSelector;
