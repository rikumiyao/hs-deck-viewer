import requests
import constants

oauthurl = 'https://us.battle.net/oauth/token'
auth = ( constants.clientid, constants.clientsecret )
body = {
    'grant_type' : 'client_credentials'
}

r = requests.post(oauthurl, data=body, auth=auth)

token = r.json()['access_token']
def getCards(page=0):
    params = {
        'region' : 'us',
        'locale' : 'en_US',
        'access_token' : token,
        'collectible' : 1,
        'page': page
    }
    
    url = 'https://us.api.blizzard.com/hearthstone/cards'
    r = requests.get(url, params=params)
    return r.json()

def getCard(id):
    for i in range(3):
        params = {
            'region' : 'us',
            'locale' : 'en_US',
            'access_token' : token
        }
        url = 'https://us.api.blizzard.com/hearthstone/cards/{}'.format(id)
        r = requests.get(url, params=params)
        if r.status_code == 200:
            return r.json()
    return ''
