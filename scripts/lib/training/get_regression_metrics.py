import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error


def get_regression_metrics(y_test, y_pred, sf: int = 3):
    mae = mean_absolute_error(y_test, y_pred)
    rmse = mean_squared_error(y_test, y_pred, squared=False)
    y_test_arr = y_test['price'].values
    avg_percent_error = sum(abs(y_test_arr - y_pred) / y_test_arr) * 100 / len(y_test_arr)
    # median_error = np.median(abs(y_test_arr - y_pred) / y_test_arr) * 100
    median_error = sum(abs(y_test_arr - y_pred) / y_test_arr < 0.5) * 100 / len(y_test_arr)
    max_error = np.max(abs(y_test_arr - y_pred) / y_test_arr) * 100
    p90_error = np.percentile(abs(y_test_arr - y_pred) / y_test_arr, 90) * 100
    under_10_pct = sum(abs(y_test_arr - y_pred) / y_test_arr < 0.1) * 100 / len(y_test_arr)
    under_15_pct = sum(abs(y_test_arr - y_pred) / y_test_arr < 0.15) * 100 / len(y_test_arr)

    # Return metrics as a dictionary
    return {
        "avg_percent_error": round(avg_percent_error.item(), sf),
        "median_error": round(median_error.item(), sf),
        "max_error": round(max_error.item(), sf),
        "p90_error": round(p90_error.item(), sf),
        "under_10_pct": round(under_10_pct.item(), sf),
        "under_15_pct": round(under_15_pct.item(), sf),
        "rmse": round(rmse.item(), sf),
    }
