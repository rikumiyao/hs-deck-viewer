import React, { Component } from 'react';
import DocumentTitle from 'react-document-title'

class BattlefyTop8 extends Component {

  state = {
    eventLocation: 'arlington',
    players: [],
    isLoaded : false,
    error : null
  }

  componentDidMount() {
    const fetchTop8URL = `https://api.yaytears.com/top8Count?region=${this.state.eventLocation}`;
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
    return (
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Top 8 Count</th>
            <th scope="col">Top 8 tournaments</th>
          </tr>
         </thead>
        <tbody>
          {
            this.state.players.map((entry) => {
              const name = entry['name'];
              const top8s = entry['numTop8s'];
              const list = entry['tournaments'].map(data=>
                {return (
                  <a href={`https://battlefy.com/hsesports/${data['slug']}/${data['id']}/info`}  target='_blank' rel='noopener noreferrer'>
                    {`#${data['tournamentNum']} `}
                  </a>
                )});
              return (
                <tr key={name}>
                  <td>{ name }</td>
                  <td>{ top8s }</td>
                  <td>{list}</td>
                </tr>);
            }
          )}
        </tbody>
      </table>
    );
  }

  render() {
    if (this.state.isLoaded && !this.state.error) {
      return (
        <div className='m-1'>
          <h3>Top 8 Counts for Hearthstone Masters Qualifiers {this.state.eventLocation[0].toUpperCase()+this.state.eventLocation.substring(1)} (Top 50)</h3>
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