import React, { Component } from 'react';
import Card from './card'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { encodeDeck } from '../deckutils';

class DeckDiff extends Component {

  state = {
    'copied': false
  }

	styles = {
    paddingLeft: 0,
    listStyleType: "none"
	};

  renderDeck() {
    const decktype = this.props.index===2 ? "Secondary" : "Tertiary"
    return (
      <div>
        <CopyToClipboard className='m-2' text={encodeDeck(this.props.deck)}
          onCopy={() => this.setState({copied: true})}>
          <button>Copy Deck Code</button>
        </CopyToClipboard>
        <h1>{decktype} Deck</h1>
        <h2 style={{color:'red'}}>Removed Cards</h2>
        <ul style={this.styles}>
          {
            this.props.removed.map(card => 
              <li key={card[0].name}>
               <Card card={card}/>
              </li>
            ) 
          }
        </ul>
        <h2 style={{color:'green'}}>Added Cards</h2>
        <ul style={this.styles}>
          {
            this.props.added.map(card => 
              <li key={card[0].name}>
               <Card card={card}/>
              </li>
            ) 
          }
        </ul>
      </div>                                                                                                      
    );
  }
  render() {
    return this.renderDeck();
  }
}

export default DeckDiff;