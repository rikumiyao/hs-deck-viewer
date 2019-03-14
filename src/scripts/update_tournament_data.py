import requests
from datetime import datetime, timedelta

date = datetime.utcnow()
date_prev = date + timedelta(days=-1)
print(date)
fetchTourneyURL = 'https://majestic.battlefy.com/hearthstone-masters/tournaments?start={}&end={}'.format(date_prev.isoformat(),date.isoformat())
f = requests.get(fetchTourneyURL)
print(f.json())
