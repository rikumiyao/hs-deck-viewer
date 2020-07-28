import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

class RuneterraLeaderboard extends Component {

  regions = ['americas', 'europe', 'asia', 'sea'];

  state = {
    region: this.regions[0],
    input: '',
    displayedPlayers: [],
    players: [],
    isLoaded : false,
    error : null
  }

  constructor() {
    super();
    this.loadLeaderboard = this.loadLeaderboard.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.loadLeaderboard();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.region !== prevState.region) {
      this.loadLeaderboard();
    }
  }

  loadLeaderboard() {
    const fetchTop8URL = `/api/leaderboardlor?region=${this.state.region}`;
    fetch(fetchTop8URL)
      .then(res => res.json())
      .then(
        (result) => {
          const players = result.map(player => {return {'name':player['name'], 'rank': player['rank']+1, 'lp': player['lp']}});
          this.setState({players: players, displayedPlayers: this.filterPlayers(players, this.state.input), isLoaded: true});
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

  filterPlayers(players, input) {
    return players.filter(entry=>entry['name'].toLowerCase().startsWith(input.toLowerCase()))
  }

  handleChange(event) {
    const input = event.target.value;
    this.setState({input: input, displayedPlayers: this.filterPlayers(this.state.players, input)});
  }

  renderTable() {
    const options = {
      hideSizePerPage: true,
      sizePerPage: 50
    }
    return (
      <BootstrapTable
        data={ this.state.displayedPlayers } pagination options={options} className="table-striped">
        <TableHeaderColumn dataField='rank'>Rank</TableHeaderColumn>
        <TableHeaderColumn dataField='name' isKey>Name</TableHeaderColumn>
        <TableHeaderColumn dataField='lp'>LP</TableHeaderColumn>
      </BootstrapTable>
    );
  }

  render() {
    if (this.state.isLoaded && !this.state.error) {
      return (
        <div className='container  mt-2'>
          <h2>{this.state.region[0].toUpperCase()+this.state.region.substring(1)} Runeterra Leaderboard</h2>
          <div className="m-1 row">
            <select className="form-control col-sm-2 m-1" id="format"
              defaultValue={this.state.region} onChange={event => {this.setState({isLoaded:false, region:event.target.value})}}>
              {
                this.regions.map(region => {
                  return (<option value={region}>{region[0].toUpperCase()+region.substring(1)}</option>)
                })
              }
            </select>
            <input type="text" className="form-control m-1 col" onChange={(e) => this.handleChange(e)} placeholder={'Enter Player Name'}/>
          </div>
          <div className="m-1">
            Number of Masters players: {this.state.players.length}
          </div>
          {this.renderTable()}
        </div>
      )
    }
    else if (this.state.error) {
      return <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    }
    else {
      return (
        <DocumentTitle title='Loading Data...'>
          <div className='container mt-2'>
            <Loader type="Oval" />
          </div>
        </DocumentTitle>
      );
    }
  }
}

export default RuneterraLeaderboard;
