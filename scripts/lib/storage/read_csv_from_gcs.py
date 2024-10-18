import pandas as pd
from google.cloud import storage
import io


def read_csv_from_gcs(gcs_bucket_name, gcs_blob_name):
    # Initialise a client
    client = storage.Client()
    bucket = client.get_bucket(gcs_bucket_name)

    # Read data from GCS
    blob = storage.blob.Blob(gcs_blob_name, bucket)
    content = blob.download_as_text()

    # Convert to pandas DataFrame
    data = pd.read_csv(io.StringIO(content))

    return data
