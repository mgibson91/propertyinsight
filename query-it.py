import requests

# Replace with your API key and CSE ID
API_KEY = 'AIzaSyCyCUQ-bs52ncxJ4jrrk8-_kzKVdJ6vZx4'
CSE_ID = '05c76125572014b03'
query = '172 Ravenhill Avenue'

def google_search(query, api_key, cse_id):
    url = 'https://www.googleapis.com/customsearch/v1'
    params = {
        'key': api_key,
        'cx': cse_id,
        'q': query,
    }
    response = requests.get(url, params=params)
    return response.json()

results = google_search(query, API_KEY, CSE_ID)

# Extract the first result
items = results.get('items', [])
if items:
    first_item = items[0]
    print('Title:', first_item.get('title'))
    print('Link:', first_item.get('link'))
    print('Snippet:', first_item.get('snippet'))
else:
    print('No results found.')
