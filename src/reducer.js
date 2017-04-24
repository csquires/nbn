// external
import {combineReducers} from 'redux';
import {reducer as notifications} from 'react-notification-system-redux';
// my reducers
import shapesReducer from './reducers/networkReducer';
import modeReducer from './reducers/modeReducer';
import commandReducer from './reducers/commandReducer';


const reducer = combineReducers({
    shapes: shapesReducer,
    modeReducer: modeReducer,
    commandReducer,
    notifications
});

export default reducer;