import React, { Component } from 'react';
import MindMap from 'react-mindmap';
const map = require('./parsed-map/python.json');

class App extends Component {
  render() {

    return (
      <MindMap
        nodes={map.nodes}
        subnodes={map.subnodes}
        connections={map.connections}
        editable={true}
      />
    );
  }
}
export default App;
