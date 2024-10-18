from typing import Dict, List, Tuple
import collections

def _group_and_aggregate_data(data: List[Tuple[str, float]]) -> Dict[str, Tuple[int, float]]:
    """
    Groups the input data by the part of the string before "_", aggregates the fields with the same prefix, and
    produces a dictionary with unique keys grouped by the prefix, the count of records for that key and the sum of
    their values.

    :param data: a list of tuples, each containing a string key and a numeric value
    :return: a dictionary with unique keys grouped by the prefix, the count of records for that key and the sum of
             their values
    """
    # Group fields by prefix
    prefix_sum = {}
    for key, value in data:
        prefix = key.split('_')[0] if '_' in key else key
        if prefix in prefix_sum:
            prefix_sum[prefix]['count'] += 1
            prefix_sum[prefix]['sum'] += value
        else:
            prefix_sum[prefix] = {'count': 1, 'sum': value}

    # Create output dictionary
    result = {}
    for prefix, prefix_data in prefix_sum.items():
        result[prefix] = (prefix_data['count'], prefix_data['sum'])

    return result

from typing import Dict, Tuple

def _compute_average_values(data: Dict[str, Tuple[int, float]]) -> Dict[str, float]:
    """
    Takes the input dictionary of keys grouped by prefix, the count of records for that key and the sum of their values,
    and returns a new dictionary with the same keys, but the values are the average of the sum of values divided by the
    count of records for that key.

    :param data: a dictionary with keys grouped by prefix, the count of records for that key and the sum of their values
    :return: a dictionary with the same keys, but the values are the average of the sum of values divided by the count
             of records for that key
    """
    result = {}
    for key, value in data.items():
        result[key] = value[1] / value[0]

    return result


def _normalize_dict_values(input_dict: Dict[str, float]) -> collections.OrderedDict:
    max_val = max(input_dict.values())

    normalized_dict = {k: v / max_val for k, v in input_dict.items()}

    # sort the results in descending order
    sorted_dict = sorted(normalized_dict.items(), key=lambda x: x[1], reverse=True)

    # create an ordered dictionary from the sorted tuple list
    ordered_dict = collections.OrderedDict(sorted_dict)

    return ordered_dict

def get_normalized_importance(bst):
    num_rounds_executed = bst.num_boosted_rounds()

    print(f'Number of rounds executed: {num_rounds_executed}')

    importance = bst.get_score(importance_type='gain')
    importance_sum = sum(importance.values())
    importance = {k: v / importance_sum for k, v in importance.items()}
    importance = sorted(importance.items(), key=lambda x: x[1], reverse=True)

    aggregated_importance = _group_and_aggregate_data(importance)
    average_importance = _compute_average_values(aggregated_importance)
    normalised_importance = _normalize_dict_values(average_importance)

    return normalised_importance