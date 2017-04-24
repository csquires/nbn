const ActionTypes = {
    NODE: {
        ADD: 'NODE/ADD',
        DELETE: 'NODE/DELETE'
    },
    CONNECTION: {
        ADD: 'CONNECTION/ADD',
        DELETE: 'CONNECTION/DELETE'
    },
    INTERACTION: {
        ADD: 'INTERACTION/ADD',
        DELETE: 'INTERACTION/DELETE'
    },
    CLEAR: 'CLEAR',
    SELECTION: {
        SET: 'SELECTION/SET'
    },
    NETWORK: {
        CHANGE_SELECTION: 'NETWORK/CHANGE_SELECTION',
        DELETE_SELECTED: 'NETWORK/DELETE_SELECTED',
        CONNECT_SELECTED: 'NETWORK/CONNECT_SELECTED',
        DESELECT_ALL: 'NETWORK/DESELECT_ALL',
        SELECT_ALL: 'NETWORK/SELECT_ALL',
        COMPUTE_CENTRALITIES: 'NETWORK/COMPUTE_CENTRALITIES',
        SET: 'NETWORK/UPLOAD',
    },
    HINT_SETTINGS: {
        SET: 'HINT_SETTINGS/SET'
    },
    MODAL: {
        CLOSE: 'MODAL/CLOSE',
        OPEN: 'MODAL/OPEN'
    },
    UNDO: 'UNDO'
};

export default ActionTypes;