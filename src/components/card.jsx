import React, { Component } from 'react';

class Card extends Component {

  render() {
    const card = this.props.card;
    return (
      <div>
        <img src={this.getCardImg(card)} alt={card[0].name}></img>
      </div>
    );
  }

  getCardImg(card) {
    return require('../resources/Tiles/'+card[0].id+(card[1]===2 ? '_2' : '')+'.png');
  }
}

export default Card;