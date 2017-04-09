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
const svgWidth = 1000;
const svgHeight = 600;

class Canvas extends Component {

    constructor(props) {
        super(props);
        this.state = {
            strokes: Map({
                a: [{x1: 100, y1: 100, x2: 150, y2: 150}]
            }),
            circles: Map({
                a: Map({r: 50, cx: 100, cy: 100})
            }),
            svgStyleHeight: null
        };
        this.drawLine = this.drawLine.bind(this);
        this._toCanvasCoordinates = this._toCanvasCoordinates.bind(this);
        this._updateSvgStyleHeight = this._updateSvgStyleHeight.bind(this);
    }

    componentDidMount() {
        this._updateSvgStyleHeight();
        window.addEventListener('resize', this._updateSvgStyleHeight);
    }

    _updateSvgStyleHeight() {
        const svgStyleWidth = this.canvas.getBoundingClientRect().width;
        const svgStyleHeight = svgStyleWidth/svgWidth*svgHeight;
        this.setState({svgStyleHeight: svgStyleHeight})
    }

    _toCanvasCoordinates = (pageX, pageY) => {
        const canvasRect = this.canvas.getBoundingClientRect();
        return {
            canvasX: (pageX - canvasRect.left)/canvasRect.width*svgWidth,
            canvasY: (pageY - canvasRect.top)/canvasRect.height*svgHeight
        }
    };

    drawLine(strokeKey, lastTouch, newTouch) {
        const lastTouchCanvas = this._toCanvasCoordinates(lastTouch.pageX, lastTouch.pageY);
        const newTouchCanvas = this._toCanvasCoordinates(newTouch.pageX, newTouch.pageY);
        const newLine = {x1: lastTouchCanvas.canvasX, y1: lastTouchCanvas.canvasY, x2: newTouchCanvas.canvasX, y2: newTouchCanvas.canvasY};
        this.setState(updateStroke(strokeKey, newLine));
    }

    startCircle(circleKey, x, y) {
        const centerCanvas = this._toCanvasCoordinates(x, y);
        const newCircle = Map({r: 10, cx: centerCanvas.canvasX, cy: centerCanvas.canvasY});
        this.setState({circles: this.state.circles.set(circleKey, newCircle)});
    }

    updateCircle(circleKey, x, y) {
        const circle = this.state.circles.get(circleKey);
        const cx = circle.get('cx');
        const cy = circle.get('cy');
        const newRadius = Math.sqrt((x - cx)*(x - cx) + (y - cy)*(y - cy));
        this.setState({circles: this.state.circles.setIn([circleKey, 'r'], newRadius)});
    }

    render() {
        return (
            <svg className="svg-canvas" ref={(c) => this.canvas = c} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{height: this.state.svgStyleHeight}}>
                { this.state.strokes.map((stroke) => {
                    return stroke.map(({x1, x2, y1, y2}) => {
                        return <path d={`M ${x1} ${y1} ${x2} ${y2}`} />
                    })
                })}
                { this.state.circles.map((circle) => {
                    const cx = circle.get('cx');
                    const cy = circle.get('cy');
                    const r = circle.get('r');
                    return <circle cx={cx} cy={cy} r={r}/>
                })}
            </svg>
        )

    }
}

Canvas.propTypes = {
};

export default Canvas;