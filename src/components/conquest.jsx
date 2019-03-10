import React, {Component} from 'react';
import DeckPanel from './deckpanel';
class Conquest extends Component {
  render() {
    return (
      <div className="container mt-2">
        <h2>Preview Hearthstone Conquest Lineups</h2>
        <DeckPanel mode='conquest' numDecks={4}/>
      </div>
    );
  }
}

export default Conquest;