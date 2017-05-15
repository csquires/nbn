// external
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map, Record } from 'immutable';
import Hammer from 'react-hammerjs';
// style
import '../styles/Canvas.css';
// components
import { Node, Connection } from './GraphElements';
// other
import * as networkActions from '../actions/networkActions';
import * as Constants from '../utils/Constants';
import * as utils from '../utils/utils';
import * as config from '../config';

const inNodeCircle = (canvasX, canvasY, node) =>
    utils.dist(canvasX, canvasY, node.get('cx'), node.get('cy')) <= Constants.CIRCLE_RADIUS;
const inInteractionBox = (canvasX, canvasY, interaction) =>
    Math.abs(canvasX - interaction.get('cx')) <= Constants.BOX_WIDTH/2 &&
    Math.abs(canvasY - interaction.get('cy')) <= Constants.BOX_HEIGHT/2;
const getClass = (isSelected, isMoving) => {
    const baseClass = 'node ';
    const selectionString = isSelected ? 'node-selected ' : '';
    const movingString = isMoving ? 'node-moving ' : '';
    return baseClass + selectionString + movingString;
};
const maybeSelectionRect = (contact) => {
    if (contact.get('isDown') && !contact.get('startShape')) {
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
        startShape: null,
    });
const emptyContact = new Contact({});
const TempNode =
    Record({
        hover: '',
        isSource: false,
        menuOpen: false
    });
const emptyTempNode = new TempNode({});
const isSingleTouch = (e) => e.changedTouches.length === 1;


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
            touch: emptyContact,
            isSingleTouch: true,
            tempNodes: Map({}),
            tempInteractions: Map({})
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
        const addNodeIfNotExists = (key) => this.setState((prevState) => {
            const node = prevState.tempNodes.get(key);
            if (!node) return {tempNodes: prevState.tempNodes.set(key, emptyTempNode)};
            else return {};
        });
        nextProps.nodes.keySeq().forEach(addNodeIfNotExists);
    }


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
    _toCanvasCoordinates = (pageX, pageY) => {
        const canvasRect = this.state.canvasRect ? this.state.canvasRect : this._setCanvasRect();
        return [
            (pageX - canvasRect.left)/canvasRect.width*this.state.viewBox.width + this.state.viewBox.x0,
            (pageY - canvasRect.top - window.scrollY)/canvasRect.height*this.state.viewBox.height + this.state.viewBox.y0
        ]
    };
    _checkIntersection = (canvasX, canvasY) => {
        const intersectedNodeKey = this.props.nodes.findKey((node) => inNodeCircle(canvasX, canvasY, node));
        if (intersectedNodeKey) return {shape: 'node', key: intersectedNodeKey};
        const intersectedInteractionKey = this.props.interactions.findKey((interaction) => inInteractionBox(canvasX, canvasY, interaction));
        if (intersectedInteractionKey) return {shape: 'interaction', key: intersectedInteractionKey};
        return false;
    };
    _selectNodesInRect = (downX, downY, moveX, moveY ) => {
        const [x1, x2] = downX < moveX ? [downX, moveX] : [moveX, downX];
        const [y1, y2] = downY < moveY ? [downY, moveY] : [moveY, downY];
        const nodesToSelect = this.props.nodes.filter((node) =>
            node.get('cx') > x1 && node.get('cy') > y1 && node.get('cx') < x2 && node.get('cy') < y2
        );
        this.props.selectNodes(nodesToSelect);
    };
    // temp
    _addHover = (shape, hoverType) => this._updateShape(shape, (shape) => shape.set('hover', hoverType));
    _removeHover = (shape) => this._updateShape(shape, (shape) => shape.set('hover', ''));
    _applyHovers = (canvasX, canvasY, hoverType) => {
        this.props.nodes.forEach((node, key) => {
            const thisNode = {shape: 'node', key: key};
            if (inNodeCircle(canvasX, canvasY, node)) this._addHover(thisNode, hoverType);
            else this._removeHover(thisNode)
        });
        // TODO interaction
    };
    _updateShape = ({shape, key}, func) => {
        switch (shape) {
            case 'node': {
                this.setState((prevState) => ({tempNodes: prevState.tempNodes.update(key, func)}));
                break;
            }
            case 'interaction': {
                this.setState((prevState) => ({interactions: prevState.interactions.update(key, func)}));
                break;
            }
            default: break;
        }
    };
    _updateNode = (key, func) => this._updateShape({shape: 'node', key}, func);
    openMenu = ({shape, key}) => this._updateShape({shape, key}, (shape) => shape.set('menuOpen', true));
    closeMenu = ({shape, key}) => this._updateShape(({shape, key}) => shape.set('menuOpen', false));
    matchesMouseStart = ({shape, key}) => utils.shapeMatches(this.state.mouse.startShape, {shape, key});
    matchesTouchStart = ({shape, key}) => utils.shapeMatches(this.state.touch.startShape, {shape, key});
    maybeMovingCoordinates = ({shape, key}) => {
        const mouse = this.state.mouse;
        const touch = this.state.touch;
        const isMouseMDragging = !config.SHOULD_CONNECT({mouse});
        const isTouchDragging = !config.SHOULD_CONNECT({touch});
        if (this.matchesMouseStart({shape, key}) && isMouseMDragging) {
            return {movingX: mouse.get('moveX'), movingY: mouse.get('moveY'), isMoving: true}
        }
        if (this.matchesTouchStart({shape, key}) && isTouchDragging) {
            return {movingX: touch.get('moveX'), movingY: touch.get('moveY'), isMoving: true}
        }
        return {isMoving: false};
    };

    // store
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
    // touches
    _resetTouch = (touchKey) => this.setState({touch: emptyContact});
    _updateTouch = (func) => this.setState((prevState) => ({touch: func(prevState.touch)}));
    setLongTouchTimer = (startShape) => {
        const setToLong = () => {
            this._updateTouch((touch) => touch.set('isLong', true));
            if (startShape) this._updateShape(startShape, (shape) => shape.set('isSource', false));
        };
        this.longTouchTimer = setTimeout(setToLong, 1000);
    };
    clearLongTouchTimer = () => {if (this.longTouchTimer) clearTimeout(this.longTouchTimer)};
    _resetMouse = () => this.setState({mouse: emptyContact});
    _updateMouse = (func) => this.setState((prevState) => ({mouse: func(prevState.mouse)}));

    // ------------------- HANDLERS --------------------
    _handleResize = () => {
        this._setSvgClass();
        this._setCanvasRect();
    };

    // touch events
    _handleTouchStart = (e) => {
        e.preventDefault();
        if (isSingleTouch(e)) {
            this._handleSingleTouchStart(e.changedTouches[0]);
        }
    };
    _handleSingleTouchStart = (touchEvent) => {
        const [canvasX, canvasY] = this._toCanvasCoordinates(touchEvent.pageX, touchEvent.pageY);
        const startShape = this._checkIntersection(canvasX, canvasY);

        if (startShape) this._updateShape(startShape, (shape) => shape.set('isSource', true));
        this._updateTouch((touch) => touch.set('startShape', startShape));
        this._updateTouch((touch) => startContact(touch, canvasX, canvasY));
        this.setLongTouchTimer(startShape);
    };
    _handleTouchMove = (e) => {
        if (isSingleTouch(e)) {
            this._handleSingleTouchMove(e.changedTouches[0]);
        } else {
            // this.state.touches.forEach((_, key) => this.clearLongTouchTimer(key));
            // utils.eachTouch(e.changedTouches, (touchEvent, touchKey) => {
            //     const touch = this.state.touches.get(touchKey);
            //     const [canvasX, canvasY] = this._toCanvasCoordinates(touchEvent.pageX, touchEvent.pageY);
            //     if (!touch) this._addTouch(touchKey, canvasX, canvasY);
            // })
        }
    };
    _handleSingleTouchMove = (touchEvent) => {
        const [canvasX, canvasY] = this._toCanvasCoordinates(touchEvent.pageX, touchEvent.pageY);
        this.clearLongTouchTimer();
        this._updateTouch((touch) => touch.set('moveX', canvasX).set('moveY', canvasY));
        this._handleContactMove(this.state.touch, 'touch', canvasX, canvasY);
    };
    _handleTouchEnd = (e) => {
        if (isSingleTouch(e)) {
            this._handleSingleTouchEnd(e.changedTouches[0]);
        }
    };
    _handleSingleTouchEnd = (touchEvent) => {
        const [canvasX, canvasY] = this._toCanvasCoordinates(touchEvent.pageX, touchEvent.pageY);
        this.clearLongTouchTimer();
        this._handleContactEnd(this.state.touch, 'touch', canvasX, canvasY);
        this._resetTouch();
    };
    //mouse
    _handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.button === 0) {
            const hasCtrl = e.ctrlKey;
            const [canvasX, canvasY] = this._toCanvasCoordinates(e.pageX, e.pageY);
            const startShape = this._checkIntersection(canvasX, canvasY);
            // updates
            if (startShape && !hasCtrl) this._updateShape(startShape, (shape) => shape.set('isSource', true));
            this._updateMouse((mouse) => startContact(mouse, canvasX, canvasY));
            this._updateMouse((mouse) => mouse.set('startShape', startShape).set('ctrlKey', hasCtrl));
        }
        e.stopPropagation();
    };
    _handleRightMouseDown = (e) => {
        const hasCtrl = e.ctrlKey;
        if (!hasCtrl) {
            e.preventDefault();
            e.stopPropagation();

            if (e.button === 2) {
                const [canvasX, canvasY] = this._toCanvasCoordinates(e.pageX, e.pageY);
                const startShape = this._checkIntersection(canvasX, canvasY);
                if (startShape) this.openMenu(startShape);
            }
        }
    };
    _handleMouseMove = (e) => {
        if (e.button !== 0) return; // only take left mouse clicks
        if (this.state.mouse.get('isDown')) {
            const [canvasX, canvasY] = this._toCanvasCoordinates(e.pageX, e.pageY);
            this._updateMouse((mouse) => mouse.set('moveX', canvasX).set('moveY', canvasY));
            this._handleContactMove(this.state.mouse, 'mouse', canvasX, canvasY);
        }
    };
    _handleMouseUp = (e) => {
        e.stopPropagation();

        if (e.button !== 0) return; // only take left mouse clicks
        e.preventDefault();
        const [canvasX, canvasY] = this._toCanvasCoordinates(e.pageX, e.pageY);
        this._handleContactEnd(this.state.mouse, 'mouse', canvasX, canvasY);
        this._resetMouse();
    };
    // general
    _handleContactStart = (contact, contactType, canvasX, canvasY) => {

        // TODO
    };
    _handleContactMove = (contact, contactType, canvasX, canvasY) => {
        const shouldConnect = contactType === 'mouse' ?
            config.SHOULD_CONNECT({mouse: contact}) :
            config.SHOULD_CONNECT({touch: contact});

        const hoverType = shouldConnect ? 'target-hover' : 'error-hover';
        this._applyHovers(canvasX, canvasY, hoverType);
    };
    _handleContactEnd = (contact, contactType, canvasX, canvasY) => {
        const shouldConnect = contactType === 'mouse' ?
            config.SHOULD_CONNECT({mouse: contact}) :
            config.SHOULD_CONNECT({touch: contact});
        const startShape = contact.get('startShape');
        // cases:
        // - same as start place, intersecting a shape
        // - same as start place, not intersecting a shape
        // - diff from start place, intersecting a shape
        //      - connecting, end shape to connect to
        //      - no connecting
        // - diff from start place, not intersecting a shape
        if (matchesStartLocation(contact, canvasX, canvasY)) {
            if (startShape) this.props.changeShapeSelection(startShape);
            else this._makeNewShape(canvasX, canvasY);
        } else {
            const maybeEndShape = this._checkIntersection(canvasX, canvasY);
            if (startShape) {
                if (shouldConnect) {
                    if (maybeEndShape) {
                        const sourceKey = startShape.key;
                        const targetKey = maybeEndShape.key;
                        this.props.addConnection(sourceKey, targetKey);
                    }
                } else {
                    this._moveShape(startShape, canvasX, canvasY);
                }
            }
            else {
                this._selectNodesInRect(contact.get('downX'), contact.get('downY'), canvasX, canvasY);
            }
        }
        if (startShape) this._updateShape(startShape, (shape) => shape.set('isSource', false));
        this.props.nodes.forEach((_, key) => this._removeHover({shape: 'node', key}));
    };

    render() {
        const mouse = this.state.mouse;
        const touch = this.state.touch;
        const viewBox = this.state.viewBox;

        return (
            <Hammer
                options={{
                    recognizers: {
                        pinch: {enable: true},
                        tap: {enable: false},
                        swipe: {enable: false},
                        press: {enable: false}
                    }
                }}
                // onPress={(e) => console.log('press')}
                // onPressUp={(e) => console.log('press up')}
                // onPinchOut={(e) => console.log('pinch out', e)}
                // onPinchIn={(e) => console.log('pinch in', e)}
                // onTap={(e) => console.log('tap', e)}
                // onSwipe={() => console.log('swipe')}
            >
            <svg
                className={`svg-canvas svg-canvas-${this.state.svgClass}`}
                ref={(c) => this.canvas = c}
                //handlers
                onContextMenu={this._handleRightMouseDown}
                onMouseDown={this._handleMouseDown}
                onMouseMove={this._handleMouseMove}
                onMouseUp={this._handleMouseUp}
                onTouchStart={this._handleTouchStart}
                onTouchMove={this._handleTouchMove}
                onTouchEnd={this._handleTouchEnd}
                viewBox={`${viewBox.x0} ${viewBox.y0} ${viewBox.width} ${viewBox.height}`}
            >
                { maybeSelectionRect(mouse) }
                {
                    config.SHOULD_CONNECT({mouse}) ?
                        <path d={`
                            M ${mouse.get('downX')} ${mouse.get('downY')} ${mouse.get('moveX')} ${mouse.get('moveY')}
                        `} /> :
                        null
                }
                { maybeSelectionRect(touch) }
                {
                    config.SHOULD_CONNECT({touch}) ?
                        <path d={`
                            M ${touch.get('downX')} ${touch.get('downY')} ${touch.get('moveX')} ${touch.get('moveY')}
                        `} /> :
                        null
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
                    this.props.connections.map((connection, key) =>
                        <Connection
                            key={key}
                            connection={connection}
                            mouse={this.state.mouse}
                            touch={this.state.touch}
                            resetMouse={this._resetMouse}
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
                {
                    this.props.nodes.map((node, key) =>
                        <Node
                            key={key}
                            nodeKey={key}
                            node={node}
                            {...this.maybeMovingCoordinates({shape: 'node', key})}
                            tempData={this.state.tempNodes.get(key)}
                            setLongTouchTimer={this.setLongTouchTimer}
                        />
                    )
                }
            </svg>
            </Hammer>
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