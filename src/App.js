import React, { Component } from 'react';
import MindMap from './react-mindmap';
import { connect } from 'react-redux';
import SplitterLayout from 'react-splitter-layout';

import Onboarding from './components/Onboarding';
import NodeEditor from './components/NodeEditor';
import ResultViewer from './components/ResultViewer';

class App extends Component {
  state = {
    result: null,
    onboarding: true,
  }
  onStart = () => {
    this.setState({
      onboarding: false,
    });
  }
  setResult = (data) => {
    this.setState({
      result: data,
    });
  }
  render() {
    const {activeNode, editable} = this.props;
    const {result, onboarding} = this.state;

    return (
      <div style={styles.container}>
        <SplitterLayout>
          <div>
            <div style={styles.logo} />
            <MindMap
              connections={this.props.connections}
              nodes={this.props.nodes}
              subnodes={this.props.subnodes}
              editable={this.props.editable}
            />
          </div>
          <div>
            <SplitterLayout vertical secondaryInitialSize={480}>
              <div style={{overflowY: 'hidden'}}>
                <NodeEditor setResult={this.setResult} />
              </div>
              <div  style={{backgroundColor: 'rgb(0, 43, 54)', minHeight: '100vh'}}>
                <ResultViewer result={result} copied={this.state.copied}/>
              </div>
            </SplitterLayout>
          </div>
        </SplitterLayout>
        {onboarding ?
          <Onboarding onStart={this.onStart}/>
          : null}
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    fontFamily: 'Raleway',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  column: {
    flex: 1,
  },
  logo: {
    background: 'url("/images/logo.png") no-repeat',
    width: 300,
    height: 60,
    margin: '20px 0 0 20px',
    backgroundSize: 'contain',
  },
};

export default connect(state => ({
  connections: state.app.connections,
  nodes: state.app.nodes,
  subnodes: state.app.subnodes,
  editable: state.app.editable,
  activeNode: state.app.activeNode,
}))(App);
