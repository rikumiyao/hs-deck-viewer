import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { encodeDeck } from '../deckutils';

import Card from './card';

class Deck extends Component {

  state = {
    copied: false,
  }

  styles = {
    paddingLeft: 0,
    listStyleType: "none"
  };

  deckstyles = {
    maxWidth: 340
  }

  supportedLanguages = ['en', 'jp'];

  renderDeck() {
    if (!this.props.deck) {
      return (null);
    }
    const deck = this.props.deck;
    return (
      <div style={this.deckstyles}>
        <CopyToClipboard className='m-2 btn btn-primary' text={encodeDeck(deck)}
          onCopy={() => {this.setState({copied: true})}}>
          <button>Copy Deck Code</button>
        </CopyToClipboard>
        {this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
        <span>
          { deck.class ? <img src={this.getClassImg(deck.class, this.props.index, this.props.language)} alt={deck.class}></img> : null }
        </span>
        <ul style={this.styles}>
          {
            deck.cards.map(card => 
              <li key={card[0].name}>
               <Card card={card} language={this.props.language}/>
              </li>
            ) 
          }
        </ul>
      </div>
    );
  }

  generateDiffImg(cards, diff) {
    let i = 0;
    let j = 0;
    const result = [];
    const compare = (a,b) => {
      if (a[0]['cost'] - b[0]['cost'] !== 0) {
        return a[0]['cost'] - b[0]['cost'];
      } else {
        if (a[0]['name']['enUS'] < b[0]['name']['enUS']) {
          return -1;
        } else {
          return 1;
        }
      }
    }
    while (i < cards.length && j < diff.length) {
      const card1 = cards[i];
      const card2 = diff[j];
      if (card1[0]===card2[0]) {
        result.push(<li key={card1[0].name}><Card card={card1} change={card2[1]} language={this.props.language}/></li>);
        i++;
        j++;
      } else if (compare(card1, card2) < 0) {
        result.push(<li key={card1[0].name}><Card card={card1} change={0} language={this.props.language}/></li>);
        i++;
      } else {
        result.push(<li key={card2[0].name}><Card card={card2} change={card2[1]} language={this.props.language}/></li>);
        j++;
      }
    }
    while (i < cards.length) {
          result.push(<li key={cards[i][0].name}><Card card={cards[i]} change={0} language={this.props.language}/></li>);
      i++;
    }
    while (j < diff.length) {
      result.push(<li key={diff[j][0].name}><Card card={diff[j]} change={0} language={this.props.language}/></li>);
      j++;
    }
    return result;
  }

  render() {
    return this.renderDeck();
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
}

export default Deck;