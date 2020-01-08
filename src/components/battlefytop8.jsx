import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

class BattlefyTop8 extends Component {

  state = {
    eventLocation: 'indonesia',
    players: [],
    isLoaded : false,
    error : null
  }

  componentDidMount() {
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
    const tournamentFormat = (cell, row) => {
      const result = cell.map( data => {
        return (
          <a href={`https://battlefy.com/hsesports/${data['slug']}/${data['id']}/info`}  target='_blank' rel='noopener noreferrer'>
            {`#${data['tournamentNum']} `}
          </a>
        )
      });
      return (
        <div>
          {result}
        </div>
      );
    }
    const options = {
      hideSizePerPage: true,
      sizePerPage: 50
    }
    return (
      <BootstrapTable
        data={ this.state.players } pagination options={options}>
        <TableHeaderColumn dataField='name' isKey>Name</TableHeaderColumn>
        <TableHeaderColumn dataField='numTop8s'>Top 8 Count</TableHeaderColumn>
        <TableHeaderColumn dataField='tournaments' dataFormat = {tournamentFormat}>Top 8 tournaments</TableHeaderColumn>
      </BootstrapTable>
    );
  }

  render() {
    if (this.state.isLoaded && !this.state.error) {
      return (
        <div className='m-1'>
          <h3>Top 8 Counts for Hearthstone Masters Qualifiers {this.state.eventLocation[0].toUpperCase()+this.state.eventLocation.substring(1)}</h3>
          {this.renderTable()}
        </div>
      )
    }
    else if (this.state.error) {
      return <h2 style={{'color':'red'}}>Error in fetching data</h2>;
    }
    else {
      return <DocumentTitle title='Loading Data...'></DocumentTitle>;
    }
  }
}

export default BattlefyTop8;