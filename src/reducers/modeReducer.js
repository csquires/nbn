import ActionTypes from '../utils/ActionTypes';
import Immutable from 'immutable';

const initialState = Immutable.fromJS({
    selection: 'node',
    modals: {
        file_upload: {
            is_open: false
        }
    }
});

const modeReducer = (state=initialState, action) => {
    switch(action.type) {
        case ActionTypes.SELECTION.SET:
            state = state.set('selection', action.payload.selection);
            return state;
        case ActionTypes.MODAL.CLOSE: {
            const modalName = action.payload.modal_name;
            state = state.setIn(['modals', modalName, 'is_open'], false);
            return state;
        }
        case ActionTypes.MODAL.OPEN:
            const modalName = action.payload.modal_name;
            state = state.setIn(['modals', modalName, 'is_open'], true);
            return state;
        default:
            return state;
    }
};

export default modeReducer;