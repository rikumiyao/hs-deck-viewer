import React, {Component} from 'react';
import DocumentTitle from 'react-document-title';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

import BattlefyDecks from './battlefydecks';
import BattlefyStats from './battlefystats';

class BattlefyPlayer extends Component {

  constructor() {
    super();
    this.processBracket = this.processBracket.bind(this);
  }

  state = {
    player: '',
    matchId: '',
    matchPosition: '',
    tourneyId: '',
    matches: [],
    isLoaded: false,
    found: false,
    error: null
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
          const stage2Id = result['stageIDs'][1];
          const fetchDecksUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${stageId}/matches`;
          const fetchBracket2Url = stage2Id ? `https://dtmwra1jsgyb0.cloudfront.net/stages/${stage2Id}/matches` : '';
          fetch(fetchDecksUrl)
            .then(res => res.json())
            .then(this.processBracket)
            .then(res => {
              this.setState({
                matchPosition: res.matchPosition,
                matchId: res.matchId,
                found: res.found,
                matches: res.matches.sort((a,b) => b.ts - a.ts)
              });
              return res.found;
            })
            .then((found)=> {
              if (fetchBracket2Url) {
                return fetch(fetchBracket2Url)
                  .then(res => res.json())
                  .then(this.processBracket)
                  .then(res => {
                    if (found) {
                      this.setState({
                        matches: this.state.matches.concat(res.matches).sort((a,b) => b.ts - a.ts)
                      });
                    } else {
                      this.setState({
                        matchPosition: res.matchPosition,
                        matchId: res.matchId,
                        found: res.found,
                        matches: this.state.matches.concat(res.matches).sort((a,b) => b.ts - a.ts)
                      });
                    }
                  });
              }
            })
            .then(() => {
              this.setState({isLoaded: true});
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
  }

  processBracket(data) {
    let found = false;
    let matchId = '';
    let matchPosition = '';
    const matches = [];
    data.forEach(row => {
      ['top', 'bottom'].forEach(pos=> {
        const team = row[pos];
        if (team['team'] && team['team']['name'] === this.state.player) {
          if (!found) {
            matchId = row['_id'];
            matchPosition = pos;
            found = true;
          }
          if (row['completedAt'])
            matches.push({matchId: row['_id'], ts: Date.parse(row['completedAt'])});
        }
      });
    });
    return {found, matchId, matchPosition, matches}
  }

  render() {
    if (this.state.error) {
      return <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    } else if (this.state.isLoaded && !this.state.found) {
      return <h2 style={{'color':'red'}}>Unable to find player</h2>;
    } else if (this.state.isLoaded) {
      return (
        <DocumentTitle title={this.state.player}>
          <div className='container mt-2'>
            <BattlefyDecks 
              player={this.state.player} 
              position={this.state.matchPosition}
              matchId={this.state.matchId}
              tourneyId={this.state.tourneyId}/>
            <BattlefyStats
              matches={this.state.matches}
              player={this.state.player}
            />
          </div>
        </DocumentTitle>
      )
    }
    return (
      <DocumentTitle title={this.state.player}/>
    );
  }
}

export default BattlefyPlayer;