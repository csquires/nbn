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
const dist = (x1, y1, x2, y2) => Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));

class Canvas extends Component {

    constructor(props) {
        super(props);
        this.state = {
            strokes: Map({}),
            circles: Map({}),
            arrows: Map({}),
            boxes: Map({}),
            svgStyleHeight: null
        };
        this._updateSvgStyleHeight = this._updateSvgStyleHeight.bind(this);
        this._toCanvasCoordinates = this._toCanvasCoordinates.bind(this);
        this.updateStroke = this.updateStroke.bind(this);
    }

    // lifecycle
    componentDidMount() {
        this._updateSvgStyleHeight();
        window.addEventListener('resize', this._updateSvgStyleHeight);
    }
    componentWillUnmount() {
        window.removeEventListener('resize');
    }

    // helpers
    _updateSvgStyleHeight() {
        const svgStyleWidth = this.canvas.getBoundingClientRect().width;
        const svgStyleHeight = svgStyleWidth/svgWidth*svgHeight;
        this.setState({svgStyleHeight: svgStyleHeight})
    }
    _toCanvasCoordinates = (pageX, pageY) => {
        const canvasRect = this.canvas.getBoundingClientRect();
        return [
            (pageX - canvasRect.left)/canvasRect.width*svgWidth,
            (pageY - canvasRect.top - window.scrollY)/canvasRect.height*svgHeight
        ]
    };

    // stroke
    updateStroke(strokeKey, lastTouch, newTouch) {
        const [lastCanvasX, lastCanvasY] = this._toCanvasCoordinates(lastTouch.pageX, lastTouch.pageY);
        const [newCanvasX, newCanvasY] = this._toCanvasCoordinates(newTouch.pageX, newTouch.pageY);
        const newLine = {x1: lastCanvasX, y1: lastCanvasY, x2: newCanvasX, y2: newCanvasY};
        this.setState(updateStroke(strokeKey, newLine));
    }

    // circle
    startCircle(circleKey, x, y) {
        const [canvasX, canvasY] = this._toCanvasCoordinates(x, y);
        const newCircle = Map({r: 10, cx: canvasX, cy: canvasY});
        this.setState({circles: this.state.circles.set(circleKey, newCircle)});
    }
    updateCircle(circleKey, x, y) {
        const circle = this.state.circles.get(circleKey);
        const cx = circle.get('cx');
        const cy = circle.get('cy');
        const [canvasX, canvasY] = this._toCanvasCoordinates(x, y);
        const newRadius = dist(cx, cy, canvasX, canvasY);
        this.setState({circles: this.state.circles.setIn([circleKey, 'r'], newRadius)});
    }

    // arrow
    startArrow(arrowKey, x, y) {
        const [canvasX, canvasY] = this._toCanvasCoordinates(x, y);
        const newArrow = Map({x1: canvasX, y1: canvasY, x2: canvasX, y2: canvasY});
        this.setState({arrows: this.state.arrows.set(arrowKey, newArrow)});
    }
    updateArrow(arrowKey, x, y) {
        const [canvasX, canvasY] = this._toCanvasCoordinates(x, y);
        const newArrows = this.state.arrows.setIn([arrowKey, 'x2'], canvasX).setIn([arrowKey, 'y2'], canvasY);
        this.setState({arrows: newArrows});
    }

    // box
    startBox(boxKey, x, y) {

    }
    updateBox(boxKey, x, y) {

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
                { this.state.arrows.map((line) => {
                    const x1 = line.get('x1');
                    const y1 = line.get('y1');
                    const x2 = line.get('x2');
                    const y2 = line.get('y2');
                    const length = dist(x1, y1, x2, y2);
                    const angle = Math.atan2(y2-y1, x2-x1);
                    const leg1x = x2 - .2*length*Math.cos(angle-Math.PI/4);
                    const leg1y = y2 - .2*length*Math.sin(angle-Math.PI/4);
                    const leg2x = x2 - .2*length*Math.cos(angle+Math.PI/4);
                    const leg2y = y2 - .2*length*Math.sin(angle+Math.PI/4);
                    return (
                        <path d={`
                            M ${x1} ${y1} ${x2} ${y2}
                            M ${x2} ${y2} ${leg1x} ${leg1y}
                            M ${x2} ${y2} ${leg2x} ${leg2y}
                        `} />
                    )
                })}
            </svg>
        )

    }
}

Canvas.propTypes = {
};

export default Canvas;