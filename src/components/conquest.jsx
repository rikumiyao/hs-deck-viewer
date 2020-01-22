import React, {Component} from 'react';
import DeckPanel from './deckpanel';
import DocumentTitle from 'react-document-title';
class Conquest extends Component {
  render() {
    return (
      <DocumentTitle title='Conquest Decks'>
          <div className="container mt-2">
            <h2>Create Hearthstone Conquest Lineups</h2>
            <DeckPanel mode='conquest' numDecks={4}/>
          </div>
      </DocumentTitle>
    );
  }
}

export default Conquest;