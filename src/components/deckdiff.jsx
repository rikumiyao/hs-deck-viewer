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
    const deck = this.props.deck;
    return (
      <div>
        <CopyToClipboard className='m-2' text={encodeDeck(this.props.deck)}
          onCopy={() => this.setState({copied: true})}>
          <button>Copy Deck Code</button>
        </CopyToClipboard>
        <span>
          { deck.class ? <img src={this.getClassImg(deck.class, this.props.index)} alt={deck.class}></img> : null }
        </span>
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

  getClassImg(deckClass, index) {
    if (index===0)
      return require('../resources/classes/'+deckClass+'.jpg');
    else
      return require('../resources/classes/'+deckClass+'_'+index+'.jpg');
  }

  render() {
    return this.renderDeck();
  }
}

export default DeckDiff;