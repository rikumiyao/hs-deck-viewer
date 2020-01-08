const https = require('https');
const mongodb = require('mongodb')

const uri = process.env.MONGODB_URI;

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
      console.log(url);
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

function updateTournaments(isSync, start, end) {
  let startDate = new Date();
  let endDate = new Date();
  if (isSync) {
    startDate = new Date(start);
    endDate = new Date(end);
  } else {
    startDate.setDate(startDate.getDate()-1);
  }
  const fetchTourneysURL = `https://majestic.battlefy.com/hearthstone-masters/tournaments?start=${startDate.toJSON()}&end=${endDate.toJSON()}`;
  httpGet(fetchTourneysURL, {}, processTournaments);
}

function handleSwiss(id, slug, tournamentLoc, tournamentNum, stageId, top8Id) {
  if (top8Id) {
    const fetchTop8Url = `https://dtmwra1jsgyb0.cloudfront.net/stages/${top8Id}/standings`;
    httpGet(fetchTop8Url, {}, standings => processTop8(id, slug, standings, tournamentLoc, tournamentNum));
  }
}

function handleSingleElim(id, slug, tournamentLoc, tournamentNum, stageId) {
  const fetchStandingsUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${stageId}/standings`;
  httpGet(fetchStandingsUrl, {}, standings => {
    handleSingleElimStandings(id, slug, standings, tournamentLoc, tournamentNum);
  });
}

function handleSingleElimStandings(id, slug, standings, tournamentLoc, tournamentNum) {
  const qualified = standings.filter(e=>e['place']<=1).map(a=>a['team']['name']);
  if (qualified.length != 0) {
    writeWinner(id, qualified);
  }
  const top8 = standings.filter(e=>e['place']<=8).map(x=>x['team']['name']).filter(x=>x);
  writeTop8(id, slug, top8, tournamentLoc, tournamentNum);
}

function manualTop8(id, slug, tournamentLoc, tournamentNum) {
  const fetchTourneyURL = `https://dtmwra1jsgyb0.cloudfront.net/tournaments/${id}`
  httpGet(fetchTourneyURL, {}, result=> {
    const stageId = result['stageIDs'][1];
    if (stageId) {
      const fetchStandingsUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${stageId}/standings`;
      httpGet(fetchStandingsUrl, {}, standings => {
        processTop8(id, slug, standings, tournamentLoc, tournamentNum);
      });
    }
  });
}

function processTournaments(data) {
  data.forEach(tournament => {
    const id = tournament['_id'];
    const fetchTourneyURL = `https://dtmwra1jsgyb0.cloudfront.net/tournaments/${id}`
    httpGet(fetchTourneyURL, {}, result=> {
      const stageId = result['stageIDs'][0];
      const top8Id = result['stageIDs'][1];
      const slug = result['slug'];
      const parts = slug.split('-');
      const tournamentLoc = parts[parts.length-2];
      const tournamentNum = parseInt(parts[parts.length-1], 10);
      const fetchBracketUrl = `https://dtmwra1jsgyb0.cloudfront.net/stages/${stageId}`;
      if (stageId) {
        httpGet(fetchBracketUrl, {}, res => {
          if (res['bracket']['type']) {
            if (res['bracket']['type']==='swiss'||res['bracket']['type']==='custom') {
              handleSwiss(id, slug, tournamentLoc, tournamentNum, stageId, top8Id);
            } else {
              handleSingleElim(id, slug, tournamentLoc, tournamentNum, stageId);
            }
          }
        });
      }
    });
  });
}

function processTop8(id, slug, standings, tournamentLoc, tournamentNum) {
  const top2 = tournamentLoc === 'seoul' && tournamentNum >= 133 || tournamentLoc === 'bucharest';
  const qualified = top2 ? standings.filter(e=>e['place']<=2).map(a=>a['team']['name']) : standings.filter(e=>e['place']<=1).map(a=>a['team']['name']);
  if (qualified.length != 0) {
    writeWinner(id, qualified);
  }
  const top8 = standings.map(x=>x['team']['name']).filter(x=>x);
  writeTop8(id, slug, top8, tournamentLoc, tournamentNum);
}

function writeTop8(id, slug, players, tournamentLoc, tournamentNum) {
  mongodb.MongoClient.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true}, (err, client) => {
    if (err) throw err;

    const db = client.db();
    const top8 = db.collection('top8');
    let count = 0;
    players.map(name => {
      top8.updateOne({_id: name},{$addToSet: {tournaments: {id: id, slug: slug, tournamentId: tournamentLoc, tournamentNum: tournamentNum}}}, {upsert:true}, (err, res) => {
        if (err) throw err;
        count += 1;
        if (count >= players.length) {
          client.close();
        }
      });
    });
  });
}

function writeWinner(id, name) {
  mongodb.MongoClient.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true}, (err, client) => {
    if (err) throw err;

    const db = client.db();
    const winners = db.collection('winners');
    winners.updateOne({_id: id},{$set: {name: name}}, {upsert:true}, (err, res) => {
      if (err) throw err;
      client.close();
    });
  });
}

function updateGrandmaster() {
  const url = 'https://playhearthstone.com/en-us/api/esports/schedule/grandmasters/';
  httpGet(url, {}, handleGrandmaster);
}

function handleGrandmaster(gmData) {
  const tournaments = gmData.requestedSeasonTournaments;
  const data = [];
  tournaments.forEach(tournament => {
    tournament.stages.forEach(stage => {
      stage.brackets.forEach(bracket => {
        bracket.matches.forEach(match => {
          const player1 = match.competitors[0] ? match.competitors[0].name : '';
          const player2 = match.competitors[1] ? match.competitors[1].name : '';
          let player1Decks;
          if (!match.attributes.competitor_1) {
            player1Decks = []
            player2Decks = []
          } else {
            player1Decks = match.attributes.competitor_1.decklist.map(a=>a['deckCode']);
            player2Decks = match.attributes.competitor_2.decklist.map(a=>a['deckCode']);
          }
          const score = match.scores.map(a=>a.value);
          const id = match.id;
          const startDate = match.startDate;
          const matchData = {
            id: id,
            competitor_1: player1,
            competitor_2: player2,
            competitor_1_decks: player1Decks,
            competitor_2_decks: player2Decks,
            score: score,
            startDate: startDate
          };
          if ((player1 || player2) && startDate) {
            data.push(matchData);
          }
        });
      });
    });
  });
  data.sort((a,b) => a.startDate - b.startDate);
  writeGmData(data);
}

function writeGmData(gmData) {
  mongodb.MongoClient.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true}, (err, client) => {
    if (err) throw err;

    const db = client.db();
    const gm = db.collection('grandmaster');
    gm.updateOne({_id: 'gm'},{$set: {data: gmData}}, {upsert: true}, (err, res) => {
        if (err) throw err;
        client.close();
      });
  });
}

function update(type, args) {
  if (type === 'manual') {
    const id = args['id'];
    const slug = args['slug'];
    const tournamentLoc = args['tournamentLoc'];
    const tournamentNum = args['tournamentNum'];
    manualTop8(id, slug, tournamentLoc, tournamentNum);
  } else if (type === 'grandmaster') {
    updateGrandmaster()
  } else if (type === 'sync') {
    const start = args['start'];
    const end = args['sync'];
    updateGrandmaster();
    updateTournaments(true, start, end);
  } else {
    updateGrandmaster();
    updateTournaments();
  }
}

module.exports = update;