import React, {Component} from 'react';
import BattlefyMatchCard from './battlefymatchcard';

class BattlefyStats extends Component {

  render() {
    console.log(this.props.matches);
    return (
      <table className="table">
        <thead>
          <tr>
            <th scope='col'>Player 1</th>
            <th scope='col'>Player 1 Classes</th>
            <th scope='col'>Score</th>
            <th scope='col'>Player 2</th>
            <th scope='col'>Player 2 Classes</th>
          </tr>
        </thead>
        {
          this.props.matches.map(
            match => (<BattlefyMatchCard match={match} player={this.props.player}/>)
          )
        }
      </table>
    );
  }
}

export default BattlefyStats;