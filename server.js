const backend = require('./backend/index.js');
const utils = require('./backend/utils.js');
const express = require('express');
const fs = require('fs');
const axios = require('axios');
const url = require('url');
const cronJob = require('./scripts/cron');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const DEFAULT_TITLE = 'YAYtears';
const DEFAULT_DESCRIPTION = "Explore Hearthstone Tournament Decklists";
const DEFAULT_IMAGE = 'https://d33jl3tgfli0fm.cloudfront.net/helix/images/games/hearthstone-heroes-of-warcraft/icon.png';

function createDeckTitle(decks, mode) {
  const classes = _.uniq(decks.map(deck => _.capitalize(deck.class)));
  return `${classes.join('/')}: ${mode!=='deck' ? _.capitalize(mode): 'Hearthstone'} Decks`;
}

function setMeta(title, description, image) {
  return (request, callback) => {
    callback({
      title: title,
      description: description,
      image: image
    });
  }
}

const DEFUALT_META = setMeta(DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE);

function createRoute(pathspec, setMetaFunc) {
  app.get(pathspec, function(request, response) {
    const filePath = path.resolve(__dirname, './build', 'index.html');
    fs.readFile(filePath, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      const metaTags = setMetaFunc(request, metaTags => {
        data = data.replace(/\$OG_URL/g, 'https://yaytears.com' + request.originalUrl)
        data = data.replace(/\$OG_TITLE/g, metaTags['title']);
        data = data.replace(/\$OG_DESCRIPTION/g, metaTags['description']);
        const result = data.replace(/\$OG_IMAGE/g, metaTags['image']);
        response.send(result);
      });
    });
  });
}

function setBattlefyMeta(req, callback) {
  const path = req.url;
  const components = path.split('/');
  const id = components[2];
  const name = components[3];
  if (!id || id === 'week' || id === 'top8') {
    callback({title: DEFAULT_TITLE, description: 'Hearthstone Masters Cup Decks', image: DEFAULT_IMAGE});
    return;
  }
  const fetchTourneyURL = `https://dtmwra1jsgyb0.cloudfront.net/tournaments/${id}`;
  axios.get(fetchTourneyURL, {timeout: 10*1000})
    .then(response => {
      try {
        const data = response.data;
        if (name) {
          callback({
            title: `${_.escape(decodeURIComponent(name))}`,
            description: `View ${_.escape(decodeURIComponent(name))}'s Decks for ${_.escape(data['name'])}`,
            image: DEFAULT_IMAGE
          });
        } else {
          callback({
            title: _.escape(data['name']),
            description: `View Decks for ${_.escape(data['name'])}`,
            image: DEFAULT_IMAGE
          });
        }
      }
      catch (e) {
        callback({title: DEFAULT_TITLE, description: 'Hearthstone Masters Cup Decks', image: DEFAULT_IMAGE});
      }
    })
    .catch(err => {
      callback({title: DEFAULT_TITLE, description: 'Hearthstone Masters Cup Decks', image: DEFAULT_IMAGE});
      return;
    });
}

function setDeckViewerMeta(req, callback) {
  const path = req.url;
  const components = path.split('/');
  const mode = components[1];
  const codes = decodeURIComponent(components[2]);
  if (!codes) {
    callback({title: DEFAULT_TITLE, description: 'Create Hearthstone Decks', image: DEFAULT_IMAGE});
    return;
  }
  const deckcodes = codes.split('.');
  const decks = deckcodes.map(utils.hsDecodeDeck);
  if (!decks.every(deck=>deck.success)) {
    callback({title: DEFAULT_TITLE, description: 'Create Hearthstone Decks', image: DEFAULT_IMAGE});
    return;
  }
  const title = createDeckTitle(decks.map(deck => deck.deck), mode);
  callback({title: title, description: `View Hearthstone ${mode!=='deck' && _.capitalize(mode) + ' ' || ''}Decks`, image: DEFAULT_IMAGE});
}

createRoute(/\/specialist(\/.*)?/, setDeckViewerMeta);
createRoute(/\/conquest(\/.*)?/, setDeckViewerMeta);
createRoute(/\/deck(\/.*)/, setDeckViewerMeta);
createRoute(/\/battlefy(\/.*)?/, setBattlefyMeta);
createRoute(/\/grandmasters\/(\/.*)?/, setMeta(DEFAULT_TITLE, 'Hearthstone Grandmasters Decks', DEFAULT_IMAGE));
createRoute('/grandmasters', setMeta(DEFAULT_TITLE, 'Hearthstone Grandmasters Decks', DEFAULT_IMAGE));
createRoute(/\/runeterra(\/.*)?/, setMeta(DEFAULT_TITLE, 'Runeterra', DEFAULT_IMAGE));
createRoute('/', setMeta(DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE));

backend.routes(app);

app.use(express.static(path.resolve(__dirname, './build')));

app.get('*', function(request, response) {
  const filePath = path.resolve(__dirname, './build', 'index.html');
  response.sendFile(filePath);
});
cronJob.startCronJob();
app.listen(port, () => console.log(`Listening on port ${port}`));
