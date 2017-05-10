// external
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map, Record } from 'immutable';
// style
import '../styles/Canvas.css';
// components
import { Node, Connection } from './GraphElements';
// other
import * as networkActions from '../actions/networkActions';
import * as Constants from '../utils/Constants';
import * as utils from '../utils/utils';
import * as config from '../config';

// DEPRECATED
// const inNodeCircle = (canvasX, canvasY, node) =>
//     utils.dist(canvasX, canvasY, node.get('cx'), node.get('cy')) <= Constants.CIRCLE_RADIUS;
// const inInteractionBox = (canvasX, canvasY, interaction) =>
//     Math.abs(canvasX - interaction.get('cx')) <= Constants.BOX_WIDTH/2 &&
//         Math.abs(canvasY - interaction.get('cy')) <= Constants.BOX_HEIGHT/2;
const getClass = (isSelected, isMoving) => {
    const baseClass = 'node ';
    const selectionString = isSelected ? 'node-selected ' : '';
    const movingString = isMoving ? 'node-moving ' : '';
    return baseClass + selectionString + movingString;
};
const matchesStartLocation = (contact, canvasX, canvasY) =>
    canvasX === contact.get('downX') && canvasY === contact.get('downY');
const Contact =
    Record({
        isDown: false,
        isLong: false,
        downX: null,
        downY: null,
        moveX: null,
        moveY: null,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        intersectedShape: null,
    });
const emptyContact = new Contact({});

const startContact = (contactMap, canvasX, canvasY) => contactMap ?
    contactMap
        .set('isDown', true)
        .set('downX', canvasX)
        .set('downY', canvasY)
        .set('moveX', canvasX)
        .set('moveY', canvasY) :
    emptyContact
        .set('isDown', true)
        .set('downX', canvasX)
        .set('downY', canvasY)
        .set('moveX', canvasX)
        .set('moveY', canvasY);




class Canvas extends Component {

    constructor(props) {
        super(props);
        this.state = {
            viewBox: {x0: 0, y0: 0, width: Constants.SVG_WIDTH, height: Constants.SVG_HEIGHT},
            svgClass: 'tall',
            canvasRect: null,
            mouse: emptyContact,
            touches: Map({}),
        };
    }

    // ------------------- LIFECYCLE --------------------
    componentDidMount() {
        this._setSvgClass();
        window.addEventListener('resize', this._handleResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize');
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.zoomLevel !== this.props.zoomLevel) {
            const heightRatio = (Constants.SVG_HEIGHT/Constants.SVG_WIDTH);
            const zoomStrength = 100;
            const x0 = nextProps.zoomLevel*zoomStrength;
            const y0= nextProps.zoomLevel*zoomStrength*heightRatio;
            const width = Constants.SVG_WIDTH - 2*x0;
            const height = Constants.SVG_HEIGHT - 2*y0;
            this.setState({viewBox: {x0, y0, width, height}});
        }
    }
    // componentWillUpdate(_, nextState) {
    //     console.log('nextState', nextState);
    // }

    // ------------------- HELPERS --------------------
    _setCanvasRect = () => {
        const canvasRect = this.canvas.getBoundingClientRect();
        this.setState({canvasRect: canvasRect});
        return canvasRect;
    };
    _setSvgClass = () => {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const canvasHeight = windowHeight*.6;
        const shouldSetBasedOnHeight = windowWidth > canvasHeight/(Constants.SVG_HEIGHT/Constants.SVG_WIDTH);

        if (shouldSetBasedOnHeight) this.setState({svgClass: 'wide'});
        else this.setState({svgClass: 'tall'});
    };
    toCanvasCoordinates = (pageX, pageY) => {
        const canvasRect = this.state.canvasRect ? this.state.canvasRect : this._setCanvasRect();
        return [
            (pageX - canvasRect.left)/canvasRect.width*this.state.viewBox.width + this.state.viewBox.x0,
            (pageY - canvasRect.top - window.scrollY)/canvasRect.height*this.state.viewBox.height + this.state.viewBox.y0
        ]
    };
    // _checkIntersection = (canvasX, canvasY) => {
    //     const intersectedNodeKey = this.props.nodes.findKey((node) => inNodeCircle(canvasX, canvasY, node));
    //     if (intersectedNodeKey) return {shape: 'node', key: intersectedNodeKey};
    //     const intersectedInteractionKey = this.props.interactions.findKey((interaction) => inInteractionBox(canvasX, canvasY, interaction));
    //     if (intersectedInteractionKey) return {shape: 'interaction', key: intersectedInteractionKey};
    //     return false;
    // };
    _makeNewShape = (canvasX, canvasY) => {
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
    };
    _moveShape = ({shape, key}, canvasX, canvasY) => {
        switch (shape) {
            case 'node':
                this.props.moveNode(key, canvasX, canvasY);
                break;
            default:
                break;
        }
    };
    _selectNodesInRect = (x1, y1, x2, y2) => {
        const nodesToSelect = this.props.nodes.filter((node) =>
            node.get('cx') > x1 && node.get('cy') > y1 && node.get('cx') < x2 && node.get('cy') < y2
        );
        this.props.selectNodes(nodesToSelect);
    };

    // ------------------- HANDLERS --------------------
    _handleResize = () => {
        this._setSvgClass();
        this._setCanvasRect();
    };

    // touch events
    _handleTouchStart = (e) => {
        e.preventDefault();
        const touches = e.changedTouches;
        utils.eachTouch(touches, (touch, key) => {
            this._handleSingleTouchStart(touch, key);
        });
    };
    _handleSingleTouchStart = (touchEvent, key) => {
        const [canvasX, canvasY] = this.toCanvasCoordinates(touchEvent.pageX, touchEvent.pageY);
        this._addTouch(key, canvasX, canvasY);
    };
    _handleTouchMove = (e) => {
        e.preventDefault();
        const touches = e.changedTouches;
        utils.eachTouch(touches, (touchEvent, key) => {
            this._handleSingleTouchMove(touchEvent, key);
        });
    };
    _handleSingleTouchMove = (touchEvent, key) => {
        const [canvasX, canvasY] = this.toCanvasCoordinates(touchEvent.pageX, touchEvent.pageY);
        const correspondingTouch = this.state.touches.get(key);
        if (this.longTouchTimers && this.longTouchTimers[key]) clearTimeout(this.longTouchTimers[key]);
        if (!correspondingTouch) this._addTouch(key, canvasX, canvasY);
        else {
            this.updateTouch(key, (touch) => touch.set('moveX', canvasX).set('moveY', canvasY));
        }
    };
    _handleTouchEnd = (e) => {
        const touches = e.changedTouches;
        utils.eachTouch(touches, (touchEvent, key) => {
            this._handleSingleTouchEnd(touchEvent, key);
        });
    };
    _handleSingleTouchEnd = (touchEvent, key) => {
        const [canvasX, canvasY] = this.toCanvasCoordinates(touchEvent.pageX, touchEvent.pageY);
        const thisTouch = this.state.touches.get(key);
        const intersectedShape = thisTouch.get('intersectedShape');
        if (thisTouch) {
            // didnt move - select shape or create new one
            if (matchesStartLocation(thisTouch, canvasX, canvasY)) {
                if (intersectedShape) this.props.changeShapeSelection(intersectedShape);
                else this._makeNewShape(canvasX, canvasY);
            } else { // moved - move shape if one was selected
                const shouldConnect = config.SHOULD_CONNECT({touch: thisTouch});
                if (intersectedShape && !shouldConnect) this._moveShape(intersectedShape, canvasX, canvasY);
                else if (!intersectedShape) {
                    this._selectNodesInRect(thisTouch.get('downX'), thisTouch.get('downY'), canvasX, canvasY);
                }
            }
            this.setState({
                touches: this.state.touches.delete(key)
            })
        }
    };
    _addTouch = (key, canvasX, canvasY) => {
        this.updateTouch(key, (touch) => startContact(touch, canvasX, canvasY));
    };
    updateTouch = (touchKey, func) => {
        this.setState((prevState) => {
            const oldTouch = prevState.touches.get(touchKey);
            const newTouch = oldTouch ? func(oldTouch) : func(emptyContact);
            const newTouches = prevState.touches.set(touchKey, newTouch);
            return {touches: newTouches};
        });
    };
    setLongTouchTimer = (touchKey) => {
        if (!this.longTouchTimers) this.longTouchTimers = {};
        const setToLong = () => this.updateTouch(touchKey, (touch) => touch.set('isLong', true));
        this.longTouchTimers[touchKey] = setTimeout(setToLong, 1000);
    };

    // mouse events
    _handleMouseDown = (e) => {
        if (e.button !== 0) return; // only take left mouse clicks
        e.preventDefault();
        const [canvasX, canvasY] = this.toCanvasCoordinates(e.pageX, e.pageY);
        this.updateMouse((mouse) => startContact(mouse, canvasX, canvasY));
    };
    _handleMouseMove = (e) => {
        if (e.button !== 0) return; // only take left mouse clicks
        if (this.state.mouse.get('isDown')) {
            const [canvasX, canvasY] = this.toCanvasCoordinates(e.pageX, e.pageY);
            this.updateMouse((mouse) => mouse.set('moveX', canvasX).set('moveY', canvasY));
        }
    };
    _handleMouseUp = (e) => {
        if (e.button !== 0) return; // only take left mouse clicks
        e.preventDefault();
        const [canvasX, canvasY] = this.toCanvasCoordinates(e.pageX, e.pageY);
        const mouse = this.state.mouse;
        const intersectedShape = mouse.get('intersectedShape');

        if (matchesStartLocation(mouse, canvasX, canvasY)) {
            if (intersectedShape) this.props.changeShapeSelection(intersectedShape);
            else this._makeNewShape(canvasX, canvasY);
        } else {
            const shouldConnect = config.SHOULD_CONNECT({mouse});
            if (intersectedShape && !shouldConnect) this._moveShape(intersectedShape, canvasX, canvasY);
            else if (!intersectedShape) this._selectNodesInRect(mouse.get('downX'), mouse.get('downY'), canvasX, canvasY);
        }
        this.resetMouse();
    };
    resetMouse = () => {
        this.setState({mouse: emptyContact});
    };
    updateMouse = (func) => {
        this.setState((prevState) => prevState.mouse = func(prevState.mouse));
    };

    render() {
        const mouse = this.state.mouse;
        const viewBox = this.state.viewBox;
        const maybeSelectionRect = (contact) => {
            if (contact.get('isDown') && !contact.get('intersectedShape')) {
                const [downX, downY] = [contact.get('downX'), contact.get('downY')];
                const [moveX, moveY] = [contact.get('moveX'), contact.get('moveY')];
                const [x1, x2] = downX < moveX ? [downX, moveX] : [moveX, downX];
                const [y1, y2] = downY < moveY ? [downY, moveY] : [moveY, downY];
                return (
                    <rect
                        className='selection-rect'
                        x={x1}
                        y={y1}
                        width={x2-x1}
                        height={y2-y1}
                    />
                )
            } else return null;
        };

        return (
            <svg
                className={`svg-canvas svg-canvas-${this.state.svgClass}`}
                ref={(c) => this.canvas = c}
                //handlers
                onMouseDown={this._handleMouseDown}
                onMouseMove={this._handleMouseMove}
                onMouseUp={this._handleMouseUp}
                onTouchStart={this._handleTouchStart}
                onTouchMove={this._handleTouchMove}
                onTouchEnd={this._handleTouchEnd}
                viewBox={`${viewBox.x0} ${viewBox.y0} ${viewBox.width} ${viewBox.height}`}
            >
                {
                    config.SHOULD_CONNECT({mouse}) ?
                        <path d={`
                            M ${mouse.get('downX')} ${mouse.get('downY')} ${mouse.get('moveX')} ${mouse.get('moveY')}
                        `} /> :
                        null
                }
                { maybeSelectionRect(mouse) }
                { this.state.touches.map(maybeSelectionRect) }
                {
                    this.state.touches.map((touch) =>
                        config.SHOULD_CONNECT({touch}) ?
                            <path d={`
                                M ${touch.get('downX')} ${touch.get('downY')} ${touch.get('moveX')} ${touch.get('moveY')}
                            `} /> :
                            null
                    )
                }
                {/*{*/}
                    {/*this.state.touches.map((touch) => {*/}
                        {/*const cx = touch.get('moveX');*/}
                        {/*const cy = touch.get('moveY');*/}
                        {/*return (*/}
                            {/*<circle*/}
                                {/*cx={cx}*/}
                                {/*cy={cy}*/}
                                {/*r={20}*/}
                                {/*style={{fill: 'red'}}*/}
                            {/*/>*/}
                        {/*)*/}
                    {/*})*/}
                {/*}*/}
                {
                    this.props.nodes.map((node, key) =>
                        <Node
                            key={key}
                            nodeKey={key}
                            node={node}
                            mouse={this.state.mouse}
                            touches={this.state.touches}
                            updateMouse={this.updateMouse}
                            updateTouch={this.updateTouch}
                            setLongTouchTimer={this.setLongTouchTimer}
                        />
                    )
                }
                {
                    this.props.connections.map((connection, key) =>
                        <Connection
                            key={key}
                            connection={connection}
                            mouse={this.state.mouse}
                            touches={this.state.touches}
                            resetMouse={this.resetMouse}
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
        zoomLevel: currentShapes.get('zoom_level'),
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
    startLabellingNode: (key) => dispatch(networkActions.startLabellingNode(key)),
    changeShapeSelection: ({shape, key}) => dispatch(networkActions.changeShapeSelection({shape, key})),
    selectNodes: (nodes) => dispatch(networkActions.selectNodes(nodes)),
    moveNode: (key, cx, cy) => dispatch(networkActions.moveNode(key, cx, cy)),
});

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(Canvas);