"""Trains a scaled Ridge model (served) and a LinearRegression (for comparison) and saves them to disk."""

import logging
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

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
ALPHA = 3


def load_data() -> tuple[pd.DataFrame, pd.Series]:
    df = pd.read_csv(DATA_PATH)
    return df[FEATURES], df[TARGET]


def build_ridge():
    return make_pipeline(StandardScaler(), Ridge(alpha=ALPHA))


def per_unit_coefficients(model) -> tuple[np.ndarray, float]:
    if hasattr(model, "named_steps"):
        scaler = model.named_steps["standardscaler"]
        ridge = model.named_steps["ridge"]
        coefs = ridge.coef_ / scaler.scale_
        intercept = float(ridge.intercept_ - np.sum(coefs * scaler.mean_))
        return coefs, intercept
    return model.coef_, float(model.intercept_)


def train_one(label: str, builder, X: pd.DataFrame, y: pd.Series) -> dict:
    kfold = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_predictions = cross_val_predict(builder(), X, y, cv=kfold)

    metrics = {
        "r2": round(float(r2_score(y, cv_predictions)), 4),
        "rmse": round(float(np.sqrt(mean_squared_error(y, cv_predictions))), 2),
        "mae": round(float(mean_absolute_error(y, cv_predictions)), 2),
    }
    logger.info("%s cross-validation metrics: %s", label, metrics)

    model = builder()
    model.fit(X, y)
    coefs, intercept = per_unit_coefficients(model)

    return {
        "model": model,
        "model_type": label,
        "metrics": metrics,
        "coefficients": dict(zip(FEATURES, coefs.tolist())),
        "intercept": intercept,
    }


def train_all() -> dict:
    X, y = load_data()
    logger.info("Loaded %d rows", len(X))
    ridge = train_one(f"Ridge (scaled, alpha={ALPHA})", build_ridge, X, y)
    linear = train_one("LinearRegression", LinearRegression, X, y)
    return {"ridge": ridge, "linear": linear, "samples": len(X)}


def save_model(result: dict) -> None:
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    comparison = {
        name: {k: v for k, v in result[name].items() if k != "model"}
        for name in ("ridge", "linear")
    }
    bundle = {
        **result["ridge"],
        "features": FEATURES,
        "trained_on_samples": result["samples"],
        "comparison": comparison,
    }
    joblib.dump(bundle, MODEL_PATH)
    logger.info("Model saved to %s", MODEL_PATH)


if __name__ == "__main__":
    setup_logging()
    save_model(train_all())