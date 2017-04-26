import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducer';
import './styles/index.css';

const createStoreWithMiddleWare = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleWare(reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
    <Provider store={store} >
        <App />
    </Provider>,
  document.getElementById('root')
);
