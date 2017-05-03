// external
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Map } from 'immutable';
// style
import '../styles/Canvas.css';
// components
import { Node, Connection } from './GraphElements';
// other
import * as networkActions from '../actions/networkActions';
import * as Constants from '../utils/Constants';

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
        f(touches[i], i);
    });
};
const dist = (x1, y1, x2, y2) => Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
const inNodeCircle = (canvasX, canvasY, node) =>
    dist(canvasX, canvasY, node.get('cx'), node.get('cy')) <= Constants.CIRCLE_RADIUS;
const inInteractionBox = (canvasX, canvasY, interaction) =>
    Math.abs(canvasX - interaction.get('cx')) <= Constants.BOX_WIDTH/2 &&
        Math.abs(canvasY - interaction.get('cy')) <= Constants.BOX_HEIGHT/2;
const getClass = (isSelected, isMoving) => {
    const baseClass = 'node ';
    const selectionString = isSelected ? 'node-selected ' : '';
    const movingString = isMoving ? 'node-moving ' : '';
    return baseClass + selectionString + movingString;
};


class Canvas extends Component {

    constructor(props) {
        super(props);
        this.state = {
            svgClass: 'tall',
            canvasRect: null,
            isMouseDown: false,
            mouseDownX: null,
            mouseDownY: null,
            mouseMoveX: null,
            mouseMoveY: null,
            intersectedShape: null,
            touches: Map({}),

        };
        // helpers
        this._handleResize = this._handleResize.bind(this);
        this._toCanvasCoordinates = this._toCanvasCoordinates.bind(this);
        this._checkIntersection = this._checkIntersection.bind(this);
        this.getMovementInfo = this.getMovementInfo.bind(this);
        this.getNodeMovementInfo = this.getNodeMovementInfo.bind(this);
        this._makeNewShape = this._makeNewShape.bind(this);
        this._moveShape = this._moveShape.bind(this);
        // handlers

        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleTouchMove = this._handleTouchMove.bind(this);
        this._handleTouchEnd = this._handleTouchEnd.bind(this);
    }

    // lifecycle
    componentDidMount() {
        this._setSvgClass();
        window.addEventListener('resize', this._handleResize);

        this.canvas.addEventListener('touchstart', this._handleTouchStart);
        this.canvas.addEventListener('touchmove', this._handleTouchMove);
        this.canvas.addEventListener('touchend', this._handleTouchEnd);
    }
    componentWillUnmount() {
        window.removeEventListener('resize');
        this.canvas.removeEventListener('touchstart');
        this.canvas.removeEventListener('touchmove');
        this.canvas.removeEventListener('touchend');
    }

    _setCanvasRect() {
        const canvasRect = this.canvas.getBoundingClientRect();
        this.setState({canvasRect: canvasRect});
        return canvasRect;
    }
    _setSvgClass() {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const canvasHeight = windowHeight*.6;
        const shouldSetBasedOnHeight = windowWidth > canvasHeight/(Constants.SVG_HEIGHT/Constants.SVG_WIDTH);

        if (shouldSetBasedOnHeight) this.setState({svgClass: 'wide'});
        else this.setState({svgClass: 'tall'});
    }

    // helpers
    _handleResize() {
        this._setSvgClass();
        this._setCanvasRect();
    }
    _toCanvasCoordinates(pageX, pageY) {
        const canvasRect = this.state.canvasRect ? this.state.canvasRect : this._setCanvasRect();
        return [
            (pageX - canvasRect.left)/canvasRect.width*Constants.SVG_WIDTH,
            (pageY - canvasRect.top - window.scrollY)/canvasRect.height*Constants.SVG_HEIGHT
        ]
    };
    _checkIntersection(canvasX, canvasY) {
        const intersectedNodeKey = this.props.nodes.findKey((node) => inNodeCircle(canvasX, canvasY, node));
        if (intersectedNodeKey) return {shape: 'node', key: intersectedNodeKey};
        const intersectedInteractionKey = this.props.interactions.findKey((interaction) => inInteractionBox(canvasX, canvasY, interaction));
        if (intersectedInteractionKey) return {shape: 'interaction', key: intersectedInteractionKey};
        return false;
    }

    // touch events
    _handleTouchStart(e) {
        e.preventDefault();
        const touches = e.changedTouches;
        eachTouch(touches, (touch, key) => {
            const [canvasX, canvasY] = this._toCanvasCoordinates(touch.pageX, touch.pageY);
            this._addTouch(key, canvasX, canvasY);
        })
    }
    _addTouch(key, canvasX, canvasY) {
        const maybeIntersection = this._checkIntersection(canvasX, canvasY);
        const thisTouch = Map({
            touchDownX: canvasX,
            touchDownY: canvasY,
            touchMoveX: canvasX,
            touchMoveY: canvasY,
            intersectedShape: maybeIntersection
        });
        this.setState({
            touches: this.state.touches.set(key, thisTouch)
        });
    }
    _handleTouchMove(e) {
        e.preventDefault();
        const touches = e.changedTouches;
        eachTouch(touches, (touch, key) => {
            const [canvasX, canvasY] = this._toCanvasCoordinates(touch.pageX, touch.pageY);
            const correspondingTouch = this.state.touches.get(key);
            if (!correspondingTouch) this._addTouch(key, canvasX, canvasY);
            else {
                const updatedTouch = correspondingTouch.set('touchMoveX', canvasX).set('touchMoveY', canvasY);
                this.setState({
                    touches: this.state.touches.set(key, updatedTouch)
                })
            }
        })
    }
    _handleTouchEnd(e) {
        const touches = e.changedTouches;
        eachTouch(touches, (touch, key) => {
            const [canvasX, canvasY] = this._toCanvasCoordinates(touch.pageX, touch.pageY);
            const thisTouch = this.state.touches.get(key);
            if (thisTouch) {
                const maybeIntersection = thisTouch.get('intersectedShape');
                // didnt move - select shape or create new one
                if (canvasX === thisTouch.get('touchDownX') && canvasY === thisTouch.get('touchDownY')) {
                    if (maybeIntersection) this.props.changeShapeSelection(maybeIntersection);
                    else this._makeNewShape(canvasX, canvasY);
                } else { // moved - move shape if one was selected
                    if (maybeIntersection) this._moveShape(maybeIntersection, canvasX, canvasY);
                }
                this.setState({
                    touches: this.state.touches.delete(key)
                })
            }
        })
    }

    _makeNewShape(canvasX, canvasY) {
        switch (this.props.selection) {
            case 'node':
                this.props.addNode(canvasX, canvasY);
                break;
            case 'connection':

                break;
            case 'interaction':
                this.props.addInteraction(canvasX, canvasY);
                break;
            default:
                break;
        }
    }

    _moveShape(shapeId, canvasX, canvasY) {
        const {shape, key} = shapeId;
        switch (shape) {
            case 'node':
                this.props.moveNode(key, canvasX, canvasY);
                break;
            default:
                break;
        }
    }

    // mouse events
    _handleMouseDown(e) {
        if (e.button !== 0) return; // only take left mouse clicks
        e.preventDefault();
        const [canvasX, canvasY] = this._toCanvasCoordinates(e.pageX, e.pageY);
        this.setState({
            isMouseDown: true,
            mouseDownX: canvasX,
            mouseDownY: canvasY,
            mouseMoveX: canvasX,
            mouseMoveY: canvasY,
            intersectedShape: this._checkIntersection(canvasX, canvasY)
        });
    }
    _handleMouseMove(e) {
        if (e.button !== 0) return; // only take left mouse clicks
        if (this.state.isMouseDown) {
            e.preventDefault();
            const [canvasX, canvasY] = this._toCanvasCoordinates(e.pageX, e.pageY);
            this.setState({mouseMoveX: canvasX, mouseMoveY: canvasY});
        }
    }
    _handleMouseUp(e) {
        if (e.button !== 0) return; // only take left mouse clicks
        e.preventDefault();
        const [canvasX, canvasY] = this._toCanvasCoordinates(e.pageX, e.pageY);
        const maybeIntersection = this.state.intersectedShape;
        // didnt move - select shape or create new one
        if (canvasX === this.state.mouseDownX && canvasY === this.state.mouseDownY) {
            if (maybeIntersection) this.props.changeShapeSelection(maybeIntersection);
            else this._makeNewShape(canvasX, canvasY);
        } else { // moved - move shape if one was selected
            if (maybeIntersection) this._moveShape(maybeIntersection, canvasX, canvasY);
        }
        this.setState({
            isMouseDown: false,
            mouseDownX: null,
            mouseDownY: null,
            intersectedShape: null
        })
    }

    // if the shape was intersected by a click or touch, returns the current x and y of that click or touch, otherwise null
    getMovementInfo({shape, key}) {
        const didMouseIntersect = this.state.intersectedShape &&
            this.state.intersectedShape.shape === shape &&
            this.state.intersectedShape.key === key;
        if (didMouseIntersect) return {
            cx: this.state.mouseMoveX,
            cy: this.state.mouseMoveY,
            isMoving: true
        };
        const matchingTouch = this.state.touches.find((touch) => {
            const maybeIntersection = touch.get('intersectedShape');
            return maybeIntersection && maybeIntersection.shape === shape && maybeIntersection.key === key;
        });
        if (matchingTouch) return {
            cx: matchingTouch.get('touchMoveX'),
            cy: matchingTouch.get('touchMoveY'),
            isMoving: true
        };
        return null;
    }
    getNodeMovementInfo(key, node) {
        const movingCoordinates = this.getMovementInfo({shape: 'node', key: key});
        if (movingCoordinates) return movingCoordinates;
        // look up the node if it isn't provided
        if (!node) node = this.props.nodes.get(key);
        return {
            cx: node.get('cx'),
            cy: node.get('cy'),
            isMoving: false
        }
    }

    render() {
        return (
            <svg
                className={`svg-canvas svg-canvas-${this.state.svgClass}`}
                ref={(c) => this.canvas = c}
                onMouseDown={this._handleMouseDown}
                onMouseMove={this._handleMouseMove}
                onMouseUp={this._handleMouseUp}
                viewBox={`0 0 ${Constants.SVG_WIDTH} ${Constants.SVG_HEIGHT}`}
            >
                {
                    this.state.touches.map((touch) => {
                        const cx = touch.get('touchMoveX');
                        const cy = touch.get('touchMoveY');
                        return (
                            <circle
                                cx={cx}
                                cy={cy}
                                r={20}
                                style={{fill: 'red'}}
                            />
                        )
                    })
                }
                {
                    this.props.nodes.map((node, key) =>
                        <Node
                            key={key}
                            nodeKey={key}
                            node={node}
                            getNodeMovementInfo={this.getNodeMovementInfo}
                        />
                    )
                }
                {
                    this.props.connections.map((connection, key) =>
                        <Connection
                            key={key}
                            connection={connection}
                            getNodeMovementInfo={this.getNodeMovementInfo}
                        />
                    )
                }
                {
                    this.props.interactions.map((interaction) => {
                        const x = interaction.get('cx') - Constants.BOX_WIDTH/2;
                        const y = interaction.get('cy') - Constants.BOX_HEIGHT/2;
                        const selected = interaction.get('selected');
                        return <rect x={x} y={y} width={Constants.BOX_WIDTH} height={Constants.BOX_HEIGHT} className={getClass(selected)}/>;
                    })
                }
            </svg>
        )

    }
}

Canvas.propTypes = {
};

const mapStateToProps = (state) => {
    const currentShapes = state.shapes.get('present');
    return {
        nodes: currentShapes.get('nodes'),
        connections: currentShapes.get('connections'),
        interactions: currentShapes.get('interactions'),
        maxCentrality: currentShapes.get('max_centrality'),
        minCentrality: currentShapes.get('min_centrality'),
        selection: state.modeReducer.get('selection'),
    }
};

const mapDispatchToProps = (dispatch) => ({
    addInteraction: (cx, cy) => dispatch(networkActions.addInteraction(cx, cy)),
    addNode: (cx, cy) => dispatch(networkActions.addNode(cx, cy)),
    addConnection: (source, target) => dispatch(networkActions.addConnection(source, target)),
    changeShapeSelection: ({shape, key}) => dispatch(networkActions.changeShapeSelection({shape, key})),
    moveNode: (key, cx, cy) => dispatch(networkActions.moveNode(key, cx, cy)),
    startLabellingNode: (key) => dispatch(networkActions.startLabellingNode(key))
});

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(Canvas);