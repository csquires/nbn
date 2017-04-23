// external
import React, { Component } from 'react';
import { connect } from 'react-redux';
// style
import './Canvas.css';
// other
import * as shapeActions from './actions/shapeActions';

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 600;
const CIRCLE_RADIUS = SVG_WIDTH*0.02;
const BOX_WIDTH = SVG_WIDTH*0.04;
const BOX_HEIGHT = SVG_WIDTH*0.04;


class Canvas extends Component {

    constructor(props) {
        super(props);
        this.state = {
            svgClass: 'tall',
        };
        this._updateSvgClass = this._updateSvgClass.bind(this);
        this._toCanvasCoordinates = this._toCanvasCoordinates.bind(this);
        this.startBox = this.startBox.bind(this);
        this.startCircle = this.startCircle.bind(this);
    }

    // lifecycle
    componentDidMount() {
        this._updateSvgClass();
        window.addEventListener('resize', this._updateSvgClass);
    }
    componentWillUnmount() {
        window.removeEventListener('resize');
    }

    // helpers
    _updateSvgClass() {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const canvasHeight = windowHeight*.6;
        const shouldSetBasedOnHeight = windowWidth > canvasHeight/(SVG_HEIGHT/SVG_WIDTH);
        if (shouldSetBasedOnHeight) this.setState({svgClass: 'wide'});
        else this.setState({svgClass: 'tall'})
    }
    _toCanvasCoordinates(pageX, pageY) {
        const canvasRect = this.canvas.getBoundingClientRect();
        return [
            (pageX - canvasRect.left)/canvasRect.width*SVG_WIDTH,
            (pageY - canvasRect.top - window.scrollY)/canvasRect.height*SVG_HEIGHT
        ]
    };

    // startArrow(x, y) {
    //     const [canvasX, canvasY] = this._toCanvasCoordinates(x, y);
    //     this.props.addArrow(canvasX, canvasY);
    // }
    startBox(x, y) {
        const [canvasX, canvasY] = this._toCanvasCoordinates(x, y);
        this.props.addBox(canvasX, canvasY);
    }
    startCircle(x, y) {
        const [canvasX, canvasY] = this._toCanvasCoordinates(x, y);
        this.props.addCircle(canvasX, canvasY);
    }

    render() {
        return (
            <svg className={`svg-canvas svg-canvas-${this.state.svgClass}`} ref={(c) => this.canvas = c} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
                {
                    this.props.circles.map((circle) => {
                        const cx = circle.get('cx');
                        const cy = circle.get('cy');
                        return <circle cx={cx} cy={cy} r={CIRCLE_RADIUS}/>;
                    })
                }
                {/*{*/}
                    {/*this.props.arrows.map((line) => {*/}
                        {/*const x1 = line.get('x1');*/}
                        {/*const y1 = line.get('y1');*/}
                        {/*const x2 = line.get('x2');*/}
                        {/*const y2 = line.get('y2');*/}
                        {/*const length = dist(x1, y1, x2, y2);*/}
                        {/*const angle = Math.atan2(y2-y1, x2-x1);*/}
                        {/*const leg1x = x2 - .2*length*Math.cos(angle-Math.PI/4);*/}
                        {/*const leg1y = y2 - .2*length*Math.sin(angle-Math.PI/4);*/}
                        {/*const leg2x = x2 - .2*length*Math.cos(angle+Math.PI/4);*/}
                        {/*const leg2y = y2 - .2*length*Math.sin(angle+Math.PI/4);*/}
                        {/*return (*/}
                            {/*<path d={`*/}
                                {/*M ${x1} ${y1} ${x2} ${y2}*/}
                                {/*M ${x2} ${y2} ${leg1x} ${leg1y}*/}
                                {/*M ${x2} ${y2} ${leg2x} ${leg2y}*/}
                            {/*`} />*/}
                        {/*);*/}
                    {/*})*/}
                {/*}*/}
                {
                    this.props.boxes.map((box) => {
                        const x = box.get('cx') - BOX_WIDTH/2;
                        const y = box.get('cy') - BOX_HEIGHT/2;
                        return <rect x={x} y={y} width={BOX_WIDTH} height={BOX_HEIGHT} />;
                    })
                }
            </svg>
        )

    }
}

Canvas.propTypes = {
};

const mapStateToProps = (state) => ({
    circles: state.shapes.present.get('circles'),
    arrows: state.shapes.present.get('arrows'),
    boxes: state.shapes.present.get('boxes')
});

const mapDispatchToProps = (dispatch) => ({
    addBox: (cx, cy) => dispatch(shapeActions.addBox(cx, cy)),
    addCircle: (cx, cy) => dispatch(shapeActions.addCircle(cx, cy)),
    addArrow: (source, target) => dispatch(shapeActions.addArrow(source, target))
});

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(Canvas);