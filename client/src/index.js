import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import reducer from './reducers'
import { getAllProducts } from './actions'
import App from './containers/App'
import analytics from 'redux-analytics';
import track from './libs/track';

// const middleware = analytics(({ type, payload }) => track(type, payload, 'react-redux'));
// const reduxanalytics = () => { analytics(({ type, payload }) => track(type, payload, 'react-redux')) };
// function reduxanalytics() {
//   return dispatch => {
//     return analytics(({ type, payload }) => track(type, payload, 'react-redux'));
//   }
// }

const middleware = [ thunk, analytics(({ type, payload }) => track(type, payload, 'react-redux')) ];

if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger());
}

const store = createStore(
  reducer,
  applyMiddleware(...middleware)
)

store.dispatch(getAllProducts())

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
