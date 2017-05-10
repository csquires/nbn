// external
import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
// other
import * as Constants from '../utils/Constants';
import * as networkActions from '../actions/networkActions';
import * as utils from '../utils/utils';
import * as config from '../config';


const getColor = (decimal) => {
    if (typeof decimal === 'undefined') return '';
    const red = Math.round(decimal*255);
    const blue = Math.round((1-decimal)*255);
    return `rgb(${red},0,${blue})`;
};
const mousePropTypes = ImmutablePropTypes.contains({
    isDown: React.PropTypes.bool.isRequired
});
const touchesPropTypes = ImmutablePropTypes.contains({});

class UnconnectedNode extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tempLabel: '',
            hoverClass: ''
        };
    }

    // ------------------- LIFECYCLE --------------------
    componentWillReceiveProps(nextProps) {
        const shallLabel = nextProps.node.get('is_labelling');
        const wasLabelling = this.props.node.get('is_labelling');
        if (shallLabel && !wasLabelling) {
            this.setState({tempLabel: nextProps.node.get('label')})
        }
    }

    // ------------------- HELPERS --------------------
    _getInputBoxWidthSvg = () => {
        // const inputBox = this.inputBox;
        // const inputBoxWidthHtml = inputBox && this.inputBox.getBoundingClientRect().width;
        return 100;
    };
    _thisNode = () => {
        return {shape: 'node', key: this.props.nodeKey};
    };
    _isIntersectedShape = () => {
        const mouseShape = this.props.mouse.get('intersectedShape');
        const isIntersectedMouse = utils.shapeMatches(mouseShape, this._thisNode());
        const touchShapes = this.props.touches.map((t) => t.get('intersectedShape'));
        const isIntersectedTouch = touchShapes.some((touchShape) => utils.shapeMatches(touchShape, this._thisNode()));
        return isIntersectedMouse || isIntersectedTouch;
    };
    _maybeAddHover = () => {
        const mouse = this.props.mouse;
        if (mouse.get('isDown')) {
            const shouldConnect = config.SHOULD_CONNECT({mouse});
            if (shouldConnect) this.setState({hoverClass: 'node-target-hover'});
            else if (!this._isIntersectedShape()) this.setState({hoverClass: 'node-error-hover'});
        }
    };
    _removeHover = () => {
        this.setState({hoverClass: ''})
    };
    _getClass = (isMoving) => {
        const baseClass = 'node ';
        const selectionString = this.props.node.get('selected') ? 'node-selected ' : '';
        const movingString = isMoving ? 'node-moving ' : '';
        const mouse = this.props.mouse;
        const shouldConnect = config.SHOULD_CONNECT({mouse}) || this.props.touches.some((touch) => config.SHOULD_CONNECT({touch}));
        console.log('should connect', shouldConnect);
        const isConnecting = this._isIntersectedShape() && shouldConnect;
        const connectionClass = isConnecting ? 'node-target-hover ' : '';
        return baseClass + selectionString + movingString + connectionClass + this.state.hoverClass;
    };

    // ------------------- HANDLERS --------------------
    // on input box
    _handleKeyPressInput = (e) => {
        switch (e.key) {
            case ('Enter'): {
                this.props.label(this.props.nodeKey, this.state.tempLabel);
                break;
            }
            default:
                break;
        }
        e.stopPropagation();
    };
    _handleClickInput = (e) => {
        e.stopPropagation();
    };
    _handleMouseDownInput = (e) => {
        e.stopPropagation();
    };
    _handleKeyUpInput = (e) => {
        switch (e.keyCode) {
            case (27): { // esc
                this.props.label(this.props.nodeKey, '');
                break;
            }
            default:
                break;
        }
        e.stopPropagation();
    };

    // touch
    _handleTouchStart = (e) => {
        const touches = e.changedTouches;
        utils.eachTouch(touches, (_, key) => {
            this.props.updateTouch(key, (touch) => touch.set('intersectedShape', this._thisNode()));
            this.props.setLongTouchTimer(key);
        });
    };
    _handleTouchEnd = (e) => {
        const touches = e.changedTouches;
        utils.eachTouch(touches, (touchEvent, key) => {
            const sourceKey = this.props.touches.get(key).get('intersectedShape').key;
            const targetKey = this.props.nodeKey;
            console.log('source', sourceKey, 'target', targetKey);
            this.props.addConnection(sourceKey, targetKey);
        })
    };

    // mouse
    _handleMouseDown = (e) => {
        if (e.button !== 0) return; // only take left mouse clicks
        const hasCtrl = e.ctrlKey;
        this.props.updateMouse((mouse) =>
            mouse
            .set('intersectedShape', this._thisNode())
            .set('ctrlKey', hasCtrl)
        );
    };
    _handleMouseUp = (e) => {
        if (e.button !== 0) return; // only take left mouse clicks
        this._removeHover();
        const mouse = this.props.mouse;
        const shouldConnect = config.SHOULD_CONNECT({mouse});
        if (shouldConnect) {
            const sourceKey = mouse.get('intersectedShape').key;
            const targetKey = this.props.nodeKey;
            this.props.addConnection(sourceKey, targetKey);
        }
    };

    render() {
        const {mouse, touches, nodeKey, node} = this.props;
        const {cx, cy, isMoving} = utils.getNodeMovementInfo(mouse, touches, nodeKey, node);
        const placeholder = "label";

        return (
            <g>
                <circle
                    // handlers
                    onMouseEnter={this._maybeAddHover}
                    onMouseLeave={this._removeHover}
                    onTouchStart={this._handleTouchStart}
                    onTouchEnd={this._handleTouchEnd}
                    onMouseDown={this._handleMouseDown}
                    onMouseUp={this._handleMouseUp}
                    // svg attributes
                    cx={cx}
                    cy={cy}
                    r={Constants.CIRCLE_RADIUS}
                    // style
                    className={this._getClass(isMoving)}
                    style={{fill: getColor(node.get('centrality'))}}
                />
                {
                    node.get('is_labelling') ?
                        <foreignObject
                            x={cx}
                            y={cy}
                            height={Constants.CIRCLE_RADIUS}
                            width={this._getInputBoxWidthSvg()}
                        >
                            <input
                                autoFocus
                                ref={(c) => this.inputBox = c}
                                placeholder={placeholder}
                                value={this.state.tempLabel}
                                // handlers
                                onChange={(e) => this.setState({tempLabel: e.target.value})}
                                onMouseDown={this._handleMouseDownInput}
                                onClick={this._handleClickInput}
                                onKeyPress={this._handleKeyPressInput}
                                onKeyUp={this._handleKeyUpInput}
                            />
                        </foreignObject> :
                        <text
                            x={cx}
                            y={cy}
                            textAnchor='middle'
                        >
                            {node.get('label')}
                        </text>
                }
            </g>
        )
    }
}

const mapStateToPropsNode = (state) => ({

});

const mapDispatchToPropsNode = (dispatch) => ({
    label: (key, label) => dispatch(networkActions.labelNode(key, label)),
    addConnection: (source, target) => dispatch(networkActions.addConnection(source, target)),
});

UnconnectedNode.propTypes = {
    nodeKey: React.PropTypes.number.isRequired,
    node: ImmutablePropTypes.contains({
        cx: React.PropTypes.number.isRequired,
        cy: React.PropTypes.number.isRequired,
        selected: React.PropTypes.boolean,
        centrality: React.PropTypes.number,
        is_labelling: React.PropTypes.boolean,
    }),
    mouse: mousePropTypes,
    touches: touchesPropTypes,
    updateMouse: React.PropTypes.func.isRequired,
    updateTouch: React.PropTypes.func.isRequired,
};

export const Node = connect(mapStateToPropsNode, mapDispatchToPropsNode)(UnconnectedNode);



class UnconnectedConnection extends Component {

    render() {
        const {cxSource, cySource, cxTarget, cyTarget} = this.props;
        // potentially for directed
        // const length = dist(x1, y1, x2, y2);
        // const angle = Math.atan2(y2-y1, x2-x1);
        // const leg1x = x2 - .2*length*Math.cos(angle-Math.PI/4);
        // const leg1y = y2 - .2*length*Math.sin(angle-Math.PI/4);
        // const leg2x = x2 - .2*length*Math.cos(angle+Math.PI/4);
        // const leg2y = y2 - .2*length*Math.sin(angle+Math.PI/4);
        return (
            <path d={`
                M ${cxSource} ${cySource} ${cxTarget} ${cyTarget}
            `} />
        )
    }
}

const mapStateToPropsConnection = (state, ownProps) => {
    const {mouse, touches, connection} = ownProps;
    // get source/target keys and nodes
    const [sourceKey, targetKey] = [connection.get('source'), connection.get('target')];
    const nodes = state.shapes.getIn(['present', 'nodes']);
    const [sourceNode, targetNode] = [nodes.get(sourceKey), nodes.get(targetKey)];
    // get cx and cy of source and target and return
    const sourceMovementInfo = utils.getNodeMovementInfo(mouse, touches, sourceKey, sourceNode);
    const [cxSource, cySource] = [sourceMovementInfo.cx, sourceMovementInfo.cy];
    const targetMovementInfo = utils.getNodeMovementInfo(mouse, touches, targetKey, targetNode);
    const [cxTarget, cyTarget] = [targetMovementInfo.cx, targetMovementInfo.cy];
    return {cxSource, cySource, cxTarget, cyTarget};
};

const mapDispatchToPropsConnection = (dispatch) => ({

});

UnconnectedConnection.propTypes = {
    connection: ImmutablePropTypes.contains({
        source: React.PropTypes.any.isRequired,
        target: React.PropTypes.any.isRequired,
    }),
    mouse: mousePropTypes,
    touches: touchesPropTypes,
};

export const Connection = connect(mapStateToPropsConnection, mapDispatchToPropsConnection)(UnconnectedConnection);