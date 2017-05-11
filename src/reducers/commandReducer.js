import ActionTypes from '../utils/ActionTypes';
import Immutable, { Map } from 'immutable';
import * as networkActions from '../actions/networkActions';
import * as modeActions from '../actions/modeActions';
import { MODIFIERS } from '../utils/Constants';

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

const getCommandConfig = ({key, command, modifier, result}) => {
    const modifierMap = {};
    modifierMap[MODIFIERS.CTRL] = false;
    modifierMap[MODIFIERS.SHIFT] = false;
    modifierMap[MODIFIERS.ALT] = false;

    if (Array.isArray(modifier)) {
        modifier.forEach((m) => modifierMap[m] = true);
    } else if (modifier) {
        modifierMap[modifier] = true;
    }
        return {
        key: key,
        command: command,
        modifier: modifierMap,
        hint_text: getHintText({key, command, result})
    }
};


const initialState = Immutable.fromJS({
    commands: {
        connect: {
            hint_settings: hintSettingsDefault,
            title: "Connect Selected Nodes",
            response: "Connected selected nodes",
            action: networkActions.connectSelected,
            ...getCommandConfig({key: "c", modifier: MODIFIERS.CTRL, command: "connect", result: "connect nodes"})
        },
        delete_selected: {
            hint_settings: hintSettingsDefault,
            title: "Delete Selected Nodes",
            response: "Deleted selected nodes",
            action: networkActions.deleteSelectedShapes,
            ...getCommandConfig({key: "Delete", command: "delete", result: "delete selected shapes"})
        },
        undo: {
            hint_settings: hintSettingsDefault,
            title: "Undo",
            response: 'Undid last action',
            action: networkActions.undo,
            ...getCommandConfig({key: "z", modifier: MODIFIERS.CTRL, command: "undo", result: "undo"})
        },
        select: {
            hint_settings: hintSettingsDefault,
            title: "Select all nodes",
            response: 'selected all nodes',
            action: networkActions.selectAll,
            ...getCommandConfig({key: "a", modifier: MODIFIERS.CTRL, command: "select all", result: "select all"})
        },
        deselect: {
            hint_settings: hintSettingsDefault,
            title: "Clear all selections",
            response: 'cleared selections',
            action: networkActions.deselectAll,
            ...getCommandConfig({key: "d", modifier: MODIFIERS.CTRL, command: "deselect all", result: "deselect all"})
        },
        compute_centralities: {
            hint_settings: hintSettingsDefault,
            title: "Compute node centralities",
            response: 'here is a heat map of each node centrality',
            action:  networkActions.computeCentralities,
            ...getCommandConfig({key: "t", command: "compute centralities", result: "compute centralities"})
        },
        compute_shortest_path: {
            hint_settings: hintSettingsDefault,
            title: "Compute shortest path",
            response: 'I found the shortest path between the two nodes',
            action: networkActions.computeShortestPathBetweenSelected,
            ...getCommandConfig({key: 'p', modifier: MODIFIERS.CTRL, command: 'shortest path', result: 'find shortest path'})
        },
        open_upload: {
            hint_settings: hintSettingsDefault,
            title: "Upload a network",
            response: "Drag in a file or browse in order to upload a network",
            action: () => modeActions.openModal('file_upload'),
            ...getCommandConfig({key: "o", modifier: MODIFIERS.CTRL, command: "upload", result: "upload a network (file ending in .nbn.txt)"})
        },
        download_network: {
            hint_settings: hintSettingsDefault,
            title: "Download your network",
            response: "Downloading your network",
            action: modeActions.downloadNetwork,
            ...getCommandConfig({key: "s", modifier: MODIFIERS.CTRL, command: "download", result: "download your network"})
        },
        label: {
            hint_settings: hintSettingsDefault,
            title: "Label selected node",
            response: "Labelled node",
            action: networkActions.startLabellingSelected,
            ...getCommandConfig({key: 'l', modifier: MODIFIERS.CTRL, command: 'label', result: 'label the selected node'})
        },
        zoom_in: {
            hint_settings: hintSettingsDefault,
            title: "Zoom in",
            action: networkActions.zoomIn,
            ...getCommandConfig({key: '=', modifier: MODIFIERS.CTRL, command: 'zoom in', result: 'zoom in'})
        },
        zoom_out: {
            hint_settings: hintSettingsDefault,
            title: "Zoom out",
            action: networkActions.zoomOut,
            ...getCommandConfig({key: '-', modifier: MODIFIERS.CTRL, command: 'zoom out', result: 'zoom out'})
        }
    }
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