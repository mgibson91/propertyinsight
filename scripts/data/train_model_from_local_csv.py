import pandas as pd
import numpy as np
import xgboost as xgb

from scripts.lib.training.train_model_from_dataframe import train_custom_xgb_model_from_dataframe

# Load data from a local CSV file
data = pd.read_csv('./output.csv')

train_result = train_custom_xgb_model_from_dataframe(data, target_field='price',
                                                     input_features=[
                                                         {
                                                             "feature": "receptions",
                                                             "label": "Reception count",
                                                             "required": True
                                                         },
                                                         {
                                                             "feature": "bedrooms",
                                                             "label": "Bedroom count",
                                                             "required": True
                                                         },
                                                         {
                                                             "feature": "type",
                                                             "label": "Type",
                                                             "categorical": True
                                                         },
                                                         {
                                                             "feature": "postcode",
                                                             "label": "Type",
                                                             "categorical": True
                                                         }
                                                     ])

print(train_result['metadata']['formatted_metrics'])



#  # Make a test prediction
# def predict_price(model: xgb.Booster, columns, listed_price) -> float:
#     df = pd.DataFrame(columns=list(columns.keys()))
#
#     for col, data_type in columns.items():
#         df[col] = df[col].astype(data_type)
#
#     new_row = pd.Series([np.nan] * len(columns), index=df.columns)
#
#     for col in new_row.index:
#         if col.startswith('type') or col.startswith('heating-type'):
#             new_row[col] = 0
#
#     new_row['receptions'] = 3
#     new_row['bedrooms'] = 5
#     # new_row['heating-type_Beef'] = 1
#     # new_row['heating-type_Gas'] = 1
#     # Can use np.nan
#
#     # df = df.append(new_row, ignore_index=True)
#     df = pd.concat([df, new_row.to_frame().T], ignore_index=True)
#
#     #     print(df)
#
#     df_test = df
#
#     dnew = xgb.DMatrix(df_test)
#     price_pred = model.predict(dnew)
#
#     predicted_price = price_pred[0]
#     percentage_diff = (abs(listed_price - predicted_price) / listed_price) * 100
#     print(f'Predicted|Listed - {price_pred[0]:.2f}|{listed_price:.2f} ({percentage_diff:.2f}%)')
#     return price_pred[0]
#
#
# columns = {
#     'receptions': int,
#     'bedrooms': int,
#     # 'heating-type_Gas': int,
#     # 'heating-type_Oil': int,
#     'type_apartment': int,
#     'type_bungalow': int,
#     'type_cottage': int,
#     'type_detached': int,
#     'type_semi-detached': int,
#     'type_terraced': int,
#     'type_townhouse': int,
#     'type_villa': int,
# }
#
# model = train_result['model']
# predict_price(model, columns, 295000)
#
#
#
#
