import requests
import json
import api
CARDS_URL = 'https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json'

def getCardsJson():
  r = requests.get(CARDS_URL)
  data = r.json()
  for index, card in enumerate(data):
    data[index] = {
      'cardClass': card['cardClass'],
      'dbfId': card['dbfId'],
      'name': card['name'],
      'id': card['id'],
      'rarity': card['rarity'],
      'set': card['set']
    }
    if 'cost' in card:
      data[index]['cost'] = card['cost']
    cardInfo = api.getCard(card['dbfId'])
    if cardInfo:
      data[index]['image'] = cardInfo['image']
    else:
      print('No card data found for {} ({})'.format(card['name'], card['dbfId']))
  return data

print("Fetching cards from {}".format(CARDS_URL))
data = getCardsJson()

with open('../src/resources/cards.compact.json', 'w') as file:
  json.dump(data, file)