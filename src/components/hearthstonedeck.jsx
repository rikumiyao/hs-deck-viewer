import React, { Component } from 'react';
import { withRouter } from 'react-router';

import { validateDecks, findDeckCode, fetchDeck } from '../deckutils.js';
import DocumentTitle from 'react-document-title';

class HearthstoneDeck extends Component {

  state = {
    deck : "",
    error : "",
    code: ""
  }

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(code) {
    code = findDeckCode(code, false);
    fetchDeck(code)
      .then((deck) => {
        if (!deck) {
          this.setState({
            error: "Invalid Deckstring",
          });
          return;
        }
        const result = validateDecks([deck]);
        if (!result['success']) {
          this.setState({
            error: result['errors'][0],
          });
        } else {
          this.props.history.push(this.deckCodeToURL(code), {created: true});
        }
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      });
  }

  handleChange(event) {
    const code = event.target.value;
    this.setState({code});
  }

  deckCodeToURL(code) {
    return `/deck/${encodeURIComponent(code)}`;
  }

  render() {
    return (
      <DocumentTitle title={`Hearthstone Deck Builder`}>
        <div className="container mt-2">
          <h2>{`Create Hearthstone Deck`}</h2>
          <div className='form-group' key='deck'>
            <label>Deck code</label>
            <input type="text" className="form-control" id={'deck'} onChange={this.handleChange} 
              placeholder={'Enter Deck Code'}/>
            {this.state.error ? <div style={{color:'red'}}>{this.state.error}</div> : null}
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => this.handleSubmit(this.state.code)}>
              View Deck
          </button>
        </div>
      </DocumentTitle>
    );
  }
}

export default withRouter(HearthstoneDeck);