// external
import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
// other
import * as Constants from '../utils/Constants';
import * as networkActions from '../actions/networkActions';

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

class UnconnectedNode extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tempLabel: ''
        };
        this._handleKeyPress = this._handleKeyPress.bind(this);
    }

    _handleKeyPress(e) {
        if (e.key === 'Enter') {
            console.log('here');
            this.props.label(this.props.nodeKey, this.state.tempLabel);
        }
        e.stopPropagation();
    }

    handleClick(e) {
        console.log('clicked input');
        e.stopPropagation();
    }

    handleMouseDown(e) {
        console.log('mouse down input');
        e.stopPropagation();
    }

    render() {
        const {nodeKey, node} = this.props;
        const {cx, cy, isMoving} = this.props.getNodeMovementInfo(nodeKey, node);

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
                        <foreignObject x={cx} y={cy}>
                            <input
                                placeholder="label"
                                value={this.state.tempLabel}
                                onChange={(e) => this.setState({tempLabel: e.target.value})}
                                onMouseDown={this.handleMouseDown}
                                onClick={this.handleClick}
                                onKeyPress={this._handleKeyPress}
                            />
                        </foreignObject> :
                        null
                }
            </g>
        )
    }
}

const mapStateToProps = (state) => ({

});

const mapDispatchToProps = (dispatch) => ({
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
    getNodeMovementInfo: React.PropTypes.func.isRequired,
};

export const Node = connect(mapStateToProps, mapDispatchToProps)(UnconnectedNode);



export class Connection extends Component {

    render() {
        const {connection} = this.props;
        const [sourceKey, targetKey] = [connection.get('source'), connection.get('target')];
        const sourceMovementInfo = this.props.getNodeMovementInfo(sourceKey);
        const [cxSource, cySource] = [sourceMovementInfo.cx, sourceMovementInfo.cy];
        const targetMovementInfo = this.props.getNodeMovementInfo(targetKey);
        const [cxTarget, cyTarget] = [targetMovementInfo.cx, targetMovementInfo.cy];

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

Connection.propTypes = {
    connection: ImmutablePropTypes.contains({
        source: React.PropTypes.any.isRequired,
        target: React.PropTypes.any.isRequired,
    }),
    getNodeMovementInfo: React.PropTypes.func.isRequired,
};