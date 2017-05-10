// external
import Immutable, { Map, List, Set } from 'immutable';
import _ from 'lodash';
// utils
import ActionTypes from '../utils/ActionTypes';
import * as networkAnalysis from '../utils/networkAnalysis';


const initialState = Map({
    past: List([]),
    present: Map({
        nodes: Map({}),
        connections: Set(),
        interactions: Map({}),
        last_node_key: 0,
        last_interaction_key: 0,
        num_selected: 0,
        statistics: Map({
            max_centrality: null,
            min_centrality: null
        }),
        zoom_level: 0
    }),
    future: List([])
});

const blackList = [ActionTypes.NODE.BEGIN_LABEL];
const isBlacklisted = (action) => _.includes(blackList, action);

const timeReducer = (overallState=initialState, action) => {
    const currentState = overallState.get('present');
    switch(action.type) {
        case ActionTypes.UNDO:
            const lastState = overallState.get('past').get(-1);
            return overallState
                .update('past', (past) => past.pop())
                .set('present', lastState)
                .update('future', (future) => future.unshift(currentState));
        default:
            const newState = stateReducer(currentState, action);
            overallState = overallState.set('present', newState);
            if (!isBlacklisted(action) && newState !== currentState) {
                overallState = overallState.update('past', (past) => past.push(currentState))
            }
            return overallState;
    }
};

export const isSelected = (shape) => shape.get('selected');
const connectedToSelected = (connection, nodes) => {
    const sourceKey = connection.get('source');
    const targetKey = connection.get('target');
    return nodes.getIn([sourceKey, 'selected']) || nodes.getIn([targetKey, 'selected']);
};
export const getKeyPairs = (map) => {
    const [...keys] = map.keys();
    let keyPairs = List([]);
    keys.forEach((key, index) => {
        const prevKeys = keys.slice(0, index);
        const pairs = prevKeys.map((prevKey) => List([prevKey, key]));
        keyPairs = keyPairs.concat(pairs);
    });
    return keyPairs;
};
const select = (shape) => shape.set('selected', true);
const deselect = (shape) => shape.set('selected', false);

const stateReducer = (state, action) => {
    switch(action.type) {
        case ActionTypes.NODE.ADD:
            const newNodeKey = state.get('last_node_key') + 1;
            state =
                state.update('nodes', (nodes) => nodes.set(newNodeKey,
                    Map({
                        cx: action.payload.cx,
                        cy: action.payload.cy,
                    })
                )).set('last_node_key', newNodeKey);
            return state;
        case ActionTypes.NODE.MOVE: {
            const key = action.payload.key;
            const cx = action.payload.cx;
            const cy = action.payload.cy;
            state = state.updateIn(['nodes', key], (node) => node.set('cx', cx).set('cy', cy));
            return state;
        }
        case ActionTypes.NODE.BEGIN_LABEL: {
            const key = action.payload.key;
            state = state.updateIn(['nodes', key], (node) => node.set('is_labelling', true));
            return state;
        }
        case ActionTypes.NODE.LABEL: {
            const key = action.payload.key;
            const label = action.payload.label;
            state = state.updateIn(['nodes', key], (node) => node.set('label', label).set('is_labelling', false));
            return state;
        }
        case ActionTypes.CONNECTION.ADD:
            state =
                state.update('connections', (connections) => connections.add(
                    Map({
                        source: action.payload.source,
                        target: action.payload.target,
                        is_directed: action.payload.is_directed
                    })
                ));
            return state;
        case ActionTypes.INTERACTION.ADD:
            const newInteractionKey = state.get('last_interaction_key') + 1;
            state =
                state.update('interactions', (interactions) => interactions.set(newInteractionKey,
                    Map({
                        cx: action.payload.cx,
                        cy: action.payload.cy
                    })
                )).set('last_interaction_key', newInteractionKey);
            return state;

        // COMMANDS
        case ActionTypes.NETWORK.CHANGE_SELECTION:
            const shape = action.payload.shape;
            const key = action.payload.key;
            const path = (() => {
                switch (shape) {
                    case 'node': return ['nodes', key, 'selected'];
                    case 'interaction': return ['interactions', key, 'selected'];
                    default: return []; // TODO error-handling
                }
            })();
            const selectionStatus = state.getIn(path);
            state = state.setIn(path, !selectionStatus);
            state = state.update('num_selected', (numSelected) => selectionStatus ? numSelected-1: numSelected+1);
            return state;
        case ActionTypes.NETWORK.DELETE_SELECTED:
            const numSelectedNodes = state.get('nodes').filter(isSelected).size;
            const numSelectedInteractions = state.get('interactions').filter(isSelected).size;
            state = state
                .update('nodes', (nodes) => nodes.filterNot(isSelected))
                .update('interactions', (interactions) => interactions.filterNot(isSelected))
                .update('connections', (connections) =>
                    connections.filterNot(connection => connectedToSelected(connection, state.get('nodes')))
                );
            state = state.update('num_selected', (numSelected) => numSelected - numSelectedInteractions - numSelectedNodes);
            return state;
        case ActionTypes.NETWORK.CONNECT_SELECTED:
            const selectedNodes = state.get('nodes').filter(isSelected);
            const keyPairs = getKeyPairs(selectedNodes);
            keyPairs.forEach(([source, target]) => {
                state = state
                    .update('connections', (connections) => connections.add(
                        Map({
                            source: source,
                            target: target,
                            is_directed: false
                        })
                    ))
            });
            return state;
        case ActionTypes.NETWORK.SELECT_ALL:
            state = state.update('nodes', (nodes) => nodes.map(select));
            state = state.set('num_selected', state.get('nodes').size);
            return state;
        case ActionTypes.NETWORK.DESELECT_ALL:
            state = state.update('nodes', (nodes) => nodes.map(deselect));
            state = state.set('num_selected', 0);
            return state;
        case ActionTypes.NETWORK.COMPUTE_CENTRALITIES:
            const connections = state.get('connections');
            state = state.update('nodes', (nodes) => networkAnalysis.computeBetweennessCentralities(nodes, connections));
            const orderedCentralities = state.get('nodes').map((node) => node.get('centrality')).sort();
            state = state.setIn(['statistics', 'max_centrality'], orderedCentralities.last());
            state = state.setIn(['statistics', 'min_centrality'], orderedCentralities.first());
            return state;
        case ActionTypes.NETWORK.SET: {
            const networkJson = action.payload.network_json;
            let network = Immutable.fromJS(networkJson);
            const num2str = (num) => `${num}`;
            const keysToStrings = (connection) => connection.update('source', num2str).update('target', num2str);
            network = network.update('connections', (connections) => connections.map(keysToStrings).toSet());
            state = network;
            return state;
        }
        case ActionTypes.NETWORK.ZOOM_IN: {
            state = state.update('zoom_level', (z) => z+1);
            return state;
        }
        case ActionTypes.NETWORK.ZOOM_OUT: {
            state = state.update('zoom_level', (z) => z-1);
            return state;
        }
        case ActionTypes.CLEAR:
            return initialState;
        default:
            return state;
    }
};

export default timeReducer;