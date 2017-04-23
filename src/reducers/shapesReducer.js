import { Map, List } from 'immutable';
import ActionTypes from '../utils/ActionTypes';

const initialState = Map({
    circles: Map({}),
    arrows: List([]),
    boxes: Map({}),
    lastCircleKey: 0,
    lastBoxKey: 0,
});

const shapesReducer = (state=initialState, action) => {
    switch(action.type) {
        case ActionTypes.CIRCLE.ADD:
            const newCircleKey = state.get('lastCircleKey') + 1;
            state =
                state.update('circles', (circles) => circles.set(newCircleKey,
                    Map({
                        cx: action.payload.cx,
                        cy: action.payload.cy,
                    })
                )).set('lastCircleKey', newCircleKey);
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
            const newBoxKey = state.get('lastBoxKey') + 1;
            state =
                state.update('boxes', (boxes) => boxes.set(newBoxKey,
                    Map({
                        cx: action.payload.cx,
                        cy: action.payload.cy
                    })
                )).set('lastBoxKey', newBoxKey);
            return state;
        case ActionTypes.CLEAR:
            return initialState;
        default:
            return state;
    }
};

export default shapesReducer;