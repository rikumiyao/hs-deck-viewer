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
    copied: false,
    mode: 'conquest'
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const arr = pathname.split('/');
    const mode = arr[1].toLowerCase();
    const codes = decodeURIComponent(arr[2]).split('.');
    const decks = parseDecks(codes, mode);
    if (decks.length !== 0) {
      this.setState({
        mode,
        decks,
        isValid: true
      })
    }
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
    if (mode==='conquest') {
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
    console.log(deckComponents);
    return deckComponents;
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
        {this.state.isValid ? <DeckOptions onToggleDiff={this.handleToggleDiff}></DeckOptions> : null}
        <div className='container'>
          <div className='row'>
            {this.renderDecks(this.state.decks, this.state.mode)}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(DeckViewer);