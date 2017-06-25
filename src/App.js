import React, { Component } from 'react';
import MindMap from './react-mindmap';
import { connect } from 'react-redux';
import SplitterLayout from 'react-splitter-layout';

class App extends Component {
  render() {

    return (
      <div style={styles.container}>
        <SplitterLayout>
          <div>
            <MindMap
              connections={this.props.connections}
              nodes={this.props.nodes}
              subnodes={this.props.subnodes}
              editable={this.props.editable}
            />
          </div>
          <div>
            <SplitterLayout vertical secondaryInitialSize={600}>
              <div style={{backgroundColor: '#fff', height: '100vh'}} >
                tes
              </div>
              <div  style={{backgroundColor: '#fff', height: '100vh'}}>
                tes
              </div>
            </SplitterLayout>
          </div>
        </SplitterLayout>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  column: {
    flex: 1,
  },
};

export default connect(state => ({
  connections: state.connections,
  nodes: state.nodes,
  subnodes: state.subnodes,
  editable: state.editable,
}))(App);
