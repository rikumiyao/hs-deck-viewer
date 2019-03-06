import React, {Component} from 'react';
import DeckPanel from './deckpanel';
class Specialist extends Component {
  render() {
    return (
        <DeckPanel mode='specialist' numDecks={3}/>
    );
  }
}

export default Specialist;