import hsCarddata from '../src/resources/cards.compact.json';
import lorCardData from '../src/resources/lor.compact.json';
import {isValidDeckstring} from '../src/deckutils';
import { DeckEncoder } from 'runeterra';

const cardsDict = {};

for (var x=0;x<hsCarddata.length;x++) {
  const card = hsCarddata[x]
  cardsDict[card.dbfId] = card
}

function convertDeck(deck) {
  const hero = deck.heroes[0];
  const heroClass = cardsDict[hero]['cardClass'].toLowerCase();
  const cards = deck.cards.map(x => {
    return [cardsDict[x[0]], x[1]];
  });
  if (!heroClass || !cards.every(card=>card[0])) {
    return null;
  }
  cards.sort(compare);
  const format = deck.format===2 ? 'standard' : 'wild'

  return {'class': heroClass, 'cards': cards, 'format': format};
}

export function hsDecodeDeck(deckstring) {
  const valid = isValidDeckstring(deckstring);
  if (!valid) {
    return { success: false, error: 'Invalid deck code'};
  }
  const deck = convertDeck(valid);
  return { success: true, deck: deck };
}


export function lorDecodeDeck(code) {
  let deckData;
  try {
    deckData = DeckEncoder.decode(code);
  }
  catch (err) {
    return { success: false, error: 'Invalid Deck Code' };
  }
  const cards = deckData.map(card => [lorCardData[card.code],card.count]).sort(compare);
  const regions = new Set();
  cards.forEach(card => {regions.add(card[0].region)});
  if (regions.size >=3) {
    return { success: false, error: 'Deck cannot have more than 2 regions'};
  }
  const err = validateLorCards(cards);
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


function validateLorCards(cards) {
  if (cards.reduce((acc, cur)=>acc+cur[1],0) !== 40) {
    return 'Deck must have 40 cards';
  }
  if (cards.filter(card=>card[0]["type"]==='Champion').reduce((acc, cur)=>acc+cur[1],0) > 6) {
    return 'Deck cannot have more than 6 champions';
  }
  if (cards.some(card=> card[1] < 0 || card[1] > 3)) {
    return 'Invalid Card Count';
  }
  return '';
}
