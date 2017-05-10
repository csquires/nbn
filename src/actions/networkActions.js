// constants
import ActionTypes from '../utils/ActionTypes';
import * as networkReducer from '../reducers/networkReducer';


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

export const startLabellingNode = (key) => {
    return {
        type: ActionTypes.NODE.BEGIN_LABEL,
        payload: {
            key: key
        }
    }
};

export const startLabellingSelected = () => {
    return (dispatch, getState) => {
        const currentShapes = getState().shapes.get('present');
        const selectedNodes = currentShapes.get('nodes').filter(networkReducer.isSelected);
        const selectedInteractions = currentShapes.get('interactions').filter(networkReducer.isSelected);
        const numSelected = selectedNodes.size + selectedInteractions.size;
        if (numSelected !== 1) {
            // error
        } else {
            console.log('selected nodes', selectedNodes);
            const maybeSelectedNodeKey = selectedNodes.keySeq().first();
            // const maybeSelectedInteractionKey = selectedInteractions.keySeq().first();
            if (maybeSelectedNodeKey) dispatch(startLabellingNode(maybeSelectedNodeKey));
            // if (maybeSelectedInteractionKey) {};
        }
    }
};

export const labelNode = (key, label) => {
    return (dispatch, getState) => {
        // const nodes = getState().shapes.getIn(['present', 'nodes']);
        console.log('labelling node');
        // const labelAlreadyExists = nodes.some((node) => node.get('label') === label);
        dispatch({
            type: ActionTypes.NODE.LABEL,
            payload: {
                key: key,
                label: label
            }
        })
    }
};

export const zoomIn = () => {
    return {
        type: ActionTypes.NETWORK.ZOOM_IN,
    }
};

export const zoomOut = () => {
    return {
        type: ActionTypes.NETWORK.ZOOM_OUT,
    }
};