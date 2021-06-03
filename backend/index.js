import {hsDecodeDeck} from './utils';
const url = require('url');
const mongodb = require('mongodb');
const uri = process.env.DB_URI;

exports.routes = (app) => {
  app.route('/api/qualified')
    .get((req, res) => {
      const startTime = new Date(req.query['startTime']);
      const endTime = new Date(req.query['endTime']);
      mongodb.MongoClient.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true}, (err, client)=> {
        if (err) {
          res.status(500).json({'error': err});
          return;
        }

        const db = client.db();
        const winners = db.collection('winners');
        winners.find({
          'startTime': {$gte: startTime, $lte: endTime}
        }).toArray(function (err, result) {
          if (err) {
            res.status(500).json({'error': err});
            client.close();
            return;
          }
          const qualified = result.map(a => {return {'_id':a['_id'], 'qualified':Array.isArray(a['name'])?a['name']:[a['name']]}});
          res.json(qualified);
          client.close();
        });
      });
    });
  app.route('/api/decode')
    .get((req, res) => {
      const query = url.parse(req.url).query;
      const i = query.indexOf('deckstring=');
      const deckstring = query.substr(i+'deckstring='.length);
      const result = hsDecodeDeck(deckstring);
      if (!result['success']) {
        res.status(400).json('Invalid Deckstring');
      } else {
        res.json(result['deck']);
      }
    });
  app.route('/api/grandmasters')
    .get((req, res) => {
      mongodb.MongoClient.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true}, (err, client)=> {
        if (err) {
          res.status(500).json({'error': err});
          return;
        }

        const db = client.db();
        const grandmasters = db.collection('grandmaster');
        grandmasters.findOne({_id: 'gm'}, (err, document) => {
          if (err) {
            res.status(500).json({'error': err});
            client.close;
            return;
          }
          res.json(document['data']);
          client.close();
        });
      });
    });
  app.route('/api/top8count')
    .get((req, res) => {
      const region = decodeURIComponent(req.query['region']);
      mongodb.MongoClient.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true}, (err, client)=> {
        if (err) {
          res.status(500).json({'error': err});
          return;
        }
        const db = client.db();
        const top8s = db.collection('top8');
        const regionfilter = region==='online'?
          {$filter: {input: "$tournaments", cond: {$or: [{$eq: ["$$this.tournamentId",'4']},{$eq: ["$$this.tournamentId",'pacific']}]}}} :
          {$filter: {input: "$tournaments", cond: {$eq: ["$$this.tournamentId",region]}}}
        top8s.aggregate([
          { $project: {
              "numTop8s": {$size: regionfilter},
              "tournaments": regionfilter,
              "_id": 1
            }
          },
          { $match: { "numTop8s": {$gte: 1}}},
          { $sort: {numTop8s: -1} }
        ]).toArray(function (err, result) {
          if (err) {
            res.status(500).json({'error': err});
            client.close;
            return;
          }
          res.json(result);
          client.close();
        });
      });
    });
  app.route('/api/leaderboardlor')
    .get((req, res) => {
      const region = decodeURIComponent(req.query['region']);
      mongodb.MongoClient.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true}, (err, client)=> {
        if (err) {
          res.status(500).json({'error': err});
          return;
        }
        const db = client.db();
        const leaderboards = db.collection('leaderboard_lor');
        leaderboards.findOne({_id: region}, (err, document) => {
          if (err) {
            res.status(500).json({'error': err});
            client.close;
            return;
          }
          if (document) {
            res.json(document['data']);
            client.close();
          } else {
            res.json([]);
            client.close();
          }
        });
      });
    });
};
