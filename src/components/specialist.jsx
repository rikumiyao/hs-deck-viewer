import React, {Component} from 'react';
import DeckPanel from './deckpanel';
import DocumentTitle from 'react-document-title'
class Specialist extends Component {
  render() {
    return (
      <DocumentTitle title='Specialist Decks'>
        <div className='container mt-2'>
          <h2>Create Hearthstone Specialist Decks</h2>
          <DeckPanel mode='specialist' numDecks={3}/>
        </div>
      </DocumentTitle>
    );
  }
}

export default Specialist;