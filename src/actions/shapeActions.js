// constants
import ActionTypes from '../utils/ActionTypes';


export const addCircle = (cx, cy) => {
    return {
        type: ActionTypes.CIRCLE.ADD,
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

export const addBox = (cx, cy) => {
    return {
        type: ActionTypes.BOX.ADD,
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
        type: ActionTypes.SHAPES.CHANGE_SELECTION,
        payload: {
            shape: shape,
            key: key
        }
    }
};

export const deleteSelectedShapes = () => {
    return {
        type: ActionTypes.SHAPES.DELETE_SELECTED,
    }
};

export const connectSelected = () => {
    return {
        type: ActionTypes.SHAPES.CONNECT_SELECTED,
    }
};

export const selectAll = () => {
    return {
        type: ActionTypes.SHAPES.SELECT_ALL
    }
};

export const deselectAll = () => {
    return {
        type: ActionTypes.SHAPES.DESELECT_ALL
    }
};

export const computeCentralities = () => {
    return {
        type: ActionTypes.NETWORK.COMPUTE_CENTRALITIES
    }
};
