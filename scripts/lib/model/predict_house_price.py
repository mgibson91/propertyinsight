import json

import pandas as pd
import numpy as np
import xgboost as xgb
from flask import abort

from lib.model.get_cloud_model import get_cloud_model
from lib.model.get_local_model import get_local_model


def predict_house_price(input_features: dict[str, any], metadata: dict[str, any]):
    df_input = pd.DataFrame({
        feature_name: np.nan
        for feature_name in metadata['one_hot_adjusted_features']
    }, index=[0])

    # Store map of feature names to types
    feature_metadata = {}

    # Validate input_feature_metadata based on metadata
    for feature in metadata['input_feature_metadata']:
        if feature['type'] == 'categorical':
            feature_name = feature['feature']

            for column in df_input.columns:
                if column.startswith(feature_name):
                    df_input[column] = 0

        feature_name = feature['feature']
        feature_type = feature['type']

        is_required = feature.get('required', False)
        if is_required and feature_name not in input_features:
            abort(400, 'Required feature not found: {}'.format(feature_name))

        # Update feature_metadata with feature type
        feature_metadata[feature_name] = feature_type

    # Load XGBoost model
    model_file_name = f'{metadata["model_name"]}.json'
    model = get_cloud_model(model_file_name, 'property-insight-ai-models')
    # model = get_local_model(f'../models/{model_file_name}')

    # Overwrite any specified features
    for feature_name, value in input_features.items():
        feature_type = feature_metadata[feature_name]

        if feature_type == 'categorical':
            one_hot_key = feature_name + '_' + input_features[feature_name]

            if one_hot_key not in metadata['one_hot_adjusted_features']:
                print('Unrecognized one hot feature: {}'.format(one_hot_key))
            else:
                # Adjust feature name to be one hot
                df_input[one_hot_key] = 1

        # TODO: Check boolean also
        elif feature_name in df_input.columns:
            df_input[feature_name] = value

    # Perform prediction
    dtest = xgb.DMatrix(df_input)
    prediction = model.predict(dtest)

    # Prepare result
    result = {
        'result': float(prediction),
        'metadata': metadata,
    }

    return json.dumps(result)
