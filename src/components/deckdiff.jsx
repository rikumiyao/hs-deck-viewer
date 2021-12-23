import React, { Component } from 'react';
import Card from './card'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { encodeDeck } from '../deckutils';

class DeckDiff extends Component {

  state = {
    'copied': false
  };

  styles = {
    paddingLeft: 0,
    listStyleType: "none"
  };

  supportedLanguages = ['en', 'jp', 'cn'];

  renderDeck() {
    const deck = this.props.deck;
    const diffcount = this.props.removed.reduce((acc, cur)=> acc+cur[1], 0);
    return (
      <div>
        <CopyToClipboard className='m-2 btn btn-primary' text={encodeDeck(this.props.deck)}
          onCopy={() => this.setState({copied: true})}>
          <button>Copy Deck Code</button>
        </CopyToClipboard>
        {this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
        <h2>Diff count: {diffcount}</h2>
        <span>
          { deck.class ? <img src={this.getClassImg(deck.class, this.props.index, this.props.language)} alt={deck.class}></img> : null }
        </span>
        <h2 style={{color:'red'}}>Removed Cards</h2>
        <ul style={this.styles}>
          {
            this.props.removed.map(card => 
              <li key={card[0].name}>
               <Card card={card} language={this.props.language}/>
              </li>
            ) 
          }
        </ul>
        <h2 style={{color:'green'}}>Added Cards</h2>
        <ul style={this.styles}>
          {
            this.props.added.map(card => 
              <li key={card[0].name}>
               <Card card={card} language={this.props.language}/>
              </li>
            ) 
          }
        </ul>
      </div>
    );
  }

  getClassImg(deckClass, index, language) {
    if (!this.supportedLanguages.includes(language)) {
      language = 'en';
    }
    const extension = '.png';
    if (index===0)
      return require('../resources/classes/'+language+'/'+deckClass+extension).default;
    else
      return require('../resources/classes/'+language+'/'+deckClass+'_'+index+extension).default;
  }

  render() {
    return this.renderDeck();
  }
}

export default DeckDiff;