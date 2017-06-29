import { createStore } from 'redux'
import reducer from '../reducers/AppReducer';
import { combineReducers } from 'redux';
// import {applyMiddleware, compose} from 'redux';

// import ApolloClient, { createNetworkInterface } from 'apollo-client'
//
// const networkInterface = createNetworkInterface({ uri: 'https://api.graph.cool/simple/v1/cj4i1ifeamv640130f4nkogb0' });

// export const client = new ApolloClient({ networkInterface });

// const middlewares = [
//   client.middleware(),
// ];
// const enhancers = [
//   applyMiddleware(...middlewares)
// ]

window.store = createStore(
  combineReducers({
    app: reducer,
    // apollo: client.reducer(),
  }),
  // compose(...enhancers),
);

window.store.subscribe(() => {
  const state = window.store.getState().app;
  console.log({
    nodes: state.nodes,
    subnodes: state.subnodes,
    connections: state.connections,
  });
})

export default window.store;
