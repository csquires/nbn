import ActionTypes from '../utils/ActionTypes';
import Immutable, { Map } from 'immutable';

const initialState = Immutable.fromJS({
    selection: null,
});

const modeReducer = (state=initialState, action) => {
    switch(action.type) {
        case ActionTypes.SELECTION.SET:
            state = state.set('selection', action.payload.selection);
            return state;
        default:
            return state;
    }
};

export default modeReducer;