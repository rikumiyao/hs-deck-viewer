import React, { Component } from 'react';
import ReactHover from 'react-hover'; 

class RuneterraCard extends Component {

  styles = {
    height: 50
  };

  render() {
    const card = this.props.card;
    const options = {
      followCursor: true,
      shiftY: -380
    };
    return (
      <div style={this.styles}>
        <ReactHover options={options}>
          <ReactHover.Trigger type='trigger'>
            <div>
              <img src={this.getCardTile(card)} height='50px' alt={card[0].name}></img>
              <img src={this.getCardCount(card)} height='50px' alt={card[1]}></img>
            </div>
          </ReactHover.Trigger>
          <ReactHover.Hover type='hover'>
            <img src={card[0].assets[0].gameAbsolutePath} alt={card[0].name} width="256px"></img>
          </ReactHover.Hover>
        </ReactHover>
      </div>
    );
  }

  getCardTile(card) {
    return require('../resources/LorTiles/'+card[0].cardCode+'.png');
  }

  getCardCount(card) {
    return require('../resources/LorTiles/tile_'+card[1]+'.png');
  }

}

export default RuneterraCard;