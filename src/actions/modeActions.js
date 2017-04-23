import ActionTypes from '../utils/ActionTypes';

export const setSelection = (selection) => {
    return {
        type: ActionTypes.SELECTION.SET,
        payload: {
            selection: selection
        }
    }
};

export const setNotificationSettings = (notificationName, settings) => {
    return {
        type: ActionTypes.NOTIFICATION_SETTINGS.SET,
        payload: {
            notification_name: notificationName,
            settings: settings
        }
    }
};