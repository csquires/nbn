import { Map, List } from 'immutable';
import * as utils from 'src/utils/utils';
import ActionTypes from 'src/utils/ActionTypes';

const initialState = Map({
    strokes: Map({}),
    circles: Map({}),
    arrows: Map({}),
    boxes: Map({}),
});

const shapesReducer = (state=initialState, action) => {
    switch(action.type) {
        case ActionTypes.CIRCLE.ADD:
            state = state.update('circles', (circles) => circles.set(action.payload.key,
                Map({
                    cx: action.payload.cx,
                    cy: action.payload.cy,
                })
            ));
            return state;
        case ActionTypes.ARROW.ADD:
            state = state.update('arrows', (arrows) => arrows.set(action.payload.key,
                Map({
                    source: action.payload.source,
                    target: action.payload.target,
                    is_directed: action.payload.is_directed
                })
            ));
            return state;
        case ActionTypes.BOX.ADD:
            state = state.update('boxes', (boxes) => boxes.set(action.payload.key,
                Map({
                    cx: action.payload.cx,
                    cy: action.payload.cy
                })
            ));
            return state;
        case ActionTypes.CLEAR:
            return initialState;
        default:
            return state;
    }
};

export default shapesReducer;