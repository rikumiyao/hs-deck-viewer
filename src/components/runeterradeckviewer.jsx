import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { decodeDeck } from '../lordeckutils.js';
import RuneterraDeck from './runeterradeck';

class RuneterraDeckViewer extends Component {

  state = {
    deck : null,
    code : '',
    isValid : false,
    copied: false
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const arr = pathname.split('/');
    const code = decodeURIComponent(arr[2]);
    const response = decodeDeck(code);
    if (response['success']) {
      this.setState({
        deck: response['deck'],
        code: code,
        isValid: true
      })
    }
  }

  renderURL() {
    const url = `https://www.yaytears.com/runeterra/${encodeURIComponent(this.state.code)}`;
    return (
      <div className='row'>
        <div className='col-1'>
          <CopyToClipboard className='m-2 btn btn-primary' text={url}
            onCopy={() => this.setState({copied: true})}>
            <button>Copy</button>
          </CopyToClipboard>
        {this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
        </div>
        <div className='col-10'>
          <input type="text" className="form-control m-2" id={'listexport'} value={url} readOnly />
        </div>
      </div>
    );
  }


  render() {
    return (
      <div className='container mt-2'>
        {this.props.history.location.state && this.props.history.location.state.created ? 
          <div className='alert alert-success' role='alert'>
            <strong>Success!</strong>
          </div> : ''
        }
        <Link className="btn btn-primary" role="button" to={`/runeterra`}>Create More Decks</Link>
        {this.state.isValid ? this.renderURL() : ''}
        <div className='container'>
          <div className='row'>
            <RuneterraDeck deck={this.state.deck} code={this.state.code}></RuneterraDeck>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(RuneterraDeckViewer);