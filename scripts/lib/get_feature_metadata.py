def get_feature_metadata(features, required=None, categorical=None, one_hot_adjusted_features=None):
    # Check that all required and categorical features are present in the input features list
    if required and not all(feature in features for feature in required):
        raise ValueError("One or more required features are missing from the input features list.")
    if categorical and not all(feature in features for feature in categorical):
        raise ValueError("One or more categorical features are missing from the input features list.")

    # Create the metadata list
    input_feature_metadata = []
    for feature in features:
        metadata_dict = {"feature": feature}
        if feature in required:
            metadata_dict["required"] = True
        if feature in categorical:
            metadata_dict["categorical"] = True
        input_feature_metadata.append(metadata_dict)

    return {
        'input': input_feature_metadata,
        "one_hot_adjusted": [col for col in one_hot_adjusted_features],
    }

