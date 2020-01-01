import {decodeDeck} from '../src/deckutils';
import {getCard} from './api.js';
const url = require('url');
const mongodb = require('mongodb');
const uri = process.env.MONGODB_URI;

exports.routes = (app) => {
  app.route('/api/winners')
    .get((req, res) => {
      mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, (err, client)=> {
        if (err) {
          res.status(500).json({'error': err});
          return;
        }

        const db = client.db();
        const winners = db.collection('winners');
        winners.find().toArray(function (err, result) {
          if (err) {
            res.status(500).json({'error': err});
            client.close();
            return;
          }
          res.json(result);
          client.close();
        });
      });
    });
  app.route('/api/qualified')
    .get((req, res) => {
      mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, (err, client)=> {
        if (err) {
          res.status(500).json({'error': err});
          return;
        }

        const db = client.db();
        const winners = db.collection('winners');
        winners.find().toArray(function (err, result) {
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
      const deck = decodeDeck(deckstring);
      if (!deck) {
        res.status(400).json('Invalid Deckstring');
      } else {
        res.json(deck);
      }
    });
  app.route('/api/grandmasters')
    .get((req, res) => {
      mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, (err, client)=> {
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
      const region = req.query['region'];
      mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, (err, client)=> {
        if (err) {
            res.status(500).json({'error': err});
            return;
          }

        const db = client.db();
        const top8s = db.collection('top8');
        top8s.aggregate([
          { $project: {
              "numTop8s": {$size: {$filter: {input: "$tournaments", cond: {$eq: ["$$this.tournamentId",region]}}}},
              "tournaments": {$filter: {input: "$tournaments", cond: {$eq: ["$$this.tournamentId",region]}}},
              "_id": 1
            }
          },
          {$sort: {numTop8s: -1} },
          {$limit: 50}
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
  app.route('/api/card')
    .get((req, res) => {
      const cardId = req.query['id'];
      getCard(cardId, (err, card) => {
        if (err) {
          res.status(500).json(err);
          return;
        }
        res.json(card);
      });
    });
};
