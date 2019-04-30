import React, { Component } from 'react';
import { withRouter } from "react-router";

import { validateDecks, compareDecks, findDeckCode, cardDiff, condenseDeckstring, parseDecks } from '../deckutils.js';
import Deck from './deck';
import DeckForm from './deckform';
import DeckOptions from './deckoptions';
import DeckDiff from './deckdiff';

class DeckPanel extends Component {

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    if (this.props.mode==='specialist' && arr[2]) {
      console.log(this.props.history.location.state);
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

  handleSubmit(codes) {
    codes = codes.map(code => findDeckCode(code, false));
    const result = validateDecks(codes, this.props.mode, true);
    if (!result[0]) {
      this.setState({
        validDeck:result[1],
        isValid: false
      });
    } else {
      const decks = result[1];
      const validDeck = Array(this.state.numDecks).fill('');
      let validSpecialist = true;
      if (this.props.mode==='specialist') {
        const diffs1 = cardDiff(decks[0],decks[1]);
        const diffs2 = cardDiff(decks[0], decks[2]);
        if (diffs1 > 5) {
          validDeck[1] = `Invalid number of swaps: ${diffs1}`;
          validSpecialist = false;
        }
        if (diffs2 > 5) {
          validDeck[2] = `Invalid number of swaps: ${diffs2}`;
          validSpecialist = false;
        }
      }
      this.setState({
        validDeck: validDeck,
        decks: decks,
        isValid: true,
        isValidSpecialist: validSpecialist
      });
      if (validSpecialist && this.props.mode==='specialist') {
        this.props.history.push(this.decksToURL(decks), {created: true});
      }
    }
  }

  handleToggleDiff(isDiff) {
    this.setState({isDiff: isDiff});
  }

  decksToURL(decks) {
    return `/specialist/${encodeURIComponent(condenseDeckstring(decks))}`;
  }

  render() {
    let decks;
    if (this.props.mode==='conquest') {
      decks = this.state.decks.map((deck, i)=> {
        return (
          <div key={'Deck'+(i+1)} className='col-sm'>
            <Deck index={0} deck={deck}></Deck>
          </div>
        );
      });
    } else {
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
      });
      }
    }
    return (
      <div>
        <DeckForm mode={this.props.mode} onSubmit={this.handleSubmit} numDecks={this.props.numDecks} validDeck={this.state.validDeck}></DeckForm>
        {this.props.mode==='specialist' && this.state.isValid ? <DeckOptions onToggleDiff={this.handleToggleDiff}></DeckOptions> : null}
        <div className='container'>
          <div className='row'>
            {decks}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(DeckPanel);