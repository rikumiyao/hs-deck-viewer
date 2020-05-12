import data from '../src/resources/cards.compact.json';
import {isValidDeckstring} from '../src/deckutils';

const cardsDict = {};

for (var x=0;x<data.length;x++) {
  const card = data[x]
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

export function decodeDeck(deckstring) {
  const valid = isValidDeckstring(deckstring);
  if (!valid) {
    return null;
  }
  const deck = convertDeck(valid);
  return deck;
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

