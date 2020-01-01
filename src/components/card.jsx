import React, { Component } from 'react';
import ReactHover from 'react-hover'; 

class Card extends Component {

  state = {
    cardImg : ''
  };

  componentDidMount() {
    this.loadCardImg(this.props.card);
  }

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
            <img src={this.state.cardImg} alt={card[0].name} width="256px"></img>
          </ReactHover.Hover>
        </ReactHover>
      </div>
    );
  }

  getCardTile(card) {
    return require('../resources/Tiles/'+card[0].id+(card[1]===2 ? '_2' : '')+'.png');
  }

  loadCardImg(card) {
    const fetchCardURL = `/api/card/?id=${card[0].dbfId}`;
    fetch(fetchCardURL)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json();
        }
      }).then(res => {
        const cardImg = res.image;
        this.setState({
          cardImg: cardImg
        });
      });
  }
}

export default Card;