import React, { Component } from 'react';
import './Touch.css';
import Canvas from '../Canvas';
import _ from 'lodash';
import { Map } from 'immutable';
import * as utils from '../utils';

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
        f(touches[i]);
    });
};


class Touch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ongoingTouchMap: Map(),
            lastTouchKey: 0,
            currentCircleKey: 0,
            currentArrowKey: 0,
            currentBoxKey: 0,
            isMouseDown: false
        };
        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleTouchMove = this._handleTouchMove.bind(this);
        this._handleTouchEnd = this._handleTouchEnd.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._addTouches = this._addTouches.bind(this);
        const thisComponent = this;
        this.listenFor = utils.listenFor([
            {
                command: 'clear',
                action: () => thisComponent.canvas.clear()
            },
            {
                command: 'undo',
                action: () => thisComponent.canvas.undo()
            }
        ])
    }

    // lifecycle
    componentDidMount() {
        window.addEventListener('touchstart', this._handleTouchStart);
        window.addEventListener('touchmove', this._handleTouchMove);
        window.addEventListener('touchend', this._handleTouchEnd);

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
    componentWillReceiveProps(nextProps) {
        this.listenFor(nextProps.transcript, nextProps.resetTranscript)
    }

    // touch events
    _handleTouchStart(e) {
        e.preventDefault();
        console.log(e);
        console.log('touch start');
        const touches = e.changedTouches;
        this._addTouches(touches);
    }
    _handleTouchMove(e) {
        console.log('touch move');
        const touches = e.changedTouches;
        this._addTouches(touches);
    }
    _handleTouchEnd(e) {
        console.log('touch end');
        const touches = e.changedTouches;
        eachTouch(touches, (touch) => {
            this.setState({ongoingTouchMap: this.state.ongoingTouchMap.set(touch.identifier, null)})
        })
    }

    // mouse events
    _handleMouseDown(e) {
        e.preventDefault();
        const mouseX = e.pageX;
        const mouseY = e.pageY;
        this.setState({isMouseDown: true});
        switch(this.props.selection) {
            case 'circle':
                this.canvas.startCircle(this.state.currentCircleKey, mouseX, mouseY);
                break;
            case 'arrow':
                this.canvas.startArrow(this.state.currentArrowKey, mouseX, mouseY);
                break;
            case 'box':
                this.canvas.startBox(this.state.currentBoxKey, mouseX, mouseY);
                break;
            default:
                break;
        }
    }
    _handleMouseMove(e) {
        const mouseX = e.pageX;
        const mouseY = e.pageY;
        if (this.state.isMouseDown) {
            e.preventDefault();
            switch(this.props.selection) {
                case 'circle':
                    this.canvas.updateCircle(this.state.currentCircleKey, mouseX, mouseY);
                    break;
                case 'arrow':
                    this.canvas.updateArrow(this.state.currentArrowKey, mouseX, mouseY);
                    break;
                case 'box':
                    this.canvas.updateBox(this.state.currentBoxKey, mouseX, mouseY);
                    break;
                default:
                    break;
            }
        }
    }
    _handleMouseUp(e) {
        this.setState({isMouseDown: false});
        switch(this.props.selection) {
            case 'circle':
                this.setState({currentCircleKey: this.state.currentCircleKey + 1});
                break;
            case 'arrow':
                this.setState({currentArrowKey: this.state.currentArrowKey + 1});
                break;
            case 'box':
                this.setState({currentBoxKey: this.state.currentBoxKey + 1});
                break;
            default:
                break;
        }
    }

    // helper
    _addTouches(touchesToAdd) {
        eachTouch(touchesToAdd, (newTouch) => {
            const touchId = newTouch.identifier;
            const oldTouch = this.state.ongoingTouchMap.get(touchId);
            if (oldTouch) {
                console.log('old touch');
                const key = oldTouch.get('key');
                const oldTouchCoords = oldTouch.get('touchCoords');
                this.canvas.updateStroke(key, oldTouchCoords, newTouch);
                const newOngoingTouchMap = this.state.ongoingTouchMap.setIn([touchId, 'touchCoords'], newTouch);
                this.setState({ongoingTouchMap: newOngoingTouchMap});
            } else {
                console.log('new touch');
                const newOngoingTouchMap = this.state.ongoingTouchMap.set(touchId, Map({
                    touchCoords: newTouch,
                    key: this.state.lastTouchKey + 1
                }));
                this.setState({ongoingTouchMap : newOngoingTouchMap, lastTouchKey: this.state.lastTouchKey + 1})
            }
        });
    }

    render() {
        return (
            <div className="canvas-container">
                <Canvas ref={(c) => this.canvas = c}/>
            </div>

        );
    }
}

Touch.propTypes = {
    selection: React.PropTypes.string
};

export default Touch;
