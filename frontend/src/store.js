/* global __DEVELOPMENT__, __CLIENT__, __DEVTOOLS__ */
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createMiddleware from './clientMiddleware';

export default function(client, data) {
  const middleware = createMiddleware(client);
  let finalCreateStore;
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { devTools, persistState } = require('redux-devtools');
    finalCreateStore = compose(
      applyMiddleware(middleware),
      devTools(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
      createStore
    );
  } else {
    finalCreateStore = applyMiddleware(middleware)(createStore);
  }

  const reducer = combineReducers(require('./sagas/reducers'));
  const store = finalCreateStore(reducer, data);
  store.client = client;

  if (module.hot) {
    module.hot.accept('./sagas/reducers', () => {
      const nextReducer = combineReducers(require('./sagas/reducers'));
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
