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

export const addArrow = (source, target, isDirected=false) => {
    return {
        type: ActionTypes.ARROW.ADD,
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