import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { encodeDeck } from '../lordeckutils';
import RuneterraCard from './runeterracard';

class RuneterraDeck extends Component {

  state = {
    copied: false
  }

  styles = {
    paddingLeft: 0,
    listStyleType: "none"
  };

  deckstyles = {
    //maxWidth: 340
  }

  renderDeck() {
    if (!this.props.deck) {
      return (null);
    }
    const deck = this.props.deck;
    return (
      <div style={this.deckstyles}>
        <CopyToClipboard className='m-2 btn btn-primary' text={this.props.code}
          onCopy={() => {this.setState({copied: true})}}>
          <button>Copy Deck Code</button>
        </CopyToClipboard>
        <div className='row'>
          {this.state.copied ? <span style={{color: 'red'}}>Copied.</span> : null}
        </div>
        {
          deck.regions.map(region => 
            <img src={this.getRegionImg(region.toLowerCase())} alt={region}></img> 
          )
        }
        <ul style={this.styles}>
          {
            deck.cards.map(card => 
              <li key={card[0].name}>
                <RuneterraCard card={card}/>
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

  getRegionImg(region) {
    const extension = '.png';
    return require('../resources/RuneterraIcons/icon-'+region+extension);
  }

}

export default RuneterraDeck;