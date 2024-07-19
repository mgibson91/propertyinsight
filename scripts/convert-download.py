import csv
import json

def csv_to_json(csv_file_path, json_file_path):
    data = []

    with open(csv_file_path, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        headers = csv_reader.fieldnames
        print(f"Headers: {headers}")  # Print the headers to debug

        for row in csv_reader:
            json_data = {
                "unix": int(row["Unix"].strip()),
                "date": row["Date"].strip(),
                "symbol": row["Symbol"].strip(),
                "open": float(row["Open"].strip()),
                "high": float(row["High"].strip()),
                "low": float(row["Low"].strip()),
                "close": float(row["Close"].strip()),
                "volume_usd": float(row["Volume USDT"].strip()),
                "volume_sol": float(row["Volume SOL"].strip())
            }
            data.append(json_data)

    with open(json_file_path, mode='w') as json_file:
        json.dump(data, json_file, indent=2)

# Example usage
csv_file_path = '/Users/matt/Downloads/Binance_SOLUSDT_1h.csv'
json_file_path = './hourly-sol.json'
csv_to_json(csv_file_path, json_file_path)
