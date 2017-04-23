const ActionTypes = {
    CIRCLE: {
        ADD: 'CIRCLE/ADD',
        DELETE: 'CIRCLE/DELETE'
    },
    ARROW: {
        ADD: 'ARROW/ADD',
        DELETE: 'ARROW/DELETE'
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
        DELETE_SELECTED: 'SHAPES/DELETE_SELECTED'
    },
    NOTIFICATION_SETTINGS: {
        SET: 'NOTIFICATION_SETTINGS/SET'
    },
    UNDO: 'UNDO'
};

export default ActionTypes;