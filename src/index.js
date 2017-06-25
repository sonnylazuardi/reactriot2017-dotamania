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
  activeNode: null,
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
    case 'SELECT_NODE': {
      if (!data) return {...state, activeNode: null};
      let node = state.nodes.filter(node => node.text == data)[0];
      if (!node) {
        node = state.subnodes.filter(subnode => subnode.text == data)[0];
      }
      console.log('ACTIVE NODE', node);
      return {
        ...state,
        activeNode: node,
      }
    }
    case 'EDIT_NODE': {
      let type = 'node';
      let node = state.nodes.filter(node => node.text == data.source)[0];
      if (!node) {
        type = 'subnode';
        node = state.subnodes.filter(subnode => subnode.text == data.source)[0];
      }
      node = {...node, ...data.node};
      return {
        ...state,
        nodes: type == 'node' ? state.nodes.map(node => {
          if (node.text == data.source) return {...node, ...data.node};
          return node;
        }) : state.nodes,
        subnodes: type == 'subnode' ? state.subnodes.map(subnode => {
          if (subnode.text == data.source) return {...subnode, ...data.node};
          return subnode;
        }) : state.subnodes,
        activeNode: node,
      }
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
