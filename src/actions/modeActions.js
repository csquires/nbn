import ActionTypes from '../utils/ActionTypes';

export const setSelection = (selection) => {
    return {
        type: ActionTypes.SELECTION.SET,
        payload: {
            selection: selection
        }
    }
};

export const setHintSettings = (commandName, settings) => {
    return {
        type: ActionTypes.HINT_SETTINGS.SET,
        payload: {
            command_name: commandName,
            settings: settings
        }
    }
};