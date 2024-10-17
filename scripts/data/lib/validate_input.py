def validate_input(input_val, expected_type):
    python_type = None
    if expected_type == 'int':
        python_type = int
    elif expected_type == 'float':
        python_type = float
    elif expected_type == 'str':
        python_type = str

    if not input_val:
        raise ValueError(f"{expected_type} value is required.")
    try:
        python_type(input_val)
    except ValueError:
        raise ValueError(f"{expected_type} value is expected.")

    return python_type(input_val)
