import React, { Component } from 'react';
import './Canvas.css';
import { Map, List } from 'immutable';
const updateStroke = (strokeKey, newLine) => (prevState) => {
    return {
        strokes: prevState.strokes.update(strokeKey,
            (stroke) => stroke ? stroke.push(newLine) : List([newLine])
        )
    };
};

class Canvas extends Component {

    constructor(props) {
        super(props);
        this.state = {
            strokes: Map({
                a: [{x1: 100, y1: 100, x2: 150, y2: 150}]
            })
        };
        this.drawLine = this.drawLine.bind(this);
        this._toCanvasCoordinates = this._toCanvasCoordinates.bind(this);
    }

    _toCanvasCoordinates = ({pageX, pageY}) => {
        const canvasRect = this.canvas.getBoundingClientRect();
        return {
            canvasX: (pageX - canvasRect.left)/canvasRect.width*this.props.canvasWidth,
            canvasY: (pageY - canvasRect.top)/canvasRect.height*this.props.canvasHeight
        }
    };

    drawLine(strokeKey, lastTouch, newTouch) {
        const lastTouchCanvas = this._toCanvasCoordinates(lastTouch);
        const newTouchCanvas = this._toCanvasCoordinates(newTouch);
        const newLine = {x1: lastTouchCanvas.canvasX, y1: lastTouchCanvas.canvasY, x2: newTouchCanvas.canvasX, y2: newTouchCanvas.canvasY};
        this.setState(updateStroke(strokeKey, newLine));
    }

    render() {
        return (
            <svg ref={(c) => this.canvas = c} viewBox={`0 0 ${this.props.canvasWidth} ${this.props.canvasHeight}`}>
                { this.state.strokes.map((stroke) => {
                    return stroke.map(({x1, x2, y1, y2}) => {
                        return <path d={`M ${x1} ${y1} ${x2} ${y2}`} />
                    })
                })}
            </svg>
        )

    }
}

Canvas.propTypes = {
    canvasWidth: React.PropTypes.number.isRequired,
    canvasHeight: React.PropTypes.number.isRequired
};

export default Canvas;