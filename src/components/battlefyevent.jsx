import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, Tab } from 'react-bootstrap';
import DocumentTitle from 'react-document-title'

import BattlefyStats from './battlefystats';

class BattlefyEvent extends Component {

  constructor() {
    super();
    this.processBracket = this.processBracket.bind(this);
    this.processClasses = this.processClasses.bind(this);
    this.processSwiss = this.processSwiss.bind(this);
    this.processTop8 = this.processTop8.bind(this);
  }

  state = {
    name: '',
    players: {},
    playerClasses: {},
    isLoaded : false,
    error : null,
    input: '',
    id: '',
    bracketStarted: false
  }

  processBracket(data) {
    const players = {};
    data.forEach(row => {
      ['top', 'bottom'].forEach(pos=> {
        const team = row[pos];
        if (team['team']) {
          players[team['team']['name']] = {matchId : row['_id']}
        }
      })
    });
    this.setState({
      players: players
    })
  }

  processSwiss(stageId) {
    const metaDataUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${stageId}`;
    return fetch(metaDataUrl)
      .then(res => res.json())
      .then(res => res["bracket"]["currentRoundNumber"]+1 || res["currentRound"])
      .then(roundNum => {
        const standingsUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${stageId}/rounds/${roundNum}/standings`;
        return fetch(standingsUrl)
          .then(res => res.json())
          .then(res => {
            res.forEach( (row, idx) => {
              const name = row["team"]["name"];
              const wins = row["wins"];
              const losses = row["losses"];
              const players = this.state.players;
              players[name]["wins"] = wins;
              players[name]["losses"] = losses;
              players[name]["position"] = idx;
              this.setState({players: players});
            });
          });
      });
  }

  processClasses(id) {
    const url = `https://api.yaytears.com/classes?id=${id}`;
    return fetch(url)
      .then(res => res.json())
      .then(res => {
        const playerClasses = res[0];
        if (playerClasses) {
          this.setState({
            playerClasses: playerClasses
          });
        }
      });
  }

  processTop8(top8Id) {
    if (!top8Id) {
      return;
    }
    const standingsUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${top8Id}/standings`
    return fetch(standingsUrl)
      .then(res => res.json())
      .then(res => {
        if (res) {
          const players = this.state.players;
          res.forEach(row => {
            const name = row['team']['name'];
            const place = row['place'];
            players[name]['place'] = place;
          });
          this.setState({players:players});
        }
      });
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    const id = pathname.split('/')[2];
    this.setState({id: id})
    const fetchTourneyURL = `https://dtmwra1jsgyb0.cloudfront.net/tournaments/${id}`
    fetch(fetchTourneyURL)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({name: result['name']})
          const stageId = result['stageIDs'][0];
          const top8Id = result['stageIDs'][1];
          if (stageId) {
            this.setState({bracketStarted:true});
          } else {
            this.setState({
              bracketStarted:false,
              isLoaded: true
            });
            return;
          }
          const fetchBracketUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${stageId}/matches?roundNumber=1`;
          fetch(fetchBracketUrl)
            .then(res => res.json())
            .then(this.processBracket)
            .then(()=>this.processSwiss(stageId))
            .then(()=>this.setState({isLoaded: true}))
            .then(()=>this.processTop8(top8Id))
            .then(()=>this.processClasses(id));
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

  handleChange(event) {
    this.setState({input: event.target.value});
  }

  renderTable() {
    return (
      <Fragment>
        <input type="text" className="form-control m-1" onChange={(e) => this.handleChange(e)} placeholder={'Enter Player Name'}/>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Class</th>
              <th scope="col">Swiss Score</th>
              <th scope="col">Top 8 Finish</th>
            </tr>
           </thead>
          <tbody>
            {
              Object.entries(this.state.players).filter(entry=>entry[0].toLowerCase().startsWith(this.state.input.toLowerCase()))
              .sort((entry1,entry2) => entry1[1]['position'] - entry2[1]['position']).map((entry,i) => {
                const name = entry[0];
                const value = entry[1];
                const heroClass = this.state.playerClasses[name]
                return (
                  <tr key={name}>
                    <td>{i+1}</td>
                    <td><Link to={`/battlefy/${this.state.id}/${value['matchId']}?player=${encodeURIComponent(name)}`} target='_blank' rel='noopener noreferrer'>{name}</Link></td>
                    <td>{ heroClass ? heroClass[0].toUpperCase()+heroClass.substring(1).toLowerCase():'' }</td>
                    <td>{value['wins'] ? value['wins']+"-"+value['losses'] : ''}</td>
                    <td>{value['place'] ? value['place'] : ''}</td>
                  </tr>);
              }
            )}
          </tbody>
        </table>
      </Fragment>
    );
  }

  render() {
    if (this.state.isLoaded && !this.state.error && this.state.bracketStarted) {
      return (
        <DocumentTitle title={this.state.name}>
          <div className='container mt-3'>
            <Link className="btn btn-primary" role="button" to={`/battlefy`}>&lt; Back</Link>
            <h2>{this.state.name}</h2>
            <Tabs defaultActiveKey="decks">
              <Tab eventKey="decks" title="Decks">
                {this.renderTable()}
              </Tab>
              <Tab eventKey="stats" title="Stats">
                <BattlefyStats classes={this.state.playerClasses} players={this.state.players}/>
              </Tab>
            </Tabs>
          </div>
        </DocumentTitle>
      );
    } else if (!this.state.error && this.state.isLoaded && !this.state.bracketStarted) {
      return (
        <DocumentTitle title={this.state.name}>
          <h2 style={{'color':'red'}}>The bracket has not yet started</h2>
        </DocumentTitle>
      );
    }
    else if (this.state.error) {
      return <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    }
    else {
      return <DocumentTitle title='Loading Players...'></DocumentTitle>;
    }
  }
}

export default BattlefyEvent;