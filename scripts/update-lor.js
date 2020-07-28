
const https = require('https');
const mongodb = require('mongodb')

const uri = process.env.DB_URI;
const RIOT_KEY = process.env.RIOT_PROD;

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

function update() {
  regions = ['americas', 'europe', 'asia', 'sea'];
  regions.forEach(region=> {
    const reqUrl = `https://${region}.api.riotgames.com/lor/ranked/v1/leaderboards`;
    headers = {
      "X-Riot-Token": RIOT_KEY
    }
    httpGet(reqUrl, {headers}, (data) => writeToDB(region, data));
  })
}

function writeToDB(region, data) {
  mongodb.MongoClient.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true}, (err, client) => {
    if (err) throw err;

    const db = client.db();
    const leaderboard = db.collection(`leaderboard_lor`);
    leaderboard.updateOne({_id: region},{$set: {data: data.players}}, {upsert: true}, (err, res) => {
        if (err) throw err;
        client.close();
      });
  });
}

if (require.main === module) {
  update()
}

module.exports = update;
