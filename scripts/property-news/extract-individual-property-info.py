import requests
import psycopg2
import json
import os
import time
import random
import csv
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('../.env.local')

# Database connection parameters from environment variables
db_params = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT')
}

# API base URL
API_BASE_URL = "https://beta-api.propertynews.com/v3/property/"

def get_property_data(source_id):
    url = f"{API_BASE_URL}{source_id}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data for source_id: {source_id}")
        return None

def update_specific_metadata():
    conn = psycopg2.connect(**db_params)
    failures = []
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Fetch property listings without specific_metadata
            cur.execute("SELECT id, source_id FROM public.property_listings WHERE specific_metadata IS NULL")
            listings = cur.fetchall()

            for index, listing in enumerate(listings, 1):
                property_data = get_property_data(listing['source_id'])
                if property_data:
                    # Update the specific_metadata column
                    cur.execute(
                        "UPDATE public.property_listings SET specific_metadata = %s WHERE id = %s",
                        (json.dumps(property_data), listing['id'])
                    )
                    if index % 20 == 0:
                        print(f"Updated {index} listings. Last updated listing id: {listing['id']}")
                else:
                    print(f"Skipping update for listing id: {listing['id']} due to API error")
                    failures.append({'id': listing['id'], 'source_id': listing['source_id']})

                # Random delay between 0 and 1 second
                time.sleep(random.uniform(0, 1))

            conn.commit()
            print(f"All {len(listings)} listings processed. {len(listings) - len(failures)} updated successfully")

    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

    # Log failures to CSV
    if failures:
        with open('failed_updates.csv', 'w', newline='') as csvfile:
            fieldnames = ['id', 'source_id']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for failure in failures:
                writer.writerow(failure)
        print(f"Failed updates logged to failed_updates.csv")

if __name__ == "__main__":
    update_specific_metadata()
