import xgboost as xgb


def get_local_model(model_file_name: str):
    model = xgb.Booster()
    model.load_model(model_file_name)

    return model
