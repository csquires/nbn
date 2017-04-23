import {combineReducers} from 'redux';
import shapesReducer from './reducers/shapesReducer';
import modeReducer from './reducers/modeReducer';
import undoable from 'redux-undo-immutable';

const reducer = combineReducers({
    shapes: undoable(shapesReducer),
    modeReducer
});

export default reducer;