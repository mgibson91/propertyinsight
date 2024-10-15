import requests
import psycopg2
from dotenv import load_dotenv
import os
import time

load_dotenv(dotenv_path='.env.local')

MAPBOX_API_KEY = os.getenv('MAPBOX_API_KEY')
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')
DB_USER = os.getenv('DB_USER')

GEOCODE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places'
REQUEST_SLEEP_INTERVAL_MS = int(os.getenv('REQUEST_SLEEP_INTERVAL_MS', 1000))

def geocode_address(address):
    url = f"{GEOCODE_URL}/{requests.utils.quote(address)}.json"
    params = {
        'access_token': MAPBOX_API_KEY,
        'limit': 1
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        results = response.json()
        if results['features']:
            coordinates = results['features'][0]['geometry']['coordinates']
            return coordinates[1], coordinates[0]  # lat, lng
    return None, None

def update_coordinates(conn, property_id, lat, lng):
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE public.addresses
            SET coordinates = postgis.ST_Point(%s, %s)
            WHERE property_id = %s
        """, (lng, lat, property_id))
        conn.commit()

def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT pl.id, a.line1, a.line2, a.town, a.postcode
            FROM public.property_listings pl
            LEFT JOIN public.addresses a ON pl.id = a.property_id
            WHERE pl.type NOT IN ('site', 'land') AND a.coordinates IS NULL
        """)
        listings = cursor.fetchall()

    count = 0
    for property_id, line1, line2, town, postcode in listings:
        address = ', '.join(filter(None, [line1, line2, town, postcode]))
        lat, lng = geocode_address(address)
        if lat and lng:
            try:
                update_coordinates(conn, property_id, lat, lng)
            except Exception as e:
                print(f"Failed to update coordinates for property_id {property_id} with lat: {lat}, lng: {lng}. Error: {e}")
        count += 1
        if count % 50 == 0:
            print(f"Processed {count} records")
        time.sleep(REQUEST_SLEEP_INTERVAL_MS / 1000.0)

    conn.close()

if __name__ == '__main__':
    main()
