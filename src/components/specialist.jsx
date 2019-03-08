import React, {Component, Fragment} from 'react';
import DeckPanel from './deckpanel';
class Specialist extends Component {
  render() {
    return (
      <Fragment>
        <h2 className="m-3">Preview Hearthstone Specialist Decks</h2>
        <DeckPanel mode='specialist' numDecks={3}/>
      </Fragment>
    );
  }
}

export default Specialist;