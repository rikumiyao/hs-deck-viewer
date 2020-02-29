import { encode, decode } from "deckstrings";
import data from './resources/cards.compact.json';

const ACTIVE_SETS = ['CORE','EXPERT1', 'GILNEAS','BOOMSDAY', 'TROLL', 'DALARAN', 'ULDUM', 'DRAGONS', 'YEAR_OF_THE_DRAGON'];
const BANNED_CARDS = ['BOT_914','DAL_800']; //Whizbang and Zayle
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
  const regex = hasNewLine ? /^AAE([A-Za-z0-9+=/](?: ?))+/m : /AAE([A-Za-z0-9+=/](?: ?))+/;
  const matches = text.match(regex)
  return matches!=null ? matches[0] : text;
}

export function validateDecks(deckstrings, mode, format) {
  const valid = deckstrings.map(isValidDeckstring);
  if (!valid.every(i=>i)) {
    return {
      success: false,
      errors: valid.map(i=>i? '' : 'Invalid code')
    };
  }
  const decks = valid.map(convertDeck);
  if (!decks.every(i=>i)) {
    return {
      success: false,
      errors: decks.map(i=>i? '' : 'Invalid code')
    };
  }
  const cardsValid = decks.map((deck) => validateCards(deck, format));
  if (cardsValid.some(i=>i)) {
    return {
      success: false,
      errors: cardsValid
    };
  }
  if (mode==='specialist') {
    if (!decks.every(deck=>decks[0].class===deck.class)) {
      const result = Array(deckstrings.length).fill('');
      result[0] = 'Specialist Decks must all be of same class';
      return {
        success: false,
        errors: result
      };
    }
  } else if (mode==='conquest') {
    if (!decks.every((deck1,index1)=>decks.every((deck2, index2) => index2<=index1 || deck1.class!==deck2.class))) {
      const result = Array(deckstrings.length).fill('');
      result[0] = 'Conquest Decks must all have different classes';
      return {
        success: false,
        errors: result
      };
    }
  }
  return {
    success: true,
    decks: decks
  };
}

function validateCards(deck, format) {
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
    if (format==='standard') {
      if (!ACTIVE_SETS.includes(card['set'])) {
        return 'Invalid card: ' + card['name'];
      }
    }
    if (BANNED_CARDS.includes(card.id)) {
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
  });
  if (!heroClass || !cards.every(card=>card[0])) {
    return null;
  }
  cards.sort(compare);
  const format = deck.format===2 ? 'standard' : 'wild'
  
  return {'class': heroClass, 'cards': cards, 'format': format};
}

export function encodeDeck(deck) {
  const hero = deck.class;
  const cards = deck.cards;
  return encode({
    'cards': cards.map(card => [card[0]['dbfId'], card[1]]),
    'heroes': [heroDict[hero]],
    'format': deck.format==='standard' ? 2 : 1 //Standard or Wild
  });
}

//Returns the 'hamming distance' between 2 decks
export function cardDiff(deck1, deck2) {
  const cards1 = deck1.cards;
  const cards2 = deck2.cards;
  let count = 0;
  let i = 0;
  let j = 0;
  while (i < cards1.length && j < cards2.length) {
    if (cards1[i][0] === cards2[j][0]) {
      if (cards1[i][1]>cards2[j][1]) {
        count += Math.abs(cards1[i][1]-cards2[j][1]);
      }
      i++;
      j++;
    } else {
      if (compare(cards1[i], cards2[j]) < 0) {
        count += cards1[i][1];
        i++;
      } else {
        j++;
      }
    }
  }
  while (i < cards1.length) {
    count+=cards1[i][1];
    i++;
  }
  return count;
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

export function condenseDeckstring(decks, mode) {
  if (mode === 'conquest' || mode === 'deck') {
    return condenseConquest(decks);
  } else {
    return condenseSpecialist(decks);
  }
}

function condenseSpecialist(decks) {
  const hero = decks[0].class;
  const deck1 = encodeDeck(decks[0]);
  const diffs1 = compareDecks(decks[0],decks[1]);
  const diffs2 = compareDecks(decks[0],decks[2]);
  const cards1 = diffs1[0].map(card => [card[0]['dbfId'], card[1]]);
  const cards2 = diffs1[1].map(card => [card[0]['dbfId'], card[1]]);
  const cards3 = diffs2[0].map(card => [card[0]['dbfId'], card[1]]);
  const cards4 = diffs2[1].map(card => [card[0]['dbfId'], card[1]]);
  const encodePart = cards => encode({
    'cards': cards,
    'heroes': [heroDict[hero]],
    'format': 2
  }).substring(6)
  return [deck1, encodePart(cards1),encodePart(cards2),encodePart(cards3),encodePart(cards4)].join('.');
}

function condenseConquest(decks) {
  return decks.map(encodeDeck).join('.');
}

export function parseDecks(code, mode) {  
  if (mode === 'deck') {
    return parseConquest([code]);
  }
  const deckcodes = code.split('.');
  if (mode === 'conquest') {
    return parseConquest(deckcodes);
  } else {
    return parseSpecialist(deckcodes);
  }
}

function parseConquest(deckcodes) {
  if (deckcodes.length === 0) {
    return [];
  }
  const isValid = deckcodes.map(isValidDeckstring);
  if (!isValid.every(i => i)) {
    return [];
  }
  const decks = isValid.map(convertDeck);
  if (!decks.every(i=>i)) {
    return [];
  }
  const cardsValid = decks.map(deck => validateCards(deck, true));
  if (cardsValid.some(i=>i)) {
    return [];
  }
  if (!decks.every((deck1,index1)=>decks.every((deck2, index2) => index2<=index1 || deck1.class!==deck2.class))) {
    return [];
  }
  return decks;
}

function parseSpecialist(deckcodes) {
  if (deckcodes.length !== 5) {
    return [];
  }
  const deck1 = isValidDeckstring(deckcodes[0]);
  const diffs1 = isValidDeckstring(deckcodes[0].substring(0,6)+deckcodes[1]);
  const diffs2 = isValidDeckstring(deckcodes[0].substring(0,6)+deckcodes[2]);
  const diffs3 = isValidDeckstring(deckcodes[0].substring(0,6)+deckcodes[3]);
  const diffs4 = isValidDeckstring(deckcodes[0].substring(0,6)+deckcodes[4]);
  if (!diffs1 || !diffs2 || !diffs3 || !diffs4) {
    return [];
  }
  const deck2 = combine(deck1, diffs1, diffs2);
  const deck3 = combine(deck1, diffs3, diffs4);
  const decks = [deck1, deck2, deck3].map(convertDeck);
  if (!decks.every(i=>i)) {
    return [];
  }
  const cardsValid = decks.map(deck => validateCards(deck, true));
  if (cardsValid.some(i=>i)) {
    return [];
  }
  if (!decks.every(deck=>decks[0].class===deck.class)) {
    return [];
  }
  if (cardDiff(decks[0], decks[1]) > 5 || cardDiff(decks[0], decks[2]) > 5) {
    return [];
  }
  return decks;
}

function combine(base, removed, added) {
  const cards = [...base.cards];
  removed.cards.forEach((cardArr) => {
    const id = cardArr[0];
    const count = cardArr[1];
    const idx = cards.findIndex(v=>v[0]===id);
    if (idx !== -1) { // This should be true in normal circumstances
      if (cards[idx][1]-count===0) {
        cards.splice(idx, 1);
      } else {
        cards[idx] = [id, cards[idx][1]-count];
      }
    }
  });
  added.cards.forEach((cardArr) => {
    const id = cardArr[0];
    const count = cardArr[1];
    const idx = cards.findIndex(v=>v[0]===id);
    if (idx !== -1) {
      cards[idx] = [id, cards[idx][1]+count];
    } else {
      cards.push([id, count]);
    }
  });
  return ({
    'cards': cards,
    'heroes': base.heroes,
    'format': base.format
  });
}

export function decodeDeck(deckstring) {
  const valid = isValidDeckstring(deckstring);
  if (!valid) {
    return null;
  }
  const deck = convertDeck(valid);
  return deck;
}
