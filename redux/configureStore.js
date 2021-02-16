import { createStore, compose, applyMiddleware } from 'redux';

import reducers from './reducers';
// import initialState from './initialState';
import thunkMiddleware from 'redux-thunk';


const store = createStore(reducers,
  compose(
    // window.devToolsExtension ? window.devToolsExtension() : f => f,
    applyMiddleware(thunkMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ));

export default store;