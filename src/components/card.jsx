import React, { Component } from 'react';
import ReactHover from 'react-hover'; 

class Card extends Component {

  render() {
    const card = this.props.card;
    const options = {
      followCursor: true
    };
    return (
      <div>
        <ReactHover options={options}>
          <ReactHover.Trigger type='trigger'>
            <img src={this.getCardTile(card)} alt={card[0].name}></img>
          </ReactHover.Trigger>
          <ReactHover.Hover type='hover'>
            <img src={card[0].image} alt={card[0].name} width="256px"></img>
          </ReactHover.Hover>
        </ReactHover>
      </div>
    );
  }

  getCardTile(card) {
    return require('../resources/Tiles/'+card[0].id+(card[1]===2 ? '_2' : '')+'.png');
  }

}

export default Card;