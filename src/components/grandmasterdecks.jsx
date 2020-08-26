import React, {Component} from 'react';
import DocumentTitle from 'react-document-title';
import { Link } from 'react-router-dom';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

import { validateDecks, compareDecks, findDeckCode, fetchDeck } from '../deckutils.js';
import DeckDiff from './deckdiff';
import Deck from './deck';
import DeckOptions from './deckoptions';

const queryString = require('query-string');

class GrandmasterDecks extends Component {

  state = {
    player : '',
    decks : [],
    isLoaded : false,
    error : null,
    isDiff : true,
    decksExist: true,
    isSpecialist: false
  }

  constructor() {
    super();
    this.handleToggleDiff = this.handleToggleDiff.bind(this);
  }

  handleToggleDiff(isDiff) {
    this.setState({isDiff: isDiff});
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const id = pathname.split('/')[2];
    const values = queryString.parse(this.props.location.search);
    const player = values['player'];
    const fetchURL = '/api/grandmasters'
    fetch(fetchURL)
      .then(res => res.json())
      .then(
        (result) => {
          const match = result.find(match => match.id.toString()===id);
          if (!match) {
            this.setState({
              error: 'Unable to find match',
              isLoaded: true
            });
            return;
          }
          const player1 = match.competitor_1;
          const player2 = match.competitor_2;
          let decks;
          if (player1 === player) {
            decks = match.competitor_1_decks;
          } else if (player2 === player) {
            decks = match.competitor_2_decks;
          } else {
            this.setState({
              error: 'Unable to find player',
              isLoaded: true
            });
            return;
          }
          this.setState({
            player: player,
          });
          if (decks && decks.filter(deck=>deck).every(deck=>deck)) {
            this.processDecks(decks.filter(deck=>deck));
          } else {
            this.setState({decksExist: false});
          }
          this.setState({isLoaded: true});
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
          const isSpecialist = result['decks'].every(a=>a['class']===result['decks'][0]['class'])
          this.setState({
            decks: result['decks'],
            isValid: true,
            isSpecialist: isSpecialist
          });
        }
      });
  }

  render() {
    if (this.state.isLoaded && !this.state.error && this.state.isValid) {
      let decks;
      if (this.state.isSpecialist && this.state.isDiff) {
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
              <Deck index={this.state.isSpecialist ? i+1 : 0} deck={deck}></Deck>
            </div>
          );
        });
      }
      return (
        <DocumentTitle title={this.state.player}>
          <div className='container mt-2'>
            <Link className="btn btn-primary" role="button" to={`/grandmasters`}>&lt; Back</Link>
            <h1>{this.state.player}'s Decks</h1>
            {this.state.isSpecialist ? <DeckOptions onToggleDiff={this.handleToggleDiff}
              disabledText="Show Differences" enabledText="Hide Differences"></DeckOptions> : null}
            <div className='row'>
              {decks}
            </div>
          </div>
        </DocumentTitle>
      );
    } else if (!this.state.error && this.state.isLoaded && !this.state.decksExist) {
      return <DocumentTitle title={this.state.player}><h2 style={{'color':'red'}}>Decks Are Not Available Yet</h2></DocumentTitle>;
    } else if (!this.state.error && this.state.isLoaded && !this.state.isValid) {
      return <DocumentTitle title={this.state.player}><h2 style={{'color':'red'}}>Unknown error in validating decks</h2></DocumentTitle>;
    }
    else if (this.state.error) {
      return <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    }
    return (
      <DocumentTitle title='Loading Decks...'>
        <div className='container mt-2'>
          <Loader type="Oval" />
        </div>
      </DocumentTitle>
    );
  }
}

export default GrandmasterDecks;