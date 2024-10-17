from flask import abort, make_response, jsonify
from google.cloud import error_reporting

client = error_reporting.Client()


def report_cloud_error(error_message):
    try:
        raise RuntimeError(error_message)
    except RuntimeError:
        client.report_exception()


def raise_and_return_json_error(message: str, code: int):
    try:
        report_cloud_error(message)
    except Exception as e:
        # TODO - remove this once Cloud error reporting is enabled
        print(e)

    return abort(make_response(jsonify(message=message), code))
