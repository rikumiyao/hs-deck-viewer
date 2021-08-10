import hsCarddata from '../src/resources/cards.compact.json';
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
  let format;
  if (deck.format===1) {
    format = 'wild';
  } else if (deck.format===2) {
    format = 'standard';
  } else if (deck.format===3) {
    format = 'classic';
  } else {
    format = 'standard';
  }

  return {'class': heroClass, 'cards': cards, 'format': format};
}

export function hsDecodeDeck(deckstring) {
  const valid = isValidDeckstring(deckstring);
  if (!valid) {
    return { success: false, error: 'Invalid deck code'};
  }
  const deck = convertDeck(valid);
  if (!deck) {
    return { success: false, error: 'Invalid class' };
  }
  return { success: true, deck: deck };
}

function compare(a,b) {
  if (a[0]['cost'] - b[0]['cost'] !== 0) {
    return a[0]['cost'] - b[0]['cost'];
  } else {
    if (a[0]['name']['enUS'] < b[0]['name']['enUS']) {
      return -1;
    } else {
      return 1;
    }
  }
}

