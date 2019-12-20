const backend = require('./backend/index.js');
const express = require('express');
const fs = require('fs');
const request = require('request');
const url = require('url');

const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const DEFAULT_TITLE = 'YAYtears';
const DEFAULT_DESCRIPTION = "Explore Hearthstone Tournament Decklists";
const DEFAULT_IMAGE = 'https://d33jl3tgfli0fm.cloudfront.net/helix/images/games/hearthstone-heroes-of-warcraft/icon.png';

function setMeta(title, description, image) {
  return (request, callback) => {
    callback({
      title: title,
      description:description,
      image:image
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
  try {
    const path = req.url;
    components = path.split('/');
    id = components[2];
    if (!id || id === 'week') {
      callback({title: DEFAULT_TITLE, description: 'Hearthstone Masters Cup Decks', image: DEFAULT_IMAGE});
      return;
    }
    const fetchTourneyURL = `https://dtmwra1jsgyb0.cloudfront.net/tournaments/${id}`;
    request.get(fetchTourneyURL, (err, body, response) => {
      if (err) {
        callback({title: DEFAULT_TITLE, description: 'Hearthstone Masters Cup Decks', image: DEFAULT_IMAGE});
        console.log(err);
        return;
      }
      const data = JSON.parse(response);
      callback({
        title: data['name'],
        description: `View Decks for ${data['name']}`,
        image: DEFAULT_IMAGE
      });
    });
  } catch (e) {
    callback({title: DEFAULT_TITLE, description: 'Hearthstone Masters Cup Decks', image: DEFAULT_IMAGE});
  }
  
}

createRoute(/\/specialist\/(.+)/, setMeta(DEFAULT_TITLE, 'View Specialist Lineups', DEFAULT_IMAGE));
createRoute('/specialist', setMeta(DEFAULT_TITLE, 'Create Specialist Lineups', DEFAULT_IMAGE));
createRoute('/conquest', setMeta(DEFAULT_TITLE, 'Create Conquest Lineups', DEFAULT_IMAGE));
createRoute(/\/battlefy(\/.*)?/, setBattlefyMeta);
createRoute(/\/grandmasters\/([0-9]+)/, setMeta(DEFAULT_TITLE, 'Hearthstone Grandmasters Decks', DEFAULT_IMAGE));
createRoute('/grandmasters', setMeta(DEFAULT_TITLE, 'Hearthstone Grandmasters Decks', DEFAULT_IMAGE));
createRoute('/', setMeta(DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE));

backend.routes(app);

app.use(express.static(path.resolve(__dirname, './build')));

app.get('*', function(request, response) {
  const filePath = path.resolve(__dirname, './build', 'index.html');
  response.sendFile(filePath);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
