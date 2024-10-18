import pandas as pd
import psycopg2
import xgboost as xgb
import numpy as np
from sklearn.model_selection import train_test_split
from dotenv import load_dotenv
import os
import sys
import logging

from scripts.lib.get_normalised_importance import get_normalized_importance
from scripts.lib.training.get_regression_metrics import get_regression_metrics

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv(dotenv_path='.env.local')

DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PORT = os.getenv('DB_PORT')
DB_USER = os.getenv('DB_USER')

def train_model(data, input_features):
    # Prepare features and target
    x_fields = [feature['feature'] for feature in input_features]
    x_dummy_fields = [feature['feature'] for feature in input_features if feature.get('categorical')]
    
    X = data[x_fields]
    y = data[['price']]

    # Preprocess the data
    X = pd.get_dummies(X, columns=x_dummy_fields)

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Create DMatrix
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
    model = xgb.train(
        params,
        dtrain,
        num_boost_round,
        evals=[(dtrain, "train"), (dtest, "eval")],
        evals_result=evals_result,
        verbose_eval=False,
        early_stopping_rounds=30
    )

    # Get accuracy metrics
    y_pred = model.predict(dtest)
    metrics_dict = get_regression_metrics(y_test, y_pred)

    # Get normalised importance
    importance = get_normalized_importance(model)

    metadata = {
        'model_name': 'property_price_model',
        'description': 'Property price prediction model',
        'constraints': {},
        'sample_size': X.shape[0],
        'accuracy_metrics': metrics_dict,
        'importance': importance,
        'input_feature_metadata': input_features,
        'one_hot_adjusted_features': [col for col in X.columns],
    }

    return model, metadata

def predict_price(model, metadata, row_data):
    new_row = {}
    
    for feature in metadata['input_feature_metadata']:
        feature_name = feature['feature']
        if feature.get('categorical'):
            category_value = row_data.get(feature_name)
            if category_value:
                one_hot_key = f"{feature_name}_{category_value}"
                for col in metadata['one_hot_adjusted_features']:
                    if col.startswith(f"{feature_name}_"):
                        new_row[col] = 1 if col == one_hot_key else 0
        else:
            new_row[feature_name] = row_data.get(feature_name, np.nan)
    
    # Fill in any missing columns with NaN
    for col in metadata['one_hot_adjusted_features']:
        if col not in new_row:
            new_row[col] = np.nan
    
    input_data = pd.DataFrame([new_row])
    dtest = xgb.DMatrix(input_data)
    return float(model.predict(dtest)[0])

def train_and_update_db(csv_path):
    # Load data from the provided CSV file
    data = pd.read_csv(csv_path)
    logging.info(f"Loaded {len(data)} rows from {csv_path}")

    # Define input features
    input_features = [
        {
            "feature": "receptions",
            "label": "Reception count",
            "required": True,
            "type": "int"
        },
        {
            "feature": "bedrooms",
            "label": "Bedroom count",
            "required": True,
            "type": "int"
        },
        {
            "feature": "type",
            "label": "Type",
            "categorical": True,
            "type": "categorical"
        },
        {
            "feature": "postcode",
            "label": "Postcode",
            "categorical": True,
            "type": "categorical"
        }
    ]

    # Train the model
    model, metadata = train_model(data, input_features)
    logging.info("Model training completed")

    # Connect to the database
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    logging.info("Connected to the database")

    # Prepare to update the database
    update_query = """
        INSERT INTO public.default_valuations (property_id, price)
        VALUES (%s, %s)
        ON CONFLICT (property_id) DO UPDATE SET price = EXCLUDED.price
    """

    # Execute the model for each entry and update the database
    update_count = 0
    with conn.cursor() as cursor:
        for index, row in data.iterrows():
            try:
                property_id = row['id']
                row_data = row.to_dict()
                predicted_price = predict_price(model, metadata, row_data)
                cursor.execute(update_query, (property_id, predicted_price))
                conn.commit()  # Commit each row individually
                update_count += 1

                if update_count % 100 == 0:
                    logging.info(f"Processed and committed {update_count} rows")
            except Exception as e:
                logging.error(f"Error processing row {index}: {str(e)}")
                conn.rollback()  # Rollback the failed operation

    logging.info(f"Database updated with {update_count} predictions")
    conn.close()
    logging.info("Database connection closed")

    return model, metadata

if __name__ == "__main__":
    csv_path = './output.csv'
    model, metadata = train_and_update_db(csv_path)
    
    logging.info("Script execution completed")
