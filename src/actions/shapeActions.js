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