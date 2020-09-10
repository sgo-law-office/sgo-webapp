import { applyMiddleware, createStore, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import appReducer from './reducers';
import * as actions from './actions';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const loggerMiddleware = createLogger({ collapse: true });
const store = createStore(
  appReducer,
  composeEnhancers(
    applyMiddleware(loggerMiddleware, thunkMiddleware))
);

export { actions, store };