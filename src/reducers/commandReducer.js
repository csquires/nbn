import ActionTypes from '../utils/ActionTypes';
import Immutable, { Map } from 'immutable';
import * as shapeActions from '../actions/shapeActions';

const hintSettingsDefault = {
    should_show: true,
    showing: false
};
const getHintText = ({key, command, result}) => {
    const keyText = key ? `press '${key}'` : null;
    const commandText = command ? `say '${command}'` : null;
    const text =  [keyText, commandText].join(' or ');
    return `${text} to ${result}`
};
const getCommandConfig = ({key, command, result}) => {
    return {
        key: key,
        command: command,
        hint_text: getHintText({key, command, result})
    }
};

const initialState = Immutable.fromJS({
    commands: {
        connect: {
            hint_settings: hintSettingsDefault,
            title: 'Connect Nodes',
            ...getCommandConfig({key: 'c', command: 'connect', result: 'connect nodes'})
        },
        delete_selected: {
            settings: hintSettingsDefault,
            title: 'Delete Selected Nodes',
            ...getCommandConfig({key: 'Delete', command: 'delete', result: 'delete selected shapes'})
        },
        undo: {
            settings: hintSettingsDefault,
            title: 'Undo',
            ...getCommandConfig({key: 'u', command: 'undo', result: 'undo'})
        },
        select: {
            settings: hintSettingsDefault,
            title: 'Select all',
            ...getCommandConfig({key: 's', command: 'select all', result: 'select all'})
        },
        deselect: {
            settings: hintSettingsDefault,
            title: 'Clear selections',
            ...getCommandConfig({key: 'd', command: 'deselect all', result: 'deselect all'})
        },
        compute_centralities: {
            settings: hintSettingsDefault,
            title: 'Compute centralities',
            ...getCommandConfig({key: 't', command: 'compute centralities', result: 'compute centralities'})
        }
    }
});

export const commandMap = Map({
    connect: shapeActions.connectSelected,
    delete_selected: shapeActions.deleteSelectedShapes,
    undo: shapeActions.undo,
    deselect: shapeActions.deselectAll,
    select: shapeActions.selectAll,
    compute_centralities: shapeActions.computeCentralities
});

const commandReducer = (state=initialState, action) => {
    switch(action.type) {
        case ActionTypes.HINT_SETTINGS.SET: {
            const commandName = action.payload.command_name;
            const settings = action.payload.settings;
            // TODO merge
            Map(settings).forEach((settingVal, settingName) => {
                state = state.setIn(['commands', commandName, 'hint_settings', settingName], settingVal);
            });
            return state;
        }
        default:
            return state;
    }
};

export default commandReducer;