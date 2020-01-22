import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { compareDecks, condenseDeckstring, parseDecks } from '../deckutils.js';
import Deck from './deck';
import DeckOptions from './deckoptions';
import DeckDiff from './deckdiff';

class DeckViewer extends Component {

  constructor(props) {
    super(props);
    this.handleToggleDiff = this.handleToggleDiff.bind(this);
    this.state.numDecks = this.props.numDecks;
  }

  state = {
    decks : [],
    validDeck : [],
    isValid : false,
    isDiff: true,
    isValidSpecialist: false,
    copied: false
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const arr = pathname.split('/');
    if (arr[2]) {
      const codes = decodeURIComponent(arr[2]).split('.');
      const decks = parseDecks(codes);
      if (decks.length === 3) {
        this.setState({
          decks: decks,
          isValid: true,
          isValidSpecialist: true
        })
      }
    }
  }

  handleToggleDiff(isDiff) {
    this.setState({isDiff: isDiff});
  }

  decksToURL(decks) {
    return `https://www.yaytears.com/specialist/${encodeURIComponent(condenseDeckstring(decks))}`;
  }

  renderSpecialistURL() {
    const url = this.decksToURL(this.state.decks);
    return (
      <div className='row'>
        <div className='col-1'>
          <CopyToClipboard className='m-2 btn btn-primary' text={url}
            onCopy={() => this.setState({copied: true})}>
            <button>Copy Deck Code</button>
          </CopyToClipboard>
        {this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
        </div>
        <div className='col-10'>
          <input type="text" className="form-control m-2" id={'listexport'} value={this.decksToURL(this.state.decks)} readOnly />
        </div>
      </div>
    );
  }

  render() {
    let decks;
    if (this.state.isDiff) {
      decks = [];
      decks.push((
        <div key={'Deck'+(1)} className='col-sm'>
          <Deck index={1} deck={this.state.decks[0]}></Deck>
        </div>
      ))
      decks = decks.concat(this.state.decks.slice(1).map((deck, i)=> {
        const diffs = compareDecks(this.state.decks[0],deck);
        return (
          <div key={'Diff'+(i+1)} className='col-sm'>
            <DeckDiff index={i+2} removed={diffs[0]} added={diffs[1]} deck={this.state.decks[i+1]}></DeckDiff>
          </div>
        );
      }));
    } else {
      decks = this.state.decks.map((deck, i)=> {
        return (
          <div key={'Deck'+(i+1)} className='col-sm'>
            <Deck index={i+1} deck={deck}></Deck>
          </div>
        );
      })
    };
    return (
      <div className='container mt-2'>
        {this.props.history.location.state && this.props.history.location.state.created ? 
          <div className='alert alert-success' role='alert'>
            <strong>Success!</strong>
          </div> : ''
        }
        <Link className="btn btn-primary" role="button" to='/specialist'>Create More Decks</Link>
        {this.state.isValidSpecialist ? this.renderSpecialistURL() : ''}
        {this.state.isValid ? <DeckOptions onToggleDiff={this.handleToggleDiff}></DeckOptions> : null}
        <div className='container'>
          <div className='row'>
            {decks}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(DeckViewer);