import { Map, List, Set } from 'immutable';
import ActionTypes from '../utils/ActionTypes';
import * as networkAnalysis from '../utils/networkAnalysis';

const initialState = Map({
    past: List([]),
    present: Map({
        circles: Map({}),
        connections: Set(),
        boxes: Map({}),
        last_circle_key: 0,
        last_box_key: 0,
        num_selected: 0,
        statistics: Map({
            max_centrality: null,
            min_centrality: null
        })
    }),
    future: List([])
});

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
            if (newState!== currentState ) {
                return overallState
                    .update('past', (past) => past.push(currentState))
                    .set('present', newState);
            }
            return overallState;
    }
};

const isSelected = (shape) => shape.get('selected');
const connectedToSelected = (connection, circles) => {
    const sourceKey = connection.get('source');
    const targetKey = connection.get('target');
    return circles.getIn([sourceKey, 'selected']) || circles.getIn([targetKey, 'selected']);
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
        case ActionTypes.CIRCLE.ADD:
            const newCircleKey = state.get('last_circle_key') + 1;
            state =
                state.update('circles', (circles) => circles.set(newCircleKey,
                    Map({
                        cx: action.payload.cx,
                        cy: action.payload.cy,
                    })
                )).set('last_circle_key', newCircleKey);
            return state;
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
        case ActionTypes.BOX.ADD:
            const newBoxKey = state.get('last_box_key') + 1;
            state =
                state.update('boxes', (boxes) => boxes.set(newBoxKey,
                    Map({
                        cx: action.payload.cx,
                        cy: action.payload.cy
                    })
                )).set('last_box_key', newBoxKey);
            return state;

        // COMMANDS
        case ActionTypes.SHAPES.CHANGE_SELECTION:
            const shape = action.payload.shape;
            const key = action.payload.key;
            const path = (() => {
                switch (shape) {
                    case 'circle': return ['circles', key, 'selected'];
                    case 'box': return ['boxes', key, 'selected'];
                }
            })();
            const selectionStatus = state.getIn(path);
            state = state.setIn(path, !selectionStatus);
            state = state.update('num_selected', (numSelected) => selectionStatus ? numSelected-1: numSelected+1);
            return state;
        case ActionTypes.SHAPES.DELETE_SELECTED:
            const numSelectedCircles = state.get('circles').filter(isSelected).size;
            const numSelectedBoxes = state.get('boxes').filter(isSelected).size;
            state = state
                .update('circles', (circles) => circles.filterNot(isSelected))
                .update('boxes', (boxes) => boxes.filterNot(isSelected))
                .update('connections', (connections) =>
                    connections.filterNot(connection => connectedToSelected(connection, state.get('circles')))
                );
            state = state.update('num_selected', (numSelected) => numSelected - numSelectedBoxes - numSelectedCircles);
            return state;
        case ActionTypes.SHAPES.CONNECT_SELECTED:
            const selectedCircles = state.get('circles').filter(isSelected);
            const keyPairs = getKeyPairs(selectedCircles);
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
        case ActionTypes.SHAPES.SELECT_ALL:
            state = state.update('circles', (circles) => circles.map(select));
            state = state.set('num_selected', state.get('circles').size);
            return state;
        case ActionTypes.SHAPES.DESELECT_ALL:
            state = state.update('circles', (circles) => circles.map(deselect));
            state = state.set('num_selected', 0);
            return state;
        case ActionTypes.NETWORK.COMPUTE_CENTRALITIES:
            const connections = state.get('connections');
            state = state.update('circles', (circles) => networkAnalysis.computeBetweennessCentralities(circles, connections));
            const orderedCentralites = state.get('circles').map((circle) => circle.get('centrality')).sort();
            state = state.setIn(['statistics', 'max_centrality'], orderedCentralites.last());
            state = state.setIn(['statistics', 'min_centrality'], orderedCentralites.first());
            return state;
        case ActionTypes.CLEAR:
            return initialState;
        default:
            return state;
    }
};

export default timeReducer;