import { Map, List } from 'immutable';
import ActionTypes from '../utils/ActionTypes';

const initialState = Map({
    past: List([]),
    present: Map({
        circles: Map({}),
        arrows: List([]),
        boxes: Map({}),
        last_circle_key: 0,
        last_box_key: 0,
        num_selected: 0
    }),
    future: List([])
});

const timeReducer = (overallState=initialState, action) => {
    const currentState = overallState.get('present');
    switch(action.type) {
        case ActionTypes.UNDO:
            const lastState = overallState.get('past').get(-1);
            console.log('last state', lastState);
            console.log('current state', currentState);
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
        case ActionTypes.ARROW.ADD:
            state =
                state.update('arrows', (arrows) => arrows.push(
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
            const isSelected = (shape) => shape.get('selected');
            const numSelectedCircles = state.get('circles').filter(isSelected).size;
            const numSelectedBoxes = state.get('boxes').filter(isSelected).size;
            state = state
                .update('circles', (circles) => circles.filterNot(isSelected))
                .update('boxes', (boxes) => boxes.filterNot(isSelected));
            state = state.update('num_selected', (numSelected) => numSelected - numSelectedBoxes - numSelectedCircles);
            return state;
        case ActionTypes.CLEAR:
            return initialState;
        default:
            return state;
    }
};

export default timeReducer;