const url = require('url');
const mongodb = require('mongodb');
const uri = process.env.MONGODB_URI;

exports.routes = (app) => {
  app.route('/api/classes')
    .get((req, res) => {
      const id = req.query.id;
      mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, (err, client)=> {
        if (err) throw err;

        const db = client.db();
        const heroClasses = db.collection('classes');
        const query = { _id: id };
        heroClasses.find(query).toArray(function (err, result) {
          if (err) throw err;
          res.json(result.map(data=>data['classes']));
          client.close();
        });
      });
    });
  app.route('/api/winners')
    .get((req, res) => {
      mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, (err, client)=> {
        if (err) throw err;

        const db = client.db();
        const winners = db.collection('winners');
        winners.find().toArray(function (err, result) {
          if (err) throw err;
          res.json(result);
          client.close();
        });
      });
    });
  app.route('/api/qualified')
    .get((req, res) => {
      mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, (err, client)=> {
        if (err) throw err;

        const db = client.db();
        const winners = db.collection('winners');
        winners.find().toArray(function (err, result) {
          if (err) throw err;
          const qualified = result.map(a => {return {'_id':a['_id'], 'qualified':Array.isArray(a['name'])?a['name']:[a['name']]}});
          res.json(qualified);
          client.close();
        });
      });
    });
  app.route('/api/grandmasters')
    .get((req, res) => {
      mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, (err, client)=> {
        if (err) throw err;

        const db = client.db();
        const grandmasters = db.collection('grandmaster');
        grandmasters.findOne({_id: 'gm'}, (err, document) => {
          if (err) throw err;
          res.json(document['data']);
          client.close();
        });
      });
    });
  app.route('/api/top8count')
    .get((req, res) => {
      const region = req.query['region'] ? req.query['region'] : 'bucharest';
      mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, (err, client)=> {
        if (err) throw err;

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
          if (err) throw err;
          res.json(result);
          client.close();
        });
      });
    });
};
