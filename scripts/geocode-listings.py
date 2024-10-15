import requests
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path='.env.local')

API_KEY = os.getenv('OPENCAGE_API_KEY')
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')
DB_USER = os.getenv('DB_USER')

GEOCODE_URL = 'https://api.opencagedata.com/geocode/v1/json'

def geocode_address(address):
    params = {
        'q': address,
        'key': API_KEY,
        'limit': 1
    }
    response = requests.get(GEOCODE_URL, params=params)
    if response.status_code == 200:
        results = response.json().get('results')
        if results:
            return results[0]['geometry']['lat'], results[0]['geometry']['lng']
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

    conn.close()

if __name__ == '__main__':
    main()
