import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

import { validateDecks, compareDecks, findDeckCode, fetchDeck } from '../deckutils.js';
import DeckOptions from './deckoptions';
import DeckDiff from './deckdiff';
import Deck from './deck';

class BattlefyDecks extends Component {

  state = {
    decks : [],
    language : 'en',
    isValid : false,
    isLoaded : false,
    error : null,
    isDiff : true
  }
  // TODO: turn this into a component
  languages = [{key:'en', value: 'English'}, {key: 'jp', value: '日本語'}];

  constructor() {
    super();
    this.handleToggleDiff = this.handleToggleDiff.bind(this);
    this.loadDecks = this.loadDecks.bind(this);
  }

  handleToggleDiff(isDiff) {
    this.setState({isDiff: isDiff});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.player !== this.props.player || prevProps.position !== this.props.position
      || prevProps.matchId !== this.props.matchId || prevProps.tourneyId !== this.props.tourneyId) {
      this.setState({ isLoaded: false });
      this.loadDecks();
    }
  }

  componentDidMount() {
    this.loadDecks();
  }

  loadDecks() {
    const tourneyId = this.props.tourneyId;
    const matchId = this.props.matchId;
    const position = this.props.position;
    const fetchURL = `https://majestic.battlefy.com/tournaments/${tourneyId}/matches/${matchId}/deckstrings`;
    fetch(fetchURL)
      .then(res => res.json())
      .then(
        (result) => {
          const decks = result[position];
          if (decks) {
            this.processDecks(decks);
          }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  processDecks(codes) {
    codes = codes.map(code => findDeckCode(code, true));
    Promise.all(codes.map(fetchDeck))
      .then(decks => {
        const result = validateDecks(decks);
        if (!result['success']) {
          this.setState({
            isValid: false
          });
        } else {
          this.setState({
            decks: result['decks'],
            isValid: true,
            isLoaded: true
          });
        }
      });
  }

  render() {
    if (this.state.isLoaded && !this.state.error && this.state.isValid) {
      const isSpecialist = this.state.decks.every(deck=>deck.class===this.state.decks[0].class);
      let decks;
      if (isSpecialist && this.state.isDiff) {
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
              <DeckDiff index={i+2} removed={diffs[0]} added={diffs[1]} deck={this.state.decks[i+1]} language={this.state.language}></DeckDiff>
            </div>
          );
        }));
      } else {
        decks = this.state.decks.map((deck, i)=> {
          return (
            <div key={'Deck'+(i+1)} className='col-sm'>
              <Deck index={isSpecialist ? i+1 : 0} deck={deck} language={this.state.language}></Deck>
            </div>
          );
        });
      }
      return (
        <div className='container mt-2'>
          <Link className="btn btn-primary" role="button" to={`/battlefy/${this.props.tourneyId}`}>&lt; Back</Link>
          <h1>{this.props.player}'s Decks</h1>
          <a className='btn btn-primary' href={`https://d0nkey.top/battlefy/tournament/${this.props.tourneyId}/player/${encodeURIComponent(this.props.player)}`}  target='_blank' rel='noopener noreferrer'>
            d0nkey
          </a>
          <select className="form-control m-1" id="format"
          defaultValue={this.state.language} onChange={event => {this.setState({language:event.target.value})}}>
            {
              this.languages.map(language => {
                return (<option value={language.key}>{language.value}</option>)
              })
            }
          </select>
          {isSpecialist && this.state.isValid ? <DeckOptions onToggleDiff={this.handleToggleDiff}></DeckOptions> : null}
          <div className='row'>
            {decks}
          </div>
        </div>
      );
    } else if (!this.state.error && this.state.isLoaded && !this.state.isValid) {
      return <h2 style={{'color':'red'}}>Unknown error in validating decks</h2>;
    }
    else if (this.state.error) {
      return <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    }
    return (
      <div className='container mt-2'>
        <Loader type="Oval" />
      </div>
    );
  }
}

export default BattlefyDecks;