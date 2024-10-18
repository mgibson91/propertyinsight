import unittest

from validate_input import validate_input

class TestValidateInput(unittest.TestCase):

    def test_validate_input_int(self):
        # Test case for validating if input value is an integer
        self.assertEqual(validate_input(10, 'int'), 10)

    def test_validate_input_float(self):
        # Test case for validating if input value is a float
        self.assertEqual(validate_input(3.14, 'float'), 3.14)

    def test_validate_input_str(self):
        # Test case for validating if input value is a string
        self.assertEqual(validate_input('hello', 'str'), 'hello')

    def test_validate_input_raises_value_error(self):
        # Test case for validating if ValueError is raised when no input value is provided
        with self.assertRaises(ValueError):
            validate_input(None, 'int')

    def test_validate_input_raises_type_error(self):
        # Test case for validating if ValueError is raised when input value doesn't match the expected type
        with self.assertRaises(ValueError):
            validate_input('abc', 'int')

if __name__ == '__main__':
    unittest.main()
