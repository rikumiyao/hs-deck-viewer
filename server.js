const backend = require('./backend/index.js');
const express = require('express');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const DEFAULT_TITLE = 'YAYtears';
const DEFAULT_DESCRIPTION = "Explore Hearthstone Tournament Decklists";
const DEFAULT_IMAGE = 'https://d33jl3tgfli0fm.cloudfront.net/helix/images/games/hearthstone-heroes-of-warcraft/icon.png';

function setMeta(title, description, image) {
  return (request) => {
    return {
      title: title,
      description:description,
      image:image
    }
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
      metaTags = setMetaFunc(request);
      data = data.replace(/\$OG_URL/g, 'yaytears.com' + request.originalUrl)
      data = data.replace(/\$OG_TITLE/g, metaTags['title']);
      data = data.replace(/\$OG_DESCRIPTION/g, metaTags['description']);
      result = data.replace(/\$OG_IMAGE/g, metaTags['image']);
      response.send(result);
    });
  });
}

createRoute(/\/specialist\/(.+)/, setMeta(DEFAULT_TITLE, 'View Specialist Lineups', DEFAULT_IMAGE));
createRoute('/specialist', setMeta(DEFAULT_TITLE, 'Create Specialist Lineups', DEFAULT_IMAGE));
createRoute('/conquest', setMeta(DEFAULT_TITLE, 'Create Conquest Lineups', DEFAULT_IMAGE));
createRoute(/\/battlefy(\/.*)?/, setMeta(DEFAULT_TITLE, 'Hearthstone Masters Cup Decks', DEFAULT_IMAGE));
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