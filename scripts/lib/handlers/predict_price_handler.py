from google.cloud import firestore

from lib.errors import raise_and_return_json_error
from lib.model.predict_house_price import predict_house_price


def predict_price_handler(request_json):
    # Check if model ID exists
    if 'model_id' not in request_json:
        return raise_and_return_json_error('Model ID is missing', 400)

    # Assumes at least one required field
    if 'input_features' not in request_json:
        return raise_and_return_json_error('No input_features provided', 400)

    print(f'Valuation requested using model: {request_json["model_id"]}')

    model_id = request_json['model_id']

    # Get Firestore client
    db = firestore.Client()

    model_doc = db.collection('models').document(model_id).get()

    if model_doc.exists:
        model_dict = model_doc.to_dict()
        metadata = model_dict['metadata']
    else:
        return raise_and_return_json_error('Metadata not found for model: {}'.format(model_id), 400)

    # Call the prediction function with input features and metadata
    return predict_house_price(request_json['input_features'], metadata)
