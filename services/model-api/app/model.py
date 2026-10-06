"""Loads the trained model from disk (cached) and serves predictions."""

import logging
from functools import lru_cache
from pathlib import Path
from typing import List

import joblib
import pandas as pd

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "model.joblib"


class ModelNotTrainedError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def get_model_bundle() -> dict:
    if not MODEL_PATH.exists():
        logger.error("Model file not found at %s", MODEL_PATH)
        raise ModelNotTrainedError(
            f"No trained model found at {MODEL_PATH}. Run: python -m app.train"
        )
    logger.info("Loading model from %s", MODEL_PATH)
    return joblib.load(MODEL_PATH)


def predict(features: List[dict]) -> List[float]:
    bundle = get_model_bundle()
    model = bundle["model"]
    feature_order = bundle["features"]

    df = pd.DataFrame(features)[feature_order]

    predictions = model.predict(df)
    logger.info("Predicted %d house(s)", len(predictions))
    return [round(float(p), 2) for p in predictions]


def get_model_info() -> dict:
    bundle = get_model_bundle()
    return {
        "model_type": bundle["model_type"],
        "coefficients": bundle["coefficients"],
        "intercept": bundle["intercept"],
        "features": bundle["features"],
        "metrics": bundle["metrics"],
        "trained_on_samples": bundle["trained_on_samples"],
    }


def get_model_comparison() -> dict:
    bundle = get_model_bundle()
    return {
        "served_model": "ridge",
        "features": bundle["features"],
        "models": bundle["comparison"],
    }