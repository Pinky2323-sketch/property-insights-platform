import json
from pathlib import Path

import pandas as pd
import httpx

BASE_DIR = Path(__file__).resolve().parent.parent
TEST_DATA_PATH = BASE_DIR / "data" / "Test_Data_For_Prediction.csv"
API_URL = "http://127.0.0.1:8000/predict"


def main() -> None:
    df = pd.read_csv(TEST_DATA_PATH)

    houses = df.to_dict(orient="records")

    response = httpx.post(API_URL, json=houses, timeout=10.0)
    response.raise_for_status()  

    result = response.json()
    predictions = result["predictions"]

    df["predicted_price"] = predictions

    print(f"Got {result['count']} predictions from the API:\n")
    print(df.to_string(index=False))


if __name__ == "__main__":
    main()