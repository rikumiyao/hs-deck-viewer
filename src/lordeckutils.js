import cardData from './resources/lor.compact.json';
import { DeckEncoder } from 'runeterra';

export function decodeDeck(code) {
  let deckData;
  try {
    deckData = DeckEncoder.decode(code);
  }
  catch (err) {
    return { success: false, error: 'Invalid Deck Code' };
  }
  const cards = deckData.map(card => [cardData[card.code],card.count]).sort(compare);
  const regions = new Set();
  cards.forEach(card => {regions.add(card[0].region)});
  if (regions.size >=3) {
    return { success: false, error: 'Deck cannot have more than 2 regions'};
  }
  const err = validateCards(cards);
  if (err) {
    return { success: false, error: err }
  }
  return { success: true, deck: {'regions': [...regions], 'cards': cards} };
}

function compare(a,b) {
  if (a[0]['cost'] - b[0]['cost'] !== 0) {
    return a[0]['cost'] - b[0]['cost'];
  } else {
    if (a[0]['name'] < b[0]['name']) {
      return -1;
    } else {
      return 1;
    }
  }
}

function validateCards(cards) {
  if (cards.reduce((acc, cur)=>acc+cur[1],0) !== 40) {
    return 'Deck must have 40 cards';
  }
  if (cards.filter(card=>card[0]["type"]=='Champion').reduce((acc, cur)=>acc+cur[1],0) > 6) {
    return 'Deck cannot have more than 6 champions';
  }
  if (cards.some(card=> card[1] < 0 || card[1] > 3)) {
    return 'Invalid Card Count';
  }
  return '';
}