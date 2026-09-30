"""Trains a linear regression model on the housing dataset and saves it to disk."""

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, cross_val_predict
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import logging
from app.logging_config import setup_logging

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "House_Price_Dataset.csv"
MODEL_PATH = BASE_DIR / "models" / "model.joblib"
FEATURES = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]
TARGET = "price"


def load_data() -> tuple[pd.DataFrame, pd.Series]:
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURES]
    y = df[TARGET]
    return X, y


def train_and_evaluate() -> dict:
    X, y = load_data()
    logger.info("Loaded %d rows", len(X))

    # 5-fold cross-validation
    kfold = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_predictions = cross_val_predict(LinearRegression(), X, y, cv=kfold)

    metrics = {
        "r2": round(r2_score(y, cv_predictions), 4),
        "rmse": float(round(np.sqrt(mean_squared_error(y, cv_predictions)), 2)),
        "mae": round(mean_absolute_error(y, cv_predictions), 2),
    }

    logger.info("Cross-validation metrics: %s", metrics)

    # Now train the FINAL model on all 50 rows 
    final_model = LinearRegression()
    final_model.fit(X, y)

    return {"model": final_model, "metrics": metrics}


def save_model(model: LinearRegression, metrics: dict) -> None:
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    bundle = {
        "model": model,
        "features": FEATURES,
        "metrics": metrics,
        "coefficients": dict(zip(FEATURES, model.coef_.tolist())),
        "intercept": float(model.intercept_),
        "trained_on_samples": len(load_data()[0]),
    }
    joblib.dump(bundle, MODEL_PATH)
    logger.info("Model saved to %s", MODEL_PATH)
    


if __name__ == "__main__":
    setup_logging()
    result = train_and_evaluate()
    save_model(result["model"], result["metrics"])