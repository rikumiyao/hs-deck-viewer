import _ from 'lodash';
import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

class BattlefyTop8 extends Component {

  tournaments = ['one', 'undercity','stormwind', 'silvermoon'];

  state = {
    eventLocation: this.tournaments[0],
    includeQualified: false,
    minCups: 10,
    top8Counts: {},
    stats: [],
    qualified: {},
    displayedData: [],
    dataLoaded: false,
    isLoaded : false,
    error : null
  }

  constructor() {
    super();
    this.loadTop8 = this.loadTop8.bind(this);
    this.updateTable = this.updateTable.bind(this);
  }

  loadStats() {
    const top8Url = `/api/top8Count?region=${this.state.eventLocation}`;
    const statsUrl = `/api/masterstourstats?region=${this.state.eventLocation}`;
    const qualifiedUrl = `https://majestic.battlefy.com/hearthstone-masters/invitees?tourStop=${_.capitalize(this.state.eventLocation)}`;
    const top8Request = fetch(top8Url)
      .then(res => res.json())
      .then(
        (result) => {
          const top8Map = _.keyBy(result, '_id');
          this.setState({top8Counts: top8Map});
        });
    const statsRequest = fetch(statsUrl)
      .then(res => res.json())
      .then(
        (result) => this.setState({stats: result}));
    const qualifiedRequest = fetch(qualifiedUrl)
      .then(res => res.json())
      .then(
        (result) => {
          const qualifedSet = new Set(result.map(value => value.battletag))
          this.setState({qualified: qualifedSet})
        });
    Promise.all([top8Request, statsRequest, qualifiedRequest])
      .then(() => this.setState({dataLoaded: true}))
      .then(this.updateTable);
  }

  updateTable() {
    const stats = this.state.stats.filter(player => 
      (this.state.includeQualified || !this.state.qualified.has(player.name)) && 
      (!this.state.minCups || player.count >= this.state.minCups)
    ).map((player, index) => {
      return {
        index: index + 1,
        name: player.name,
        numCups: player.count,
        numTop8s: this.state.top8Counts[player.name] ? this.state.top8Counts[player.name].numTop8s : 0,
        qualified: this.state.qualified.has(player.name) ? 'yes' : 'no',
        score: `${player.wins} - ${player.losses}`,
        winrate: (player.winrate*100).toFixed(2),
      }
    });
    this.setState({isLoaded: true, displayedData: stats});
  }

  componentDidMount() {
    this.loadStats();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.eventLocation !== prevState.eventLocation) {
      this.loadStats();
    } else if (this.state.minCups !== prevState.minCups || this.state.includeQualified !== prevState.includeQualified) {
      this.updateTable();
    }
  }

  loadTop8() {
    const fetchTop8URL = `/api/top8Count?region=${this.state.eventLocation}`;
    fetch(fetchTop8URL)
      .then(res => res.json())
      .then(
        (result) => {
          const players = result.map(player => {return {'name':player['_id'], 'numTop8s': player['numTop8s'], 'tournaments': player['tournaments']}});
          this.setState({players: players, isLoaded: true});
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

  renderTable() {

    if (this.state.isLoaded && !this.state.error) {
      const options = {
        hideSizePerPage: true,
        sizePerPage: 50
      }
      return (
        <BootstrapTable
          data={ this.state.displayedData } pagination options={options} className="table-striped">
          <TableHeaderColumn dataField='index'>#</TableHeaderColumn>
          <TableHeaderColumn dataField='name' isKey>Player</TableHeaderColumn>
          <TableHeaderColumn dataField='numCups'>Cups</TableHeaderColumn>
          <TableHeaderColumn dataField='numTop8s'>Top 8</TableHeaderColumn>
          <TableHeaderColumn dataField='qualified'>Qualified</TableHeaderColumn>
          <TableHeaderColumn dataField='score'>Score</TableHeaderColumn>
          <TableHeaderColumn dataField='winrate'>Winrate %</TableHeaderColumn>
        </BootstrapTable>
      );
    } else if (this.state.error) {
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

  render() {
    return (
      <div className='m-1'>
        <h3>Stats for Hearthstone Masters Qualifiers {this.state.eventLocation[0].toUpperCase()+this.state.eventLocation.substring(1)}</h3>
        <div className="m-1 row">
          <select className="form-control col-sm-2 m-1" id="format"
            defaultValue={this.state.eventLocation} onChange={event => {this.setState({isLoaded:false, eventLocation:event.target.value})}}>
            {
              this.tournaments.map(tournament => {
                return (<option value={tournament}>{tournament[0].toUpperCase()+tournament.substring(1)}</option>)
              })
            }
          </select>
          <select className="form-control col-sm-2 m-1" id="format"
            defaultValue={this.state.minCups} onChange={event => {this.setState({isLoaded:false, minCups:event.target.value})}}>
            {
              [1, 5, 10, 15, 20, 25, 30, 35, 40].map(num => {
                return (<option value={num}>Min {num} cups</option>)
              })
            }
          </select>
          <select className="form-control col-sm-2 m-1" id="format"
            defaultValue={this.state.includeQualified} onChange={event => {this.setState({isLoaded:false, includeQualified:event.target.value==='true'})}}>
            {
              [false, true].map(includeQualified => {
                return (<option value={includeQualified}>{includeQualified ? 'Include Qualified' : 'Hide Qualified'}</option>)
              })
            }
          </select>
        </div>
        {this.renderTable()}
      </div>
    )
  }
}

export default BattlefyTop8;
