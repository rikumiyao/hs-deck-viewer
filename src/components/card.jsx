import React, { Component } from 'react';
import ReactHover from 'react-hover'; 

const s3URI = 'https://yaytears.s3.us-east-2.amazonaws.com'

class Card extends Component {

  supportedLanguages = ['en', 'jp'];

  render() {
    const card = this.props.card;
    const options = {
      followCursor: true,
      shiftY: -380
    };
    return (
      <div>
        <ReactHover options={options} zIndex={1}>
          <ReactHover.Trigger type='trigger'>
            <img src={this.getCardTile(card, this.props.language)} alt={card[0].name}></img>
          </ReactHover.Trigger>
          <ReactHover.Hover type='hover'>
            <img src={card[0].image} alt={card[0].name} width="256px"></img>
          </ReactHover.Hover>
        </ReactHover>
      </div>
    );
  }

  getCardTile(card, language) {
    if (!this.supportedLanguages.includes(language)) {
      language = 'en';
    }
    return s3URI + '/resources/Tiles/'+language+'/'+card[0].id+(card[1]===2 ? '_2' : '')+'.png';
  }

}

export default Card;