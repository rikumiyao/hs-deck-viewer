import React, {Component} from 'react';
import DeckPanel from './deckpanel';
class Specialist extends Component {
  render() {
    return (
      <div className='container mt-2'>
        <h2>Preview Hearthstone Specialist Decks</h2>
        <DeckPanel mode='specialist' numDecks={3}/>
      </div>
    );
  }
}

export default Specialist;