import React, { Component } from 'react';
import MindMap from './react-mindmap';
import { connect } from 'react-redux';
import SplitterLayout from 'react-splitter-layout';
import JSONTree from 'react-json-tree'

const result = require('./parsed-map/result.json');

class App extends Component {
  state = {
    title: '',
    selector: '',
    addChild: false,
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.activeNode != nextProps.activeNode) {
      if (!nextProps.activeNode) return;
      this.setState({title: nextProps.activeNode.text, selector: nextProps.activeNode.selector});
    }
  }
  onBuild = () => {
    console.log(this.onBuildQuery());
  }
  onBuildQuery() {
    const {nodes, subnodes, connections} = this.props;
    const rootParent = nodes.filter(node => node.category == 'wiki')[0];

    return (`
      {
        page(url: "http://${rootParent.text}") {
          ${this.onSearchNode(rootParent)}
        }
      }
    `);
  }
  onSearchNode(rootParent) {
    const {nodes, subnodes, connections} = this.props;
    const children = connections.filter(connection => connection.target.text == rootParent.text);
    const hasChild = children.length;
    if (!hasChild) return '';
    return `
      ${children.map(connection => {
        const activeNode = connection.source;
        const activeSubnodes = subnodes.filter(subnode => subnode.parent == activeNode.text);
        const childrenQuery = `
          ${activeSubnodes.map(subnode => {
            if (subnode.selector.indexOf('|') != -1) {
              const splitter = subnode.selector.split('|');
              return `${subnode.text}: attr(selector:"${splitter[0]}", name:"${splitter[1]}")\n`;
            }
            return `${subnode.text}: text(selector: "${subnode.selector}")\n`;
          })}
          ${hasChild ? this.onSearchNode(activeNode) : null}
        `;
        if (activeNode.selector == 'next') {
          return `
            ${activeNode.text}: next {
              ${childrenQuery}
            }
          `;
        }
        return `
          ${activeNode.text}: query(selector: "${activeNode.selector}") {
            ${childrenQuery}
          }
        `;
      })}
    `
  }
  onSave = () => {
    const {title, selector} = this.state;
    this.props.dispatch({
      type: 'EDIT_NODE',
      data: {
        source: this.props.activeNode.text,
        node: {
          text: title,
          selector,
        },
      }
    })
  }
  onDelete = () => {
    this.props.dispatch({
      type: 'REMOVE_NODE',
      data: this.props.activeNode.text,
    });
    this.props.dispatch({
      type: 'SELECT_NODE',
      data: null,
    });
  }
  render() {
    const {activeNode} = this.props;
    const {title, selector} = this.state;
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
              <div style={{backgroundColor: '#fff', minHeight: '100vh'}} >
                <a href="#" onClick={() => {
                  this.props.dispatch({
                    type: 'TOGGLE_EDITABLE',
                  });
                }}>Toggle Edit</a>
                {activeNode ?
                  <div>
                    <div>
                      title: <input type="text" value={title} onChange={(e) => {this.setState({title: e.target.value})}}></input>
                    </div>
                    <div>
                      selector: <input type="text" value={selector} onChange={(e) => {this.setState({selector: e.target.value})}}></input>
                    </div>
                    <button onClick={this.onSave}>save</button>
                    <button onClick={this.onDelete}>delete</button>
                    <button onClick={this.onBuild}>build</button>
                  </div>
                  : <div>Please select a node</div>}
              </div>
              <div  style={{backgroundColor: 'rgb(0, 43, 54)', minHeight: '100vh'}}>
                <JSONTree
                  data={result}
                  style={{height: '100vh'}}
                  shouldExpandNode={(keyName, data, level) => true}
                  />
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
};

export default connect(state => ({
  connections: state.connections,
  nodes: state.nodes,
  subnodes: state.subnodes,
  editable: state.editable,
  activeNode: state.activeNode,
}))(App);
