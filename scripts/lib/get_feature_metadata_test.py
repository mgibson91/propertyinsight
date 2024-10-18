import unittest

from get_feature_metadata import get_feature_metadata


class TestFeatureMetadata(unittest.TestCase):
    def setUp(self):
        self.features = ['a', 'b', 'c']
        self.required = ['a', 'b']
        self.categorical = ['a', 'c']
        self.one_hot_adjusted_features = ['a_1', 'a_2', 'c_1']

    def test_get_feature_metadata(self):
        expected_metadata = [{"feature": "a", "required": True, "categorical": True},
                             {"feature": "b", "required": True},
                             {"feature": "c", "categorical": True}]
        result = get_feature_metadata(self.features, one_hot_adjusted_features=self.one_hot_adjusted_features, required=self.required, categorical=self.categorical)
        self.assertEqual(result['input'], expected_metadata)

        expected_one_hot_adjusted = ['a_1', 'a_2', 'c_1']
        self.assertEqual(result['one_hot_adjusted'], expected_one_hot_adjusted)

    def test_missing_feature(self):
        with self.assertRaises(ValueError):
            get_feature_metadata(self.features, required=['d'], categorical=['e'])

    def test_empty_features(self):
        result = get_feature_metadata([], required=[], categorical=[], one_hot_adjusted_features=[])
        self.assertEqual(result, {'input': [], 'one_hot_adjusted': []})

if __name__ == '__main__':
    unittest.main()

