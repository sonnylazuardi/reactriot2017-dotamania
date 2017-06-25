import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { createStore } from 'redux'
import { Provider } from 'react-redux'

const data = require('./parsed-map/data.json');

const initialState = {
  connections: data.connections,
  nodes: data.nodes,
  subnodes: data.subnodes,
  editable: false,
}

const reducer = (state = initialState, action) => {
  const {data} = action;
  switch (action.type) {
    case 'REMOVE_NODE':
      const result = {
        ...state,
        nodes: state.nodes.filter(node => {
          return node.text !== data;
        }),
        subnodes: state.subnodes.filter(subnode => {
          return subnode.parent !== data && subnode.text !== data;
        }),
        connections: state.connections.filter(connection => {
          return connection.source.text !== data && connection.target.text !== data;
        }),
      }
      return result;
    case 'ADD_NODE':
      return {
        ...state,
        nodes: data.type == 'node' ? [
          ...state.nodes,
          data.node,
        ] : state.nodes,
        subnodes: data.type == 'subnode' ? [
          ...state.subnodes,
          data.node,
        ] : state.subnodes,
        connections: [
          ...state.connections,
          {
            source: data.source.text,
            target: data.node.text,
            curve: {
              x: 0,
              y: 0,
            },
          }
        ],
      }
    case 'TOGGLE_EDITABLE':
      return {
        ...state,
        editable: !state.editable,
      }
    default:
      return state
  }
}

window.store = createStore(reducer);

window.store.subscribe(() => {
  console.log(window.store.getState());
})

ReactDOM.render((
  <Provider store={window.store}>
    <App />
  </Provider>
), document.getElementById('root'));
registerServiceWorker();
