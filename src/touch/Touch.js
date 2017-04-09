import React, { Component } from 'react';
import './Touch.css';
import Canvas from '../Canvas';
import _ from 'lodash';
import { Map } from 'immutable';

// const mapTouches = (touches, f) => {
//     const numTouches = touches.length;
//     let res = {};
//     _.range(numTouches).forEach((i) => {
//         res[i] = f(touches[i])
//     });
//     return res;
// };

const eachTouch = (touches, f) => {
    const numTouches = touches.length;
    _.range(numTouches).forEach((i) => {
        console.log('i=',i);
        f(touches[i]);
    });
};



const canvasWidth = 1000;
const canvasHeight = 1000;

class Touch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ongoingTouchMap: Map(),
            lastKey: 0
        };
        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleTouchMove = this._handleTouchMove.bind(this);
        this._handleTouchEnd = this._handleTouchEnd.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._addTouches = this._addTouches.bind(this);
    }

    componentDidMount() {
        window.addEventListener('touchstart', this._handleTouchStart);
        window.addEventListener('touchend', this._handleTouchEnd);
        window.addEventListener('touchmove', this._handleTouchMove);
        window.addEventListener('mousedown', this._handleMouseDown);
        window.addEventListener('mousemove', this._handleMouseMove);
        window.addEventListener('mouseup', this._handleMouseUp);
    }

    componentWillUnmount() {
        window.removeEventListener('touchstart');
        window.removeEventListener('touchmove');
        window.removeEventListener('touchend');
        window.removeEventListener('mousedown');
        window.removeEventListener('mousemove');
        window.removeEventListener('mouseup');
    }

    _handleTouchStart(e) {
        e.preventDefault();
        const touches = e.changedTouches;
        this._addTouches(touches);
    }

    _handleTouchMove(e) {
        e.preventDefault();
        const touches = e.changedTouches;
        this._addTouches(touches);
    }

    _handleTouchEnd(e) {
        e.preventDefault();
        const touches = e.changedTouches;
        eachTouch(touches, (touch) => {
            this.setState({ongoingTouchMap: this.state.ongoingTouchMap.set(touch.identifier, null)})
        })
    }

    _handleMouseDown(e) {
        console.log('mouse down');
    }

    _handleMouseMove(e) {
        console.log('mouse move');
    }

    _handleMouseUp(e) {
        console.log('mouse up');
    }

    _addTouches(touchesToAdd) {
        eachTouch(touchesToAdd, (newTouch) => {
            const touchId = newTouch.identifier;
            const oldTouch = this.state.ongoingTouchMap.get(touchId);
            if (oldTouch) {
                const key = oldTouch.get('key');
                const oldTouchCoords = oldTouch.get('touchCoords');
                this.canvas.drawLine(key, oldTouchCoords, newTouch);
                const newOngoingTouchMap = this.state.ongoingTouchMap.setIn([touchId, 'touchCoords'], newTouch);
                this.setState({ongoingTouchMap: newOngoingTouchMap});
            } else {
                const newOngoingTouchMap = this.state.ongoingTouchMap.set(touchId, Map({
                    touchCoords: newTouch,
                    key: this.state.lastKey + 1
                }));
                this.setState({ongoingTouchMap : newOngoingTouchMap, lastKey: this.state.lastKey + 1})
            }
        });
    }

    render() {
        return (
            <div className="canvas-container">
                <Canvas canvasWidth={canvasWidth} canvasHeight={canvasHeight} ref={(c) => this.canvas = c}/>
            </div>

        );
    }
}

Touch.propTypes = {
    selection: React.PropTypes.string
};

export default Touch;
