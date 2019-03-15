import { encode, decode } from "deckstrings";
import data from './resources/cards.collectible.json';

const cardsDict = {};
const heroDict = {
  'mage': 637,
  'shaman': 1066,
  'rogue': 930,
  'warlock': 893,
  'priest': 813,
  'druid': 274,
  'warrior': 7,
  'paladin': 671,
  'hunter': 31
};

for (var x=0;x<data.length;x++) {
  const card = data[x]
  cardsDict[card.dbfId] = card
}

function isValidDeckstring(deckstring) {
  for (var i=0;i<2;i++) {
    try {
      return decode(deckstring);
    }
    catch (err) {
    }
    deckstring = deckstring + '=';
  }
  return false
}

export function findDeckCode(text, hasNewLine) {
  if (hasNewLine) {
    const regex = /^AAE([A-Za-z0-9+=/](?: ?))+/m;
    return text.match(regex)[0];
  } else {
    const regex = /AAE([A-Za-z0-9+=/](?: ?))+/;
    return text.match(regex)[0];
  }
}

export function validateDecks(deckstrings, mode) {
  const valid = deckstrings.map(isValidDeckstring);
  if (!valid.every(i=>i)) {
    return [false, valid.map(i=>i? '' : 'Invalid code')];
  }
  const decks = valid.map(convertDeck);
  if (!decks.every(i=>i)) {
    return [false, decks.map(i=>i? '' : 'Invalid code')];
  }
  const cardsValid = decks.map(validateCards);
  if (cardsValid.some(i=>i)) {
    return [false, cardsValid];
  }
  if (mode==='specialist') {
    if (!decks.every(deck=>decks[0].class===deck.class)) {
      const result = Array(deckstrings.length).fill('');
      result[0] = 'Specialist Decks must all be of same class';
      return [false, result];
    }
  } else if (mode==='conquest') {
    if (!decks.every((deck1,index1)=>decks.every((deck2, index2) => index2<=index1 || deck1.class!==deck2.class))) {
      const result = Array(deckstrings.length).fill('');
      result[0] = 'Conquest Decks must all have different classes';
      return [false, result];
    }
  }
  return [true, decks];
}

function validateCards(deck) {
  let cardCount = 0;
  const valid = deck.cards.map(value => {
    const card = value[0];
    const count = value[1];
    if (card['cardClass'].toLowerCase()!==deck.class && card['cardClass'] !== 'NEUTRAL') {
      return 'Invalid card class: ' + card['name'];
    }
    if (count > 2 || count <=0) {
      return 'Invalid card count: ' + card['name'];
    }
    cardCount += count;
    if (!['CORE','EXPERT1','UNGORO','ICECROWN','LOOTAPALOOZA','GILNEAS','BOOMSDAY', 'TROLL'].includes(card['set'])) {
      return 'Invalid card: ' + card['name'];
    }
    if (card.id==='BOT_914') { //Whizbang
      return 'Invalid card: ' + card['name'];
    }
    return null;
  })
  const error = valid.find(i=>i);
  if (error) {
    return error;
  }
  if (cardCount!==30) {
    return 'Invalid number of cards' + cardCount;
  }
  return '';
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

function convertDeck(deck) {
  const hero = deck.heroes[0];
  const heroClass = cardsDict[hero]['cardClass'].toLowerCase();
  const cards = deck.cards.map(x => {
    return [cardsDict[x[0]], x[1]];
  }).sort(compare);
  if (!heroClass || !cards.every(card=>card[0])) {
    return null;
  }
  return {'class': heroClass, 'cards': cards};
}

export function encodeDeck(deck) {
  const hero = deck.class;
  const cards = deck.cards;
  return encode({
    'cards': cards.map(card => [card[0]['dbfId'], card[1]]),
    'heroes': [heroDict[hero]],
    'format': 2 //Standard
  });
}

// Outputs a diff of 2 decks. Must be sorted. Generates list of cards removed from the first deck and list of cards added to the second deck
export function compareDecks(deck1, deck2) {
  const cards1 = deck1.cards;
  const cards2 = deck2.cards;
  const result1 = [];
  const result2 = [];
  let i = 0;
  let j = 0;
  while (i < cards1.length && j < cards2.length) {
    if (cards1[i][0] === cards2[j][0]) {
      if (cards1[i][1]<cards2[j][1]) {
        result2.push([cards2[j][0], cards2[j][1] - cards1[i][1]])
      } else if (cards2[j][1]<cards1[i][1]) {
        result1.push([cards2[j][0], cards1[i][1] - cards2[j][1]])
      }
      i++;
      j++;
    } else {
      if (compare(cards1[i], cards2[j]) < 0) {
        result1.push([cards1[i][0], cards1[i][1]]);
        i++;
      } else {
        result2.push([cards2[j][0], cards2[j][1]]);
        j++;
      }
    }
  }
  while (i < cards1.length) {
    result1.push([cards1[i][0], cards1[i][1]]);
    i++;
  }
  while (j < cards2.length) {
    result2.push([cards2[j][0], cards2[j][1]]);
    j++;
  }
  return [result1, result2];
}