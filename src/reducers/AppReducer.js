const data = require('../parsed-map/data.json');

let initialData = window.INITIAL_DATA && JSON.parse(window.INITIAL_DATA);

if (!initialData) initialData = data;

const initialState = {
  connections: initialData.connections,
  nodes: initialData.nodes,
  subnodes: initialData.subnodes,
  editable: false,
  activeNode: null,
  loading: false,
}

const reducer = (state = initialState, action) => {
  const {data} = action;
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: data,
      };
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
        }).map(connection => {
          return {
            ...connection,
            source: connection.source.text,
            target: connection.target.text,
          };
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
          {
            ...data.node,
            parent: data.source.text
          },
        ] : state.subnodes,
        connections: data.type == 'node' ? [
          ...state.connections,
          {
            source: data.node.text,
            target: data.source.text,
            curve: {
              x: null,
              y: null,
            },
          }
        ] : state.connections.map(connection => {
          return {
            ...connection,
            source: connection.source.text,
            target: connection.target.text,
          };
        }),
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
        nodes: state.nodes.map(node => {
          if (node.text == data) return {...node, active: true};
          return {...node, active: false};
        }),
        subnodes: state.subnodes.map(subnode => {
          if (subnode.text == data) return {...subnode, active: true};
          return {...subnode, active: false};
        }),
        activeNode: node,
        connections: state.connections.map(connection => {
          return {
            ...connection,
            source: connection.source.text,
            target: connection.target.text,
          };
        }),
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
        connections: state.connections.map(connection => {
          return {
            ...connection,
            source: (connection.source.text == data.source) ? node.text : connection.source.text,
            target: (connection.target.text == data.source) ? node.text : connection.target.text,
          };
        }),
      }
    }
    default:
      return state
  }
}

export default reducer;
