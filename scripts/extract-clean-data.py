# create table
#   public.property_listings (
#     source_id character varying not null,
#     price numeric not null,
#     currency character varying not null,
#     type public.property -
#     type not null,
#     bedrooms integer not null,
#     receptions integer not null,
#     metadata jsonb not null,
#     source public.listing - source not null,
#     id uuid not null default gen_random_uuid (),
#     specific_metadata jsonb null,
#     bathrooms smallint null,
#     constraint property_listings_pkey primary key (id)
#   ) tablespace pg_default;

# create table
#   public.addresses (
#     property_id uuid not null,
#     line1 character varying null,
#     line2 character varying null,
#     town character varying null,
#     postcode character varying null,
#     coordinates geography null,
#     constraint addresses_pkey primary key (property_id),
#     constraint addresses_property_id_fkey foreign key (property_id) references property_listings (id)
#   ) tablespace pg_default;

import pandas as pd
import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv(dotenv_path='.env.local')

DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')
DB_USER = os.getenv('DB_USER')

IGNORED_CSV_PATH = 'ignored_properties.csv'

def remove_empty_postcodes(df):
    """Remove rows with empty postcode values."""
    valid = df[df['postcode'].notna()]
    ignored = df[df['postcode'].isna()]
    ignored = ignored.assign(reason='Missing postcode')
    return valid, ignored[['id', 'reason']]

def remove_invalid_postcodes(df):
    """Remove rows with invalid postcode formats."""
    invalid_formats = df['postcode'].str.match(r'^BT$|^BT\d{1,2}$|^B$|^BT\d{3,}$')
    valid = df[~invalid_formats]
    ignored = df[invalid_formats]
    ignored = ignored.assign(reason='Invalid format')
    return valid, ignored[['id', 'reason']]

def add_adjusted_postcode(df):
    """Add a column with the postcode minus the last three characters if length > 4."""
    df['adjusted_postcode'] = df['postcode'].apply(lambda x: x[:-3] if len(x) > 4 else x)
    return df, pd.DataFrame(columns=['id', 'reason'])  # No ignored items

def project_final_columns(df):
    """Project only the price, receptions, adjusted_postcode as postcode, and include orig-postcode."""
    return df[['price', 'type', 'receptions', 'bedrooms', 'adjusted_postcode', 'postcode']].rename(
        columns={'adjusted_postcode': 'postcode', 'postcode': 'orig-postcode'}
    )

# Connect to the database
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)

# Query to fetch data excluding 'site' and 'land' types, filtering for GBP currency, and including address
query = """
    SELECT pl.id, pl.price, pl.type, pl.bedrooms, pl.receptions, a.line1, a.line2, a.town, a.postcode
    FROM public.property_listings pl
    JOIN public.addresses a ON pl.id = a.property_id
    WHERE pl.type NOT IN ('site', 'land') AND pl.currency = 'GBP'
"""

# Fetch data
with conn.cursor() as cursor:
    cursor.execute(query)
    columns = [desc[0] for desc in cursor.description]
    data = cursor.fetchall()
    df = pd.DataFrame(data, columns=columns)

# Initialize ignored DataFrame
ignored_df = pd.DataFrame(columns=['id', 'reason'])

# Apply transformation functions
transformations = [remove_empty_postcodes, remove_invalid_postcodes, add_adjusted_postcode]
for transform in transformations:
    df, ignored = transform(df)
    ignored_df = pd.concat([ignored_df, ignored], ignore_index=True)

# Apply post-transformation projection
df = project_final_columns(df)

# Output valid data to CSV
df.to_csv('output.csv', index=False)

# Output ignored data to a rolling CSV
ignored_df.to_csv(IGNORED_CSV_PATH, index=False)

conn.close()
