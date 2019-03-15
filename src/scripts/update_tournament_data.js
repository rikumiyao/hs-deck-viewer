const https = require('https');
const fs = require('fs');
const { encode, decode, FormatType } = require('deckstrings');

const data = fs.readFileSync('src/resources/cards.collectible.json');
const jsonData = JSON.parse(data);
const cardsDict = {}

jsonData.forEach(card => cardsDict[card.dbfId] = card);

function findDeckCode(text, hasNewLine) {
  if (hasNewLine) {
    const regex = /^AAE([A-Za-z0-9+=/](?: ?))+/m;
    return text.match(regex)[0];
  } else {
    const regex = /AAE([A-Za-z0-9+=/](?: ?))+/;
    return text.match(regex)[0];
  }
}

function httpGet(url, options, callback) {
  return https.get(url, options, (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];
    let error;
    if (statusCode != 200) {
      error = new Error('Request Failed.\n' + 
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' + 
          `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.log(error.message);
      res.resume();
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => {rawData += chunk;});
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        callback(parsedData);
      } catch (e) {
        console.log(e.message);
      }
    });
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });
}

function updateTournaments(sync) {
  const date = new Date();
  let startDate = new Date(date);
  if (sync==='sync') {
    startDate = new Date('3/5/2019');
  } else {
    startDate.setDate(date.getDate()-1);
  }
  const fetchTourneysURL = `https://majestic.battlefy.com/hearthstone-masters/tournaments?start=${startDate.toJSON()}&end=${date.toJSON()}`;
  httpGet(fetchTourneysURL, {}, processTournaments);
}

function processTournaments(data) {
  data.forEach(tournament => {
    const id = tournament['_id'];
    const fetchTourneyURL = `https://dtmwra1jsgyb0.cloudfront.net/tournaments/${id}`
    httpGet(fetchTourneyURL, {}, result=> {
      const stageId = result['stageIDs'][0];
      if (stageId) {
        const fetchBracketUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${stageId}/matches?roundNumber=1`;
        httpGet(fetchBracketUrl, {}, data => {processBracket(data, id)});
      }
    });
  });
}

function processBracket(data, tournamentId) {
  const playerClasses = {};
  function recurse(i) {
    if (i >= data.length) {
      const json = JSON.stringify(playerClasses);
      const dir = 'src/resources/tournamentData'; 
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      fs.writeFile(`src/resources/tournamentData/${tournamentId}.json`, json, 'utf8', err => {
        if (err) {
          console.log('error in writing file '+`../resources/tournamentData/${tournamentId}.json`);
        }
      });
      return;
    }
    const id = data[i]['_id']
    const fetchURL = `https://dtmwra1jsgyb0.cloudfront.net/matches/${id}?extend%5Btop.team%5D%5Bplayers%5D%5Buser%5D=true&extend%5Bbottom.team%5D%5Bplayers%5D%5Buser%5D=true`;
    httpGet(fetchURL, {}, match => {
      ['top', 'bottom'].forEach(i => {
        if (match[0][i]['team']) {
          const playername = match[0][i]['team']['name'];
          const deck = match[0][i]['team']['players'][0]['gameAttributes']['deckStrings'][0];
          let deckcode = findDeckCode(deck);
          let deckCards;
          for (var i=0;i<3;i++) {
            try {
              deckCards = decode(deckcode);
            } catch(e) {
              console.log(deck);
              deckcode = deckcode + '=';
            }
          }
          const heroClass = cardsDict[deckCards.heroes[0]]['cardClass'].toLowerCase();
          playerClasses[playername] = heroClass;
        }
      });
      recurse(i+1);
    });
  }
  recurse(0);
}

const sync = process.argv[2]
updateTournaments(sync);