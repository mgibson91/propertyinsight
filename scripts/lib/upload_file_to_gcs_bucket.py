from google.cloud import storage

def upload_file_to_gcs_bucket(bucket_name, source_file_name, destination_blob_name):
    """
    Uploads a file to a Google Cloud Storage bucket.

    :param bucket_name: The name of the bucket to upload the file to.
    :param source_file_name: The local file path of the file to be uploaded.
    :param destination_blob_name: The name of the file in the bucket.
    :return: The public URL of the uploaded file.
    """
    # Initialize a storage client
    storage_client = storage.Client()

    # Get the bucket
    bucket = storage_client.bucket(bucket_name)

    # Create a blob and upload the file to the bucket
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)

    # Make the file public
    blob.make_public()

    # Return the public URL of the uploaded file
    return blob.public_url
