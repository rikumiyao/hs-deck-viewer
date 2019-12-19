import requests
import json

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
      'rarity': card['rarity']
    }
    if 'cost' in card:
      data[index]['cost'] = card['cost']
  return data
data = getCardsJson()

with open('../src/resources/cards.compact.json', 'w') as file:
  json.dump(data, file)