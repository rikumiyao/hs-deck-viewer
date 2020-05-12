import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { validateDecks, findDeckCode, fetchDeck } from '../deckutils.js';

class BattlefyMatchCard extends Component {

  state = {
    topPlayer: {},
    bottomPlayer: {},
    games: [],
    error: null,
    isLoaded: false
  }

  constructor() {
    super();
    this.loadData = this.loadData.bind(this);
  }

  processMatch(data) {
    const match = data[0];
    const top = match['top'];
    const topPlayer = {
      'name': top['team']['name'],
      'bannedClass': top['bannedClass'],
      'tournamentID': top['team']['tournamentID']
    };
    const bottom = match['bottom'];
    const bottomPlayer = {
      'name': bottom['team']['name'],
      'bannedClass': bottom['bannedClass'],
      'tournamentID': bottom['team']['tournamentID']
    };
    const games = match['stats'].map(game => {
        return {
          'top': game['stats']['top'],
          'bottom': game['stats']['bottom'],
        }
      }
    );
    return { topPlayer, bottomPlayer, games };
  }

  reverseGames(games) {
    return games.map(game => {return {top: game.bottom, bottom: game.top}})
  }

  processDecks(match, matchId) {
    const fetchURL = `https://majestic.battlefy.com/tournaments/${match.topPlayer.tournamentID}/matches/${matchId}/deckstrings`;
    return fetch(fetchURL)
      .then(res => {return res.json()})
      .then(res => {
        return Promise.all(['top', 'bottom'].map(pos => {
          const codes = res[pos].map(code => findDeckCode(code, true));
          return Promise.all(codes.map(fetchDeck))
            .then(decks => {
              const result = validateDecks(decks, false);
              if (!result['success']) {
                throw new Error("Invalid Deck");
              }
              const classes = result.decks.map(deck => deck['class']);
              return { player: pos+"Player", classes: classes }
            })
        }));
      })
      .then(res => {
        res.forEach(player=> {
          match[player.player]['classes'] = player.classes;
        })
        return match
      });
  }

  getScore() {
    const score = this.state.games.reduce((acc, cur) => {
      return [acc[0] + (cur['top']['winner'] ? 1 : 0), acc[1] + (cur['bottom']['winner'] ? 1 : 0)];
    }, [0,0]);
    return score;
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ isLoaded: false });
      this.loadData();
    }
  }

  componentDidMount() {
    this.loadData();
  }


  loadData() {
    const matchId = this.props.match['matchId'];
    const matchUrl = `https://dtmwra1jsgyb0.cloudfront.net/matches/${matchId}\
?extend%5Btop.team%5D%5Bplayers%5D%5Buser%5D=true\
&extend%5Bbottom.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bstats%5D=true`;
    fetch(matchUrl)
      .then(res => res.json())
      .then(this.processMatch)
      .then(res => this.processDecks(res, matchId))
      .then(res => {
        if (res.topPlayer.name === this.props.player) {
          return res;
        } else {
          return { topPlayer: res.bottomPlayer, bottomPlayer: res.topPlayer, games: this.reverseGames(res.games) };
        }
      })
      .then(
        res => this.setState({topPlayer: res.topPlayer, bottomPlayer: res.bottomPlayer, games: res.games}),
        (error) => {
          this.setState({
            isLoaded: true,
            error
          })
        }
      )
      .then(() => this.setState({isLoaded: true}));
  }

  renderClasses(player) {
    const classes = player['classes'].filter(className => className !== player['bannedClass'])
      .sort()
      .map(className => (
        <img width="34px" height="34px"
          src={require(`../resources/icons/icon_${className}.png`)} alt={className} className='mx-1'/>));
    if (player['bannedClass']) {
      classes.push(<img width="34px" height="34px" className='banned mx-1' 
        src={require(`../resources/icons/icon_${player['bannedClass']}.png`)} alt={player['bannedClass']}/>)
    }
    return classes;
  }

  render() {
    if (this.state.isLoaded && !this.state.error) {
      const score = this.getScore();
      const topPlayer = this.state.topPlayer;
      const bottomPlayer = this.state.bottomPlayer;
      return (
        <tr>
          <th><Link to={`/battlefy/${topPlayer.tournamentID}/${encodeURIComponent(topPlayer.name)}`}>{topPlayer.name}</Link></th>
          <th>{this.renderClasses(topPlayer)}</th>
          <th>{`${score[0]}-${score[1]}`}</th>
          <th><Link to={`/battlefy/${bottomPlayer.tournamentID}/${encodeURIComponent(bottomPlayer.name)}`}>{bottomPlayer.name}</Link></th>
          <th>{this.renderClasses(bottomPlayer)}</th>
        </tr>
      )
    } else if (!this.state.isLoaded) {
      return (<tr><Loader type="Oval" /></tr>)
    } else {
      return <tr> <h2 style={{'color':'red'}}>{this.state.error.message ? this.state.error.message : this.state.error} </h2></tr>;
    }
  }
}

export default BattlefyMatchCard;