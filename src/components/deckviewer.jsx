import _ from 'lodash';
import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { compareDecks, condenseDeckstring,
  fetchDeck, combine, validateDecks, isValidDeckstring } from '../deckutils.js';
import { encode } from "deckstrings";
import Deck from './deck';
import DeckOptions from './deckoptions';
import DeckDiff from './deckdiff';
import DocumentTitle from 'react-document-title';

class DeckViewer extends Component {

  constructor() {
    super();
    this.handleToggleDiff = this.handleToggleDiff.bind(this);
  }

  state = {
    decks : [],
    validDeck : [],
    isValid : false,
    isDiff: true,
    copied: false,
    mode: 'conquest'
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const arr = pathname.split('/');
    const mode = arr[1].toLowerCase();
    const code = decodeURIComponent(arr[2]);
    this.parseDecks(code, mode, result => {
      if (result['success']) {
        this.setState({
          mode,
          decks: result['decks'],
          isValid: true
        });
      }
    });
  }

  handleToggleDiff(isDiff) {
    this.setState({isDiff: isDiff});
  }

  decksToURL(decks, mode) {
    return `https://www.yaytears.com/${mode}/${encodeURIComponent(condenseDeckstring(decks, mode))}`;
  }

  renderURL() {
    const url = this.decksToURL(this.state.decks, this.state.mode);
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

  renderDecks(decks, mode) {
    let deckComponents;
    if (mode==='conquest' || mode==='deck') {
      deckComponents = decks.map((deck, i)=> {
        return (
          <div key={'Deck'+(i+1)} className='col-sm'>
            <Deck index={0} deck={deck}></Deck>
          </div>
        );
      });
    } else if (this.state.isDiff) {
      deckComponents = [];
      deckComponents.push((
        <div key={'Deck'+(1)} className='col-sm'>
          <Deck index={1} deck={decks[0]}></Deck>
        </div>
      ))
      deckComponents = deckComponents.concat(decks.slice(1).map((deck, i)=> {
        const diffs = compareDecks(decks[0],deck);
        return (
          <div key={'Diff'+(i+1)} className='col-sm'>
            <DeckDiff index={i+2} removed={diffs[0]} added={diffs[1]} deck={this.state.decks[i+1]}></DeckDiff>
          </div>
        );
      }));
    } else {
      deckComponents = this.state.decks.map((deck, i)=> {
        return (
          <div key={'Deck'+(i+1)} className='col-sm'>
            <Deck index={i+1} deck={deck}></Deck>
          </div>
        );
      });
    }
    return deckComponents;
  }

  createTitle(decks, mode) {
    const classes = _.uniq(decks.map(deck => _.capitalize(deck.class)));
    return `${classes.join('/')}: ${mode!=='deck' ? _.capitalize(mode): 'Hearthstone'} Decks`;
  }

  render() {
    return (
      <div className='container mt-2'>
        {this.props.history.location.state && this.props.history.location.state.created ? 
          <div className='alert alert-success' role='alert'>
            <strong>Success!</strong>
          </div> : ''
        }
        <Link className="btn btn-primary" role="button" to={`/${this.state.mode}`}>Create More Decks</Link>
        {this.state.isValid ? this.renderURL() : ''}
        {this.state.isValid && this.state.mode==='specialist' ? 
          <DeckOptions onToggleDiff={this.handleToggleDiff} 
            disabledText="Show Differences" enabledText="Hide Differences"></DeckOptions> : null}
        <DocumentTitle title={this.createTitle(this.state.decks, this.state.mode)}>
          <div className='container'>
            <div className='row'>
              {this.renderDecks(this.state.decks, this.state.mode)}
            </div>
          </div>
        </DocumentTitle>
      </div>
    );
  }

  parseDecks(code, mode, callback) {
    if (mode === 'deck') {
      return this.parseConquest([code], callback);
    }
    else {
      const deckcodes = code.split('.');
      if (mode === 'conquest') {
        this.parseConquest(deckcodes, callback);
      } else {
        this.parseSpecialist(deckcodes, callback);
      }
    }
  }

  parseConquest(deckcodes, callback) {
    Promise.all(deckcodes.map(fetchDeck))
      .then(decks => {
        const result = validateDecks(decks, 'conquest');
        callback(result);
      });
  }

  parseSpecialist(deckcodes, callback) {
    if (deckcodes.length !== 5) {
      callback({success: 'false', errors: ['Invalid url']});
    }
    const deck1 = isValidDeckstring(deckcodes[0]);
    const diffs1 = isValidDeckstring(deckcodes[0].substring(0,6)+deckcodes[1]);
    const diffs2 = isValidDeckstring(deckcodes[0].substring(0,6)+deckcodes[2]);
    const diffs3 = isValidDeckstring(deckcodes[0].substring(0,6)+deckcodes[3]);
    const diffs4 = isValidDeckstring(deckcodes[0].substring(0,6)+deckcodes[4]);
    if (!diffs1 || !diffs2 || !diffs3 || !diffs4) {
      return [];
    }
    const deck2 = combine(deck1, diffs1, diffs2);
    const deck3 = combine(deck1, diffs3, diffs4);
    Promise.all([deck1, deck2, deck3].map(encode).map(fetchDeck))
      .then(decks => {
        const result = validateDecks(decks, 'specialist');
        callback(result);
      });
  }

}

export default withRouter(DeckViewer);