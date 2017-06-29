import React, {Component} from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import JSONTree from 'react-json-tree'

class ResultViewer extends Component {
  static defaultProps = {
    onCopy: () => {}
  }
  render() {
    const {result, copied} = this.props;
    return (
      <div>
        {result ?
          <JSONTree
            data={result}
            style={{height: '100vh'}}
            shouldExpandNode={(keyName, data, level) => true}
            />
            : null}
        <CopyToClipboard text={JSON.stringify(result)}
          onCopy={() => this.props.onCopy()}>
          <a href="#" style={styles.clipButton}>🗂️ COPY</a>
        </CopyToClipboard>
        {copied ? <span style={{color: 'red'}}>Copied.</span> : null}
      </div>
    );
  }
}

const styles = {
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
};

export default ResultViewer;
