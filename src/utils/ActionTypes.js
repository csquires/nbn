const ActionTypes = {
    CIRCLE: {
        ADD: 'CIRCLE/ADD',
        DELETE: 'CIRCLE/DELETE'
    },
    CONNECTION: {
        ADD: 'CONNECTION/ADD',
        DELETE: 'CONNECTION/DELETE'
    },
    BOX: {
        ADD: 'BOX/ADD',
        DELETE: 'BOX/DELETE'
    },
    CLEAR: 'CLEAR',
    SELECTION: {
        SET: 'SELECTION/SET'
    },
    SHAPES: {
        CHANGE_SELECTION: 'SHAPES/CHANGE_SELECTION',
        DELETE_SELECTED: 'SHAPES/DELETE_SELECTED',
        CONNECT_SELECTED: 'SHAPES/CONNECT_SELECTED',
        DESELECT_ALL: 'SHAPES/DESELECT_ALL',
        SELECT_ALL: 'SHAPES/SELECT_ALL'
    },
    NETWORK: {
        COMPUTE_CENTRALITIES: 'NETWORK/COMPUTE_CENTRALITIES'
    },
    HINT_SETTINGS: {
        SET: 'HINT_SETTINGS/SET'
    },
    UNDO: 'UNDO'
};

export default ActionTypes;