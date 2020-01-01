const request = require('request');
const querystring = require('querystring');
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const OAUTH_URI = 'https://us.battle.net/oauth/token';

function genToken(callback) {
  request.post({
    url: OAUTH_URI,
    method: 'POST',
    form: {'grant_type' : 'client_credentials'},
    auth: {
      user: clientId,
      pass: clientSecret
    }
  }, (err, resp, body) => {
    if (err) {
      callback(err, null);
    } else {
      try {
        const token = JSON.parse(body)['access_token'];
        callback(err, token);
      } catch (err) {
        callback(err, null);
      }
    }
  });
}

export function getCard(id, callback) {
  genToken(function (err, token) {
    if (err) {
      callback(err, null);
    }
    const card_uri = `https://us.api.blizzard.com/hearthstone/cards/${id}`
    request.get({
      url: card_uri,
      qs: {
        access_token: token,
        locale: 'en_US'
      }
    }, (err, resp, body) => {
      if (err) {
        callback(err, null);
      } else if (resp.statusCode !== 200) {
        callback(body, null);
      } else {
        try {
          const card = JSON.parse(body);
          callback(err, card);
        } catch (err) {
          callback(err, null);
        }
      }
    });
  });
}

export function deckCode(deckcode, callback) {
  genToken(function (err, token) {
    if (err) {
      callback(err, null);
    }
    const deck_uri = `https://us.api.blizzard.com/hearthstone/deck/${deckcode}`
    request.get({
      url: deck_uri,
      qs: {
        access_token: token,
        locale: 'en_US'
      }
    }, (err, resp, body) => {
      if (err) {
        callback(err, null);
      } else {
        try {
          const deck = JSON.parse(body);
          callback(err, deck);
        } catch (err) {
          callback(err, null);
        }
      }
    });
  });
}

