import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split

from lib.get_normalised_importance import get_normalized_importance
from lib.training.get_regression_metrics import get_regression_metrics


def train_xgb_model(csv_file, x_fields, x_dummy_fields, feature_metadata, general_metadata):
    # Load data
    data = pd.read_csv(csv_file)

    # Select only the columns you need
    X = data[x_fields]
    y = data[['price']]

    # Preprocess the data
    X = pd.get_dummies(X, columns=x_dummy_fields)

    # Split the data into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Create DMatrix for training and evaluation
    dtrain = xgb.DMatrix(X_train, label=y_train)
    dtest = xgb.DMatrix(X_test, label=y_test)

    # Define XGBoost parameters
    params = {
        'objective': 'reg:squarederror',
        "tree_method": "hist",
    }

    num_boost_round = 1000

    # Train the model
    evals_result = {}
    bst = xgb.train(
        params,
        dtrain,
        num_boost_round,
        evals=[(dtrain, "train"), (dtest, "eval")],
        evals_result=evals_result,
        verbose_eval=False,
        early_stopping_rounds=30
    )

    # Get accuracy metrics
    y_pred = bst.predict(dtest)

    metrics_dict = get_regression_metrics(y_test, y_pred, csv_file)

    # Get normalised importance
    importance = get_normalized_importance(bst)

    metadata = {
        'model_name': general_metadata['model_name'],
        'description': general_metadata['description'],
        'constraints': general_metadata['constraints'],
        'sample_size': X.shape[0],
        'accuracy_metrics': metrics_dict,
        'importance': importance,
        'input_feature_metadata': feature_metadata,
        'one_hot_adjusted_features': [col for col in X.columns],
    }

    return {
        'model': bst,
        'metadata': metadata
    }
