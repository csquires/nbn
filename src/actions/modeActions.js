import ActionTypes from '../utils/ActionTypes';

export const setSelection = (selection) => {
    return {
        type: ActionTypes.SELECTION.SET,
        payload: {
            selection: selection
        }
    }
};