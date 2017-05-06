// external
import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
// other
import * as Constants from '../utils/Constants';
import * as networkActions from '../actions/networkActions';
import * as utils from '../utils/utils';

const getClass = (isSelected, isMoving) => {
    const baseClass = 'node ';
    const selectionString = isSelected ? 'node-selected ' : '';
    const movingString = isMoving ? 'node-moving ' : '';
    return baseClass + selectionString + movingString;
};
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
            tempLabel: ''
        };
        this._handleKeyPress = this._handleKeyPress.bind(this);
        this._handleKeyUp = this._handleKeyUp.bind(this);
        this.getInputBoxWidthSvg = this.getInputBoxWidthSvg.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const shallLabel = nextProps.node.get('is_labelling');
        const wasLabelling = this.props.node.get('is_labelling');
        if (shallLabel && !wasLabelling) {
            this.setState({tempLabel: nextProps.node.get('label')})
        }
    }

    _handleKeyPress(e) {
        switch (e.key) {
            case ('Enter'): {
                this.props.label(this.props.nodeKey, this.state.tempLabel);
                break;
            }
        }
        e.stopPropagation();
    }

    _handleClick(e) {
        e.stopPropagation();
    }

    _handleMouseDown(e) {
        e.stopPropagation();
    }

    _handleKeyUp(e) {
        switch (e.keyCode) {
            case (27): { // esc
                this.props.label(this.props.nodeKey, '');
            }
        }
        e.stopPropagation();
    }

    getInputBoxWidthSvg() {
        const inputBox = this.inputBox;
        const inputBoxWidthHtml = inputBox && this.inputBox.getBoundingClientRect().width;
        console.log('width html', inputBoxWidthHtml);
        return 100;
    }

    render() {
        const {mouse, touches, nodeKey, node} = this.props;
        const {cx, cy, isMoving} = utils.getNodeMovementInfo(mouse, touches, nodeKey, node);
        const placeholder = "label";

        return (
            <g>
                <circle
                    cx={cx}
                    cy={cy}
                    r={Constants.CIRCLE_RADIUS}
                    className={getClass(node.get('selected'), isMoving)}
                    style={{fill: getColor(node.get('centrality'))}}
                />
                {
                    node.get('is_labelling') ?
                        <foreignObject
                            x={cx}
                            y={cy}
                            height={Constants.CIRCLE_RADIUS}
                            width={this.getInputBoxWidthSvg()}
                        >
                            <input
                                autoFocus
                                ref={(c) => this.inputBox = c}
                                placeholder={placeholder}
                                value={this.state.tempLabel}
                                onChange={(e) => this.setState({tempLabel: e.target.value})}
                                onMouseDown={this._handleMouseDown}
                                onClick={this._handleClick}
                                onKeyPress={this._handleKeyPress}
                                onKeyUp={this._handleKeyUp}
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
    label: (key, label) => dispatch(networkActions.labelNode(key, label))
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