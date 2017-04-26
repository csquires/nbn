// constants
import ActionTypes from '../utils/ActionTypes';


export const addNode = (cx, cy) => {
    return {
        type: ActionTypes.NODE.ADD,
        payload: {
            cx: cx,
            cy: cy
        }
    }
};

export const addConnection = (source, target, isDirected=false) => {
    return {
        type: ActionTypes.CONNECTION.ADD,
        payload: {
            source: source,
            target: target,
            is_directed: isDirected
        }
    }
};

export const addInteraction = (cx, cy) => {
    return {
        type: ActionTypes.INTERACTION.ADD,
        payload: {
            cx: cx,
            cy: cy
        }
    }
};

export const undo = () => {
    return {
        type: ActionTypes.UNDO
    }
};

export const changeShapeSelection = ({shape, key}) => {
    return {
        type: ActionTypes.NETWORK.CHANGE_SELECTION,
        payload: {
            shape: shape,
            key: key
        }
    }
};

export const deleteSelectedShapes = () => {
    return {
        type: ActionTypes.NETWORK.DELETE_SELECTED,
    }
};

export const connectSelected = () => {
    return {
        type: ActionTypes.NETWORK.CONNECT_SELECTED,
    }
};

export const selectAll = () => {
    return {
        type: ActionTypes.NETWORK.SELECT_ALL
    }
};

export const deselectAll = () => {
    return {
        type: ActionTypes.NETWORK.DESELECT_ALL
    }
};

export const computeCentralities = () => {
    return {
        type: ActionTypes.NETWORK.COMPUTE_CENTRALITIES
    }
};

export const setNetwork = (networkJson) => {
    return {
        type: ActionTypes.NETWORK.SET,
        payload: {
            network_json: networkJson
        }
    }
};

export const moveNode = (key, cx, cy) => {
    return {
        type: ActionTypes.NODE.MOVE,
        payload: {
            key: key,
            cx: cx,
            cy: cy
        }
    }
};