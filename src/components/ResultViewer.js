import React, {Component} from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import JSONTree from 'react-json-tree'
import Loader from 'react-loader';
import { connect } from 'react-redux';

class ResultViewer extends Component {
  onCopy = () => {
    alert('JSON result has been copied to clipboard');
  }
  render() {
    const {result, copied, loading} = this.props;
    return (
      <div>
        {result ?
          <JSONTree
            data={result}
            style={{height: '100vh'}}
            shouldExpandNode={(keyName, data, level) => true}
            valueRenderer={raw => {
              if (!raw.length) return raw;
              if (raw.indexOf('.jpg') != -1 || raw.indexOf('.png') != -1) {
                return (
                  <span>
                    <span>{raw}</span>
                    <div><img src={`${raw.replace('"', '')}`} /></div>
                  </span>
                )
              }
              return raw;
            }}
            />
            : null}
        <CopyToClipboard text={JSON.stringify(result)}
          onCopy={this.onCopy}>
          <a href="#" style={styles.clipButton}>🗂️ COPY</a>
        </CopyToClipboard>
        {copied ? <span style={{color: 'red'}}>Copied.</span> : null}
        {loading ?
          <div style={styles.loaderWrapper}>
            <Loader />
          </div>
          : null}
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
  loaderWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default connect(state => ({
  loading: state.app.loading,
}))(ResultViewer);
