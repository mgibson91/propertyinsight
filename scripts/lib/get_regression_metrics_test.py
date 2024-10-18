import unittest
import numpy as np
from lib.training.get_regression_metrics import get_regression_metrics


# unit test
class TestRegressionMetrics(unittest.TestCase):
    def test_get_regression_metrics(self):
        y_test = {'price': np.array([1.234, 5.678, 9.101112, 300.1415])}
        y_pred = np.array([1.23, 5.68, 9.11, 305.0])
        csv_file = "test_data.csv"
        expected_output = {
            "avg_percent_error": 0.289,
            "median_error": 0.231,
            "max_error": 1.681,
            "p90_error": 1.065,
            "under_10_pct": 75.0,
            "under_15_pct": 100.0,
            "rmse": 2.003,
            "csv_file": "test_data.csv"
        }
        output = get_regression_metrics(y_test, y_pred, csv_file)
        self.assertEqual(output, expected_output)


if __name__ == '__main__':
    unittest.main()
