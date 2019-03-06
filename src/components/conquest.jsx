import React, {Component} from 'react';
import DeckPanel from './deckpanel';
class Conquest extends Component {
  render() {
    return (
        <DeckPanel mode='conquest' numDecks={4}/>
    );
  }
}

export default Conquest;