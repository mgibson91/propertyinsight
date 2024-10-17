import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split

from lib.get_normalised_importance import get_normalized_importance
from lib.training.get_regression_metrics import get_regression_metrics


def train_custom_xgb_model_from_dataframe(data, target_field: str, input_features):
    features = [f['feature'] for f in input_features]
    categorical_features = [f['feature'] for f in input_features if f.get('categorical', False)]

    # Select only the columns you need
    X = data[features]
    y = data[[target_field]]

    # Preprocess the data
    X = pd.get_dummies(X, columns=categorical_features)

    X_one_hot_adjusted = X.copy()

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

    metrics_dict = get_regression_metrics(y_test, y_pred)

    # Get normalised importance
    importance = get_normalized_importance(bst)

    # We only want data intrinsic to the model. Other metadata will be added later
    metadata = {
        'sample_size': X.shape[0],
        'accuracy_metrics': metrics_dict,
        'importance': importance,
        'one_hot_adjusted_features': X_one_hot_adjusted.columns,
    }

    return {
        'model': bst,
        'metadata': metadata
    }
