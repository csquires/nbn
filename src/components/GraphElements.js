// external
import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
// components
import Menu from './Menu';
// other
import * as Constants from '../utils/Constants';
import * as networkActions from '../actions/networkActions';
import * as utils from '../utils/utils';

const stopPropagation = (e) => e.stopPropagation();
const mousePropTypes = ImmutablePropTypes.contains({
    isDown: React.PropTypes.bool.isRequired
});

class UnconnectedNode extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tempLabel: '',
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
    _getClassName = () => {
        const baseClass = 'node ';
        // action
        const sourceClass = this.props.tempData.get('isSource') ? 'source ' : '';
        const movingClass = this.props.isMoving ? 'node-moving ' : '';
        const selectionClass = this.props.node.get('selected') ? 'node-selected ' : '';
        // statistics
        const pathClass = this.props.node.get('onShortestPath') ? 'node-shortest ' : '';
        return baseClass + selectionClass + movingClass + sourceClass + pathClass + this.props.tempData.get('hover');
    };
    _getStyle = () => {
        const centrality = this.props.node.get('centrality');
        const fill = (() => {
            if (typeof centrality === 'undefined') return '';
                const red = Math.round(centrality*255);
                const blue = Math.round((1-centrality)*255);
                return `rgb(${red},0,${blue})`;
        })();
        return {fill};
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

    _getMenu = (cx, cy) => {
        const menuItems = [
            {xd: 0, yd: 0, widthd: 1, heightd: .25, text: "Delete", onClick: this.props.deleteNode},
            {xd: 0, yd: .25, widthd: 1, heightd: .25, text: "Label", onClick: this.props.startLabelling},
            {xd: 0, yd: .5, widthd: 1, heightd: .25},
            {xd: 0, yd: .75, widthd: 1, heightd: .25},
        ];
        if (this.props.tempData.get('menuOpen')) {
            return (
                <Menu
                    xt={cx}
                    yt={cy}
                    menuItems={menuItems}
                    height={Constants.MENU_HEIGHT}
                    width={Constants.MENU_WIDTH}
                />
            )
        }
        return null;
    };

    render() {
        const node = this.props.node;
        const placeholder = "label";
        const className = this._getClassName();
        const style = this._getStyle();
        const menu = this._getMenu(cx, cy);
        const [cx, cy] = this.props.isMoving ? [this.props.movingX, this.props.movingY] : [node.get('cx'), node.get('cy')];

        return (
            <g>
                <circle
                    // svg attributes
                    cx={cx}
                    cy={cy}
                    r={Constants.CIRCLE_RADIUS}
                    // style
                    className={className}
                    style={style}
                />
                { menu }
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
                                onMouseDown={stopPropagation}
                                onClick={stopPropagation}
                                onKeyDown={stopPropagation}
                                onKeyPress={this._handleKeyPressInput}
                                onKeyUp={this._handleKeyUpInput}
                            />
                        </foreignObject> :
                        <text
                            x={cx}
                            y={cy}
                            textAnchor='middle'
                            className='node-label'
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

const mapDispatchToPropsNode = (dispatch, ownProps) => {
    const key = ownProps.nodeKey;
    return {
        label: (key, label) => dispatch(networkActions.labelNode(key, label)),
        addConnection: (source, target) => dispatch(networkActions.addConnection(source, target)),
        deleteNode: () => dispatch(networkActions.deleteNode(key)),
        startLabelling  : () => dispatch(networkActions.startLabellingNode(key))
    }
};

UnconnectedNode.propTypes = {
    nodeKey: React.PropTypes.number.isRequired,
    node: ImmutablePropTypes.contains({
        cx: React.PropTypes.number.isRequired,
        cy: React.PropTypes.number.isRequired,
        selected: React.PropTypes.boolean,
        centrality: React.PropTypes.number,
        is_labelling: React.PropTypes.boolean,
    }),
    tempData: React.PropTypes.any.isRequired
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
    const {mouse, touch, connection} = ownProps;
    // get source/target keys and nodes
    const [sourceKey, targetKey] = [connection.get('source'), connection.get('target')];
    const nodes = state.shapes.getIn(['present', 'nodes']);
    const [sourceNode, targetNode] = [nodes.get(sourceKey), nodes.get(targetKey)];
    // get cx and cy of source and target and return
    const sourceMovementInfo = utils.getNodeMovementInfo(mouse, touch, sourceKey, sourceNode);
    const [cxSource, cySource] = [sourceMovementInfo.cx, sourceMovementInfo.cy];
    const targetMovementInfo = utils.getNodeMovementInfo(mouse, touch, targetKey, targetNode);
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
    touch: React.PropTypes.any.isRequired,
};

export const Connection = connect(mapStateToPropsConnection, mapDispatchToPropsConnection)(UnconnectedConnection);