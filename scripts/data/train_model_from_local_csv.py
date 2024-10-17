import pandas as pd
from lib.training.train_model_from_dataframe import train_custom_xgb_model_from_dataframe

# Load data from a local CSV file
data = pd.read_csv('./output.csv')

train_result = train_custom_xgb_model_from_dataframe(data, target_field='price',
                                                     input_features=[
                                                         {
                                                             "feature": "reception-count",
                                                             "label": "Reception count",
                                                             "required": True
                                                         },
                                                         {
                                                             "feature": "bedroom-count",
                                                             "label": "Bedroom count",
                                                             "required": True
                                                         },
                                                         {
                                                             "feature": "heating-type",
                                                             "label": "Heating type",
                                                             "categorical": True
                                                         },
                                                         {
                                                             "feature": "type",
                                                             "label": "Type",
                                                             "categorical": True
                                                         }])

print(train_result)
