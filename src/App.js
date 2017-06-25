import React, { Component } from 'react';
import MindMap from './react-mindmap';
import { connect } from 'react-redux';
import SplitterLayout from 'react-splitter-layout';
import JSONTree from 'react-json-tree'
import axios from 'axios';
import CopyToClipboard from 'react-copy-to-clipboard';
import Slider from 'react-slick';

class App extends Component {
  state = {
    title: '',
    selector: '',
    isAddChild: false,
    result: null,
    copied: false,
    childType: 'node',
    onboarding: true,
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.activeNode != nextProps.activeNode) {
      if (!nextProps.activeNode) return;
      this.setState({title: nextProps.activeNode.text, selector: nextProps.activeNode.selector});
    }
  }
  onBuild = () => {
    // console.log(this.onBuildQuery());
    axios({
      method: 'post',
      url: '/graphql',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: {
        query: this.onBuildQuery(),
      },
    }).then(({data}) => {
      this.setState({
        result: data,
      });
    }).catch(e => console.log(e));
  }
  onBuildQuery() {
    const {nodes, subnodes, connections} = this.props;
    const rootParent = nodes.filter(node => node.category == 'wiki')[0];

    return (`
      {
        page(url: "${rootParent.selector}") {
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
        if (activeNode.selector == 'next' || activeNode.selector == 'prev' ) {
          return `
            ${activeNode.text}: ${activeNode.selector} {
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
  onAddChild = () => {
    this.setState({
      isAddChild: true,
      title: '',
      selector: '',
    });
  }
  onBack = () => {
    this.setState({
      isAddChild: false,
      title: this.props.activeNode.text,
      selector: this.props.activeNode.selector,
    });
  }
  onSaveChild = () => {
    const {title, selector} = this.state;
    this.props.dispatch({ type: 'ADD_NODE', data: {
      type: this.state.childType,
      node: {
        text: title,
        selector: selector,
        url: "",
        fx: null,
        fy: null,
      },
      source: {
        text: this.props.activeNode.text,
      },
    }});
    this.setState({
      isAddChild: false,
      title: this.props.activeNode.text,
      selector: this.props.activeNode.selector,
    });
  }
  onStart = () => {
    this.setState({
      onboarding: false,
    });
  }
  render() {
    const {activeNode, editable} = this.props;
    const {title, selector, result, isAddChild, onboarding} = this.state;
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
    };

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
                <div style={{backgroundColor: '#fff', minHeight: '100vh'}}>
                  <div style={styles.rowToolbar}>
                    <a href="#" style={{...styles.editButton, ...(editable ? {backgroundColor: '#4b90f7', color: '#fff'} : {})}} onClick={() => {
                      this.props.dispatch({
                        type: 'TOGGLE_EDITABLE',
                      });
                    }}>{editable ? '🔐' : '📝'}</a>
                    {isAddChild ?
                      <a href="#" style={styles.editButton} onClick={this.onBack}>⬅️</a>
                      : null}
                    <div style={styles.toolbar}>
                      {isAddChild ?
                        'Add Child'
                        : activeNode ? 'Edit Node' : ''}
                    </div>
                  </div>
                  {isAddChild ?
                    <div style={{padding: 15}}>
                      <div style={styles.inputWrap}>
                        <div style={{...styles.label, paddingTop: 5}}>type</div>
                        <div style={{flex: 1}}>
                          <a href="#" onClick={() => this.setState({childType: 'node'})} style={this.state.childType == 'node' ? styles.badgeActive : styles.badge}>node</a>
                          <a href="#" onClick={() => this.setState({childType: 'subnode'})} style={this.state.childType == 'subnode' ? styles.badgeActive : styles.badge}>subnode</a>
                        </div>
                      </div>
                      <div style={styles.inputWrap}>
                        <div style={styles.label}>title</div>
                        <input style={styles.input} type="text" value={title} onChange={(e) => {this.setState({title: e.target.value})}}></input>
                      </div>
                      <div style={styles.inputWrap}>
                        <div style={styles.label}>selector</div>
                        <input style={styles.input} type="text" value={selector} onChange={(e) => {this.setState({selector: e.target.value})}}></input>
                      </div>
                    </div>
                    :
                    (activeNode ?
                      <div style={{padding: 20}}>
                        <div style={styles.inputWrap}>
                          <div style={styles.label}>title</div>
                          <input style={styles.input} type="text" value={title} onChange={(e) => {this.setState({title: e.target.value})}}></input>
                        </div>
                        <div style={styles.inputWrap}>
                          <div style={styles.label}>selector</div>
                          <input style={styles.input} type="text" value={selector} onChange={(e) => {this.setState({selector: e.target.value})}}></input>
                        </div>
                      </div>
                      : <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: 180}}>Please select a node...</div>)}
                  </div>
                {!isAddChild && activeNode ?
                  <div style={styles.rowAction}>
                    <a href="#" style={styles.secondaryButton} onClick={this.onSave}>💾 SAVE</a>
                    <a href="#" style={styles.secondaryButton} onClick={this.onAddChild}>👶 ADD CHILD</a>
                    {activeNode && activeNode.category != 'wiki' ?
                      <a href="#" style={styles.secondaryButton} onClick={this.onDelete}>❌ DELETE</a>
                      : null}
                  </div>
                  : null}
                {isAddChild ?
                  <div style={styles.rowAction}>
                    <a href="#" style={styles.secondaryButton} onClick={this.onSaveChild}>💾 SAVE CHILD</a>
                  </div>
                  : null}
                <a href="#" onClick={this.onBuild} style={styles.buttonPrimary}>🕵️ SCRAPE</a>
              </div>
              <div  style={{backgroundColor: 'rgb(0, 43, 54)', minHeight: '100vh'}}>
                {result ?
                  <JSONTree
                    data={result}
                    style={{height: '100vh'}}
                    shouldExpandNode={(keyName, data, level) => true}
                    />
                    : null}
                <CopyToClipboard text={JSON.stringify(result)}
                  onCopy={() => this.setState({copied: true})}>
                  <a href="#" style={styles.clipButton}>🗂️ COPY</a>
                </CopyToClipboard>
                {this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
              </div>
            </SplitterLayout>
          </div>
        </SplitterLayout>
        {onboarding ?
          <div style={styles.onboarding}>
            <div style={styles.white}></div>
            <div style={styles.screenshot}></div>
            <div style={styles.sliderWrapper}>
              <Slider {...settings}>
                <div>
                  <h3>Mind Map</h3>
                  <p>Arrange the things that you want to scrape visually using mind map</p>
                </div>
                <div>
                  <h3>Node Editor</h3>
                  <p>Edit the title and selector of the node easily within the web</p>
                </div>
                <div>
                  <h3>Export To JSON</h3>
                  <p>Easily browse and export the scraping result to JSON</p>
                </div>
              </Slider>
            </div>
            <a href="#" style={styles.startButton} onClick={this.onStart}>🏃 START</a>
          </div>
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
  buttonPrimary: {
    backgroundColor: '#4b90f7',
    padding: '20px 60px',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 25,
    textAlign: 'center',
    fontWeight: '900',
    textDecoration: 'none',
    color: '#fff',
  },
  logo: {
    background: 'url("/images/logo.png") no-repeat',
    width: 300,
    height: 60,
    margin: '20px 0 0 20px',
    backgroundSize: 'contain',
  },
  rowAction: {
    display: 'flex',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60,
    flexDirection: 'row',
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    padding: '20px 30px',
    height: 25,
    textAlign: 'center',
    fontWeight: '900',
    textDecoration: 'none',
    color: '#4b90f7',
  },
  editButton: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    padding: '20px',
    height: 25,
    width: 25,
    textAlign: 'center',
    fontWeight: '900',
    textDecoration: 'none',
    color: '#4b90f7',
    display: 'block',
  },
  clipButton: {
    backgroundColor: 'rgba(255,255,255,.3)',
    border: '1px solid #ddd',
    padding: '10px',
    height: 20,
    width: 120,
    borderRadius: 5,
    textAlign: 'center',
    fontWeight: '900',
    textDecoration: 'none',
    color: '#fff',
    display: 'block',
    position: 'fixed',
    right: 10,
    bottom: 10,
    fontSize: '12px',
  },
  rowToolbar: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  toolbar: {
    flex: 1,
    height: 25,
    padding: '20px',
    border: '1px solid #ddd',
  },
  inputWrap: {
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  label: {
    width: 60,
    paddingTop: 10,
    paddingRight: 10,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    padding: '10px 5px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  badgeActive: {
    backgroundColor: '#4b90f7',
    color: '#fff',
    borderRadius: 5,
    padding: '5px 10px',
    margin: '0 5px 10px 0',
    fontSize: '12px',
    textDecoration: 'none',
  },
  badge: {
    backgroundColor: '#fff',
    border: '1px solid #4b90f7',
    borderRadius: 5,
    padding: '5px 10px',
    margin: '0 5px 10px 0',
    fontSize: '12px',
    textDecoration: 'none',
  },
  onboarding: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(75,144,247,.8)',
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    flexDirection: 'column',
  },
  screenshot: {
    background: 'url("/images/screenshot.png") no-repeat',
    width: 400,
    height: 300,
    margin: '20px',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    zIndex: 1,
  },
  white: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 400,
    backgroundColor: 'rgba(255,255,255,.9)',
    zIndex: 0,
  },
  sliderWrapper: {
    width: 320,
  },
  startButton: {
    backgroundColor: '#4b90f7',
    padding: '20px 60px',
    width: 100,
    height: 25,
    borderRadius: 50,
    textAlign: 'center',
    fontWeight: '900',
    textDecoration: 'none',
    color: '#fff',
    zIndex: 2,
  },
};

export default connect(state => ({
  connections: state.connections,
  nodes: state.nodes,
  subnodes: state.subnodes,
  editable: state.editable,
  activeNode: state.activeNode,
}))(App);
