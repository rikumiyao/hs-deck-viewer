import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import RuneterraCard from './runeterracard';
import DeckOptions from './deckoptions';

class RuneterraDeck extends Component {

  state = {
    copied: false,
    sortByType: true
  }

  styles = {
    paddingLeft: 0,
    listStyleType: "none"
  };

  deckstyles = {
    //maxWidth: 340
  }

  constructor() {
    super();
    this.handleToggleSort = this.handleToggleSort.bind(this);
  }

  handleToggleSort(sortByType) {
    this.setState({sortByType});
  }

  renderSortType(cards) {
    const champions = cards.filter(card => card[0].type==='Champion');
    const spells = cards.filter(card => card[0].type==='Spell');
    const units = cards.filter(card => card[0].type==='Unit');
    const landmarks = cards.filter(card => card[0].type==='Landmark');
    console.log(landmarks);
    return (
      <div className='container'>
        <div className='row'>
          <div key='Champions' className='col-sm'>
            <h2>Champions</h2>
            {this.renderSortCost(champions)}
            {
              landmarks.length!==0 ? (
                <>
                  <h2>Landmarks</h2>
                  {this.renderSortCost(landmarks)}
                </>
              ):''
            }
          </div>
          <div key='Followers' className='col-sm'>
            <h2>Followers</h2>
            {this.renderSortCost(units)}
          </div>
          <div key='Spells' className='col-sm'>
            <h2>Spells</h2>
            {this.renderSortCost(spells)}
          </div>
        </div>
      </div>
    );
  }

  renderSortCost(cards) {
    return (
      <ul style={this.styles}>
        {
          cards.map(card => 
            <li key={card[0].name}>
              <RuneterraCard card={card}/>
            </li>
          ) 
        }
      </ul>
    );
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
        <div className='row'>
          <DeckOptions enabledText="Sort by Cost" disabledText="Sort by Type" 
            onToggleDiff={this.handleToggleSort}></DeckOptions>
        </div>
        {this.state.sortByType ? this.renderSortType(deck.cards) : this.renderSortCost(deck.cards)}
      </div>
    );
  }

  render() {
    return this.renderDeck();
  }

  getRegionImg(region) {
    const extension = '.png';
    return require('../resources/RuneterraIcons/icon-'+region+extension).default;
  }

}

export default RuneterraDeck;