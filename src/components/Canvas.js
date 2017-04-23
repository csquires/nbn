// external
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
// style
import '../styles/Canvas.css';
// other
import * as shapeActions from '../actions/shapeActions';
import * as notificationActions from '../actions/notificationActions';

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 600;
const CIRCLE_RADIUS = SVG_WIDTH*0.02;
const BOX_WIDTH = SVG_WIDTH*0.04;
const BOX_HEIGHT = SVG_WIDTH*0.04;

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
const dist = (x1, y1, x2, y2) => Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
const inCircle = (canvasX, canvasY, circle) =>
    dist(canvasX, canvasY, circle.get('cx'), circle.get('cy')) <= CIRCLE_RADIUS;
const inBox = (canvasX, canvasY, box) =>
    Math.abs(canvasX - box.get('cx')) <= BOX_WIDTH/2 &&
        Math.abs(canvasY - box.get('cy')) <= BOX_HEIGHT/2;
const getClass = (selectionStatus) => selectionStatus ? 'selected' : '';

class Canvas extends Component {

    constructor(props) {
        super(props);
        this.state = {
            svgClass: 'tall',
        };
        // helpers
        this._updateSvgClass = this._updateSvgClass.bind(this);
        this._toCanvasCoordinates = this._toCanvasCoordinates.bind(this);
        this._checkIntersection = this._checkIntersection.bind(this);
        // handlers
        this._handleKeyPress = this._handleKeyPress.bind(this);
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleTouchMove = this._handleTouchMove.bind(this);
        this._handleTouchEnd = this._handleTouchEnd.bind(this);
    }

    // lifecycle
    componentDidMount() {
        this._updateSvgClass();
        window.addEventListener('resize', this._updateSvgClass);
        window.addEventListener('keypress', this._handleKeyPress);
        this.canvas.addEventListener('touchstart', this._handleTouchStart);
        this.canvas.addEventListener('touchmove', this._handleTouchMove);
        this.canvas.addEventListener('touchend', this._handleTouchEnd);

        this.canvas.addEventListener('mousedown', this._handleMouseDown);
        this.canvas.addEventListener('mousemove', this._handleMouseMove);
        this.canvas.addEventListener('mouseup', this._handleMouseUp);
    }
    componentWillUnmount() {
        window.removeEventListener('resize');
        this.canvas.removeEventListener('touchstart');
        this.canvas.removeEventListener('touchmove');
        this.canvas.removeEventListener('touchend');

        this.canvas.removeEventListener('mousedown');
        this.canvas.removeEventListener('mousemove');
        this.canvas.removeEventListener('mouseup');
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
    _checkIntersection(canvasX, canvasY) {
        const intersectedCircleKey = this.props.circles.findKey((circle) => inCircle(canvasX, canvasY, circle));
        if (intersectedCircleKey) return {shape: 'circle', key: intersectedCircleKey};
        const intersectedBoxKey = this.props.boxes.findKey((box) => inBox(canvasX, canvasY, box));
        if (intersectedBoxKey) return {shape: 'box', key: intersectedBoxKey};
        return false;
    }

    _handleKeyPress(e) {
        // console.log('key press', e);
        if (e.key === 'Delete') {
            this.props.deleteSelectedShapes();
        }
        if (e.key === 'f') {
            this.props.successNotification();
        }
    }

    // touch events
    _handleTouchStart(e) {
        e.preventDefault();
        const touches = e.changedTouches;
        eachTouch(touches, (touch) => {
            const [canvasX, canvasY] = this._toCanvasCoordinates(touch.pageX, touch.pageY);
            const maybeIntersection = this._checkIntersection(canvasX, canvasY);
            if (maybeIntersection) {
                this.props.changeShapeSelection(maybeIntersection);
            } else {
                switch(this.props.selection) {
                    case 'circle':
                        this.props.addCircle(canvasX, canvasY);
                        break;
                    case 'arrow':

                        break;
                    case 'box':
                        this.props.addBox(canvasX, canvasY);
                        break;
                    default:
                        break;
                }
            }
        })
        // this._addTouches(touches);
    }
    _handleTouchMove(e) {
        // console.log('touch move');
        // const touches = e.changedTouches;
        // this._addTouches(touches);
    }
    _handleTouchEnd(e) {
        // console.log('touch end');
        // const touches = e.changedTouches;
        // eachTouch(touches, (touch) => {
        //     this.setState({ongoingTouchMap: this.state.ongoingTouchMap.set(touch.identifier, null)})
        // })
    }

    // mouse events
    _handleMouseDown(e) {
        e.preventDefault();
        const [canvasX, canvasY] = this._toCanvasCoordinates(e.pageX, e.pageY);
        const maybeIntersection = this._checkIntersection(canvasX, canvasY);
        console.log('maybe intersection', maybeIntersection);
        if (maybeIntersection) {
            this.props.changeShapeSelection(maybeIntersection);
        }
        else {
            switch(this.props.selection) {
                case 'circle':
                    this.props.addCircle(canvasX, canvasY);
                    break;
                case 'arrow':

                    break;
                case 'box':
                    this.props.addBox(canvasX, canvasY);
                    break;
                default:
                    break;
            }
        }
    }
    _handleMouseMove(e) {
        // const mouseX = e.pageX;
        // const mouseY = e.pageY;
        // if (this.state.isMouseDown) {
        //     e.preventDefault();
        //     switch(this.props.selection) {
        //         case 'circle':
        //             this.canvas.updateCircle(this.state.currentCircleKey, mouseX, mouseY);
        //             break;
        //         case 'arrow':
        //             this.canvas.updateArrow(this.state.currentArrowKey, mouseX, mouseY);
        //             break;
        //         case 'box':
        //             this.canvas.updateBox(this.state.currentBoxKey, mouseX, mouseY);
        //             break;
        //         default:
        //             break;
        //     }
        // }
    }
    _handleMouseUp(e) {
        // this.setState({isMouseDown: false});
        // switch(this.props.selection) {
        //     case 'circle':
        //         this.setState({currentCircleKey: this.state.currentCircleKey + 1});
        //         break;
        //     case 'arrow':
        //         this.setState({currentArrowKey: this.state.currentArrowKey + 1});
        //         break;
        //     case 'box':
        //         this.setState({currentBoxKey: this.state.currentBoxKey + 1});
        //         break;
        //     default:
        //         break;
        // }
    }

    render() {
        return (
            <svg className={`svg-canvas svg-canvas-${this.state.svgClass}`} ref={(c) => this.canvas = c} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
                {
                    this.props.circles.map((circle) => {
                        const cx = circle.get('cx');
                        const cy = circle.get('cy');
                        const selected = circle.get('selected');
                        return <circle cx={cx} cy={cy} r={CIRCLE_RADIUS} className={getClass(selected)}/>;
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
                        const selected = box.get('selected');
                        return <rect x={x} y={y} width={BOX_WIDTH} height={BOX_HEIGHT} className={getClass(selected)}/>;
                    })
                }
            </svg>
        )

    }
}

Canvas.propTypes = {
};

const mapStateToProps = (state) => ({
    circles: state.shapes.getIn(['present', 'circles']),
    arrows: state.shapes.getIn(['present', 'arrows']),
    boxes: state.shapes.getIn(['present', 'boxes']),
    selection: state.modeReducer.get('selection'),
    selectedCircles: state.shapes.getIn(['present', 'selected_circles']),
    selectedBoxes: state.shapes.getIn(['present', 'selected_boxes']),
});

const mapDispatchToProps = (dispatch) => ({
    addBox: (cx, cy) => dispatch(shapeActions.addBox(cx, cy)),
    addCircle: (cx, cy) => dispatch(shapeActions.addCircle(cx, cy)),
    addArrow: (source, target) => dispatch(shapeActions.addArrow(source, target)),
    changeShapeSelection: ({shape, key}) => dispatch(shapeActions.changeShapeSelection({shape, key})),
    deleteSelectedShapes: () => dispatch(shapeActions.deleteSelectedShapes()),
    successNotification: () => dispatch(notificationActions.successNotification())
});

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(Canvas);