import React, { Component } from 'react';
import { withRouter } from "react-router";

import { validateDecks, findDeckCode, cardDiff, condenseDeckstring } from '../deckutils.js';
import DeckForm from './deckform';
import DocumentTitle from 'react-document-title';

class DeckPanel extends Component {

  state = {
    decks : [],
    errors : [],
    numDecks: 4,
    mode: ""
  }

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.updateState()
    }
  }

  componentDidMount() {
    this.updateState()
  }

  updateState() {
    const pathname = this.props.location.pathname;
    const arr = pathname.split('/');
    const mode = arr[1] ? arr[1].toLowerCase() : 'conquest';
    this.setState({
      mode,
      numDecks: mode==='conquest' ? 4 : 3
    });
  }

  handleSubmit(codes, format) {
    codes = codes.map(code => findDeckCode(code, false));
    if (codes.length===4 && codes[3]==='') {
      codes = codes.slice(0,3)
    }
    const result = validateDecks(codes, this.state.mode, format);
    if (!result['success']) {
      this.setState({
        errors: result['errors'],
      });
    } else {
      const decks = result['decks'];
      const errors = Array(this.state.numDecks).fill('');
      let success = true;
      if (this.props.mode==='specialist') {
        const diffs1 = cardDiff(decks[0],decks[1]);
        const diffs2 = cardDiff(decks[0], decks[2]);
        if (diffs1 > 5) {
          errors[1] = `Invalid number of swaps: ${diffs1}`;
          success = false;
        }
        if (diffs2 > 5) {
          errors[2] = `Invalid number of swaps: ${diffs2}`;
          success = false;
        }
      }
      if (success) {
        this.props.history.push(this.decksToURL(decks, this.state.mode), {created: true});
      } else {
        this.setState({
          errors: errors
        });
      }
    }
  }

  decksToURL(decks, mode) {
    return `/${mode}/${encodeURIComponent(condenseDeckstring(decks, mode))}`;
  }

  render() {
    if (!this.state.mode) {
      return "";
    }
    return (
      <DocumentTitle title={`${capitalize(this.state.mode)} Decks`}>
        <div className="container mt-2">
          <h2>{`Create Hearthstone ${capitalize(this.state.mode)} Lineups`}</h2>
          <DeckForm mode={this.state.mode} onSubmit={this.handleSubmit} numDecks={this.state.numDecks} errors={this.state.errors}></DeckForm>
        </div>
      </DocumentTitle>
    );
  }
}

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

export default withRouter(DeckPanel);