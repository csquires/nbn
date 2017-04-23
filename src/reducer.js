import {combineReducers} from 'redux';
import shapesReducer from './reducers/shapesReducer';
import modeReducer from './reducers/modeReducer';
import {reducer as notifications} from 'react-notification-system-redux';

const reducer = combineReducers({
    shapes: shapesReducer,
    modeReducer: modeReducer,
    notifications
});

export default reducer;