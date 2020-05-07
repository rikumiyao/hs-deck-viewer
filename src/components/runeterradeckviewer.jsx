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

  render() {
    return (
      <div className='container mt-2'>
        {this.props.history.location.state && this.props.history.location.state.created ? 
          <div className='alert alert-success' role='alert'>
            <strong>Success!</strong>
          </div> : ''
        }
        <Link className="btn btn-primary" role="button" to={`/runeterra`}>Create More Decks</Link>
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