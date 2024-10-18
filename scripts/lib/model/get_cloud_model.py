from google.cloud import storage
import xgboost as xgb


def get_cloud_model(model_file_name: str, bucket_name: str):
    # Load the model file from Cloud Storage
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    blob = bucket.blob(model_file_name)

    # If this gets expensive, we can use .pkl format instead. It doesn't seem to work with byte array though
    # Download the file to a temporary file on disk
    local_model_path = '/tmp/model.json'
    blob.download_to_filename(local_model_path)

    model = xgb.Booster()
    model.load_model(local_model_path)

    return model
