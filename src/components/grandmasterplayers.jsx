import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class GrandmasterPlayers extends Component {

  state = {
    "region": "ALL"
  };

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({region: e.target.value});
  }

  renderTable(props) {
    const players = {};
    const regionMap = {
      NA: "Americas",
      EU: "Europe",
      APAC: "Asia-Pacific",
    };
    props.matches.filter(match=>match.region===this.state.region || this.state.region === "ALL")
      .forEach(match => {
        const matchId = match.id;
        [1,2].forEach(n => {
          const player = match[`competitor_${n}`];
          const classes = match[`competitor_${n}_classes`];
          const decks = match[`competitor_${n}_decks`];
          if (!players[player]) {
            players[player] = {
              name: player,
              classes,
              matchId,
              region: regionMap[match.region],
              decks
            }
          } else {
            if (decks) {
              players[player] = {
                name: player,
                classes,
                matchId,
                region: regionMap[match.region],
                decks
              }
            }
          }
        })
      });
    const data = Object.values(players).sort((a,b) => a&&b ? a.name.localeCompare(b.name) : 
        a.name < b.name ? -1 : a.name===b.name ? 0 : 1);
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Player</th>
            <th scope="col">Region</th>
            <th scope="col">Classes</th>
          </tr>
        </thead>
        <tbody>
          {data
            .map(player=> {
            return (
              <tr id={player.name}>
                <td>{player.decks && player.decks.length!==0 ? <Link to={`/grandmasters/${player['matchId']}?player=${player.name}`}>{player.name}</Link> : player.name}</td>
                <td>{player.region}</td>
                <td>{this.renderClasses(player.classes)}</td>
              </tr>
            )})}
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <>
        <div className="row my-2">
          <label className="col-sm-1 col-form-label">Region</label>
          <select className="form-control col-sm-2" id="region"
            defaultValue={this.state.region} onChange={this.handleChange}>
            <option value="ALL">All Regions</option>
            <option value="NA">Americas</option>
            <option value="EU">Europe</option>
            <option value="APAC">Asia-Pacific</option>
          </select>
        </div>
        {this.renderTable(this.props)}
      </>
    )
  }

  renderClasses(classes) {
    const classArr = classes.filter(a => a['class'])
      .sort((a,b)=>a['class'].localeCompare(b['class']))
      .map(a => (
        <img width="34px" height="34px"
          src={require(`../resources/icons/icon_${a['class']}.png`)} alt={a['class']} className='mx-1'/>));
    return classArr;
  }
}

export default GrandmasterPlayers;
