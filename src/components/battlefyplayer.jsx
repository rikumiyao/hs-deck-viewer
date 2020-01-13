import React, {Component} from 'react';
import DocumentTitle from 'react-document-title';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

import BattlefyDecks from './battlefydecks';

class BattlefyPlayer extends Component {

  constructor() {
    super();
    this.processBracket = this.processBracket.bind(this);
  }

  state = {
    player : '',
    matchId: '',
    matchPosition: '',
    tourneyId: '',
    isLoaded: false,
    found: false,
    error: null
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const tourneyId = pathname.split('/')[2];
    const player = decodeURIComponent(pathname.split('/')[3]);
    this.setState({tourneyId: tourneyId, player: player});
    // Find a match id for the player to query deckstring
    const fetchTourneyURL = `https://dtmwra1jsgyb0.cloudfront.net/tournaments/${tourneyId}`;
    fetch(fetchTourneyURL)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({name: result['name']})
          const stageId = result['stageIDs'][0];
          const fetchDecksUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${stageId}/matches?roundNumber=1`;
          fetch(fetchDecksUrl)
            .then(res => res.json())
            .then(this.processBracket)
            .then(res => {
              this.setState({
                isLoaded: true,
                matchPosition: res.matchPosition,
                matchId: res.matchId,
                found: res.found
              });
            });
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
      );
    // Later: Have a new component handle match data
  }

  processBracket(data) {
    let found = false;
    let matchId = '';
    let matchPosition = '';
    data.forEach(row => {
      ['top', 'bottom'].forEach(pos=> {
        const team = row[pos];
        if (team['team'] && team['team']['name'] === this.state.player) {
          matchId = row['_id'];
          matchPosition = pos;
          found = true;
        }
      });
    });
    return {found: found, matchId: matchId, matchPosition: matchPosition}
  }

  render() {
    if (this.state.error) {
      return <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    } else if (this.state.isLoaded && !this.state.found) {
      return <h2 style={{'color':'red'}}>Unable to find player</h2>;
    } else if (this.state.isLoaded) {
      return (
        <DocumentTitle title={this.state.player}>
          <BattlefyDecks 
            player={this.state.player} 
            position={this.state.matchPosition}
            matchId={this.state.matchId}
            tourneyId={this.state.tourneyId}/>
        </DocumentTitle>
      )
    }
    return (
      <DocumentTitle title={this.state.player}/>
    );
  }
}

export default BattlefyPlayer;