import ActionTypes from '../utils/ActionTypes';
import download from 'downloadjs';

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

export const closeModal = (modalName) => {
    return {
        type: ActionTypes.MODAL.CLOSE,
        payload: {
            modal_name: modalName
        }
    };
};

export const openModal = (modalName) => {
    return {
        type: ActionTypes.MODAL.OPEN,
        payload: {
            modal_name: modalName
        }
    };
};

export const downloadNetwork = () => {
    return (dispatch, getState) => {
        const currentShapes = getState().shapes.get('present');
        const networkJson = JSON.stringify(currentShapes.toJS());
        download(networkJson, 'text.nbn.txt');
    }
};

