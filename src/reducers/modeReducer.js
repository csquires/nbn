import ActionTypes from '../utils/ActionTypes';
import { Map } from 'immutable';

const initialState = Map({
    selection: null,
    notification_settings: Map({
        connect: Map({
            show: true
        })
    })
});

const modeReducer = (state=initialState, action) => {
    switch(action.type) {
        case ActionTypes.SELECTION.SET:
            state = state.set('selection', action.payload.selection);
            return state;
        case ActionTypes.NOTIFICATION_SETTINGS.SET: {
            const notificationName = action.payload.notification_name;
            const settings = action.payload.settings;
            // TODO merge
            Map(settings).forEach((settingVal, settingName) => {
                state = state.setIn(['notification_settings', notificationName, settingName], settingVal);
            });
            return state;
        }
        default:
            return state;
    }
};

export default modeReducer;