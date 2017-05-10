// external
import _ from 'lodash';
import * as config from '../config';
import { MODIFIERS } from '../utils/Constants';

export const listenFor = (commands) => ({transcript, resetTranscript}) => {
    for (const command of commands) {
        if (transcript.toLowerCase().includes(command.command)) {
            command.action();
            resetTranscript();
            break;
        }
    }
};


const closeMatchMap = {
    'yo alex': ['no alex', 'young alex', 'your alex', "you're alex"],
    'delete': ['three'],
    'connect': ['max', 'maps', 'black']
};

export const includesCloseMatch = (transcript, speechToFind) => {
    if (transcript.includes(speechToFind)) return true;
    const matches = closeMatchMap[speechToFind];
    const someMatched = matches && matches.some((m) => transcript.includes(m));
    return someMatched;
};

// const mapTouches = (touches, f) => {
//     const numTouches = touches.length;
//     let res = {};
//     _.range(numTouches).forEach((i) => {
//         res[i] = f(touches[i])
//     });
//     return res;
// };
export const eachTouch = (touches, f) => {
    const numTouches = touches.length;
    _.range(numTouches).forEach((i) => {
        f(touches[i], i);
    });
};
export const shapeMatches = (maybeShape, {shape, key}) => maybeShape && maybeShape.shape === shape && maybeShape.key === key;
export const getMovementInfo = (mouse, touches, {shape, key}) => {
    const didMouseIntersect = shapeMatches(mouse.get('intersectedShape'), {shape, key});
    const isMovement = !config.SHOULD_CONNECT({mouse});
    if (didMouseIntersect && isMovement) return {
        cx: mouse.get('moveX'),
        cy: mouse.get('moveY'),
        isMoving: true
    };
    // console.log('touches', touches.toJS());
    const matchingTouch = touches.find((touch) => shapeMatches(touch.get('intersectedShape'), {shape, key}));
    if (matchingTouch) {
        const isMovementTouch = !config.SHOULD_CONNECT({touch: matchingTouch});
        if (isMovementTouch) return {
            cx: matchingTouch.get('moveX'),
            cy: matchingTouch.get('moveY'),
            isMoving: true
        };
    }
    return null;
};
export const getNodeMovementInfo = (mouse, touches, key, node) => {
    const movingCoordinates = getMovementInfo(mouse, touches, {shape: 'node', key: key});
    if (movingCoordinates) return movingCoordinates;
    // look up the node if it isn't provided
    return {
        cx: node.get('cx'),
        cy: node.get('cy'),
        isMoving: false
    }
};
export const dist = (x1, y1, x2, y2) => Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));

export const hasModifier = (e, command) => {
    const modifier = command.get('modifier');
    const altMatches = modifier.get(MODIFIERS.ALT) === e.altKey;
    const ctrlMatches = modifier.get(MODIFIERS.CTRL) === e.ctrlKey;
    const shiftMatches = modifier.get(MODIFIERS.SHIFT) === e.shiftKey;
    return altMatches && ctrlMatches && shiftMatches;
};