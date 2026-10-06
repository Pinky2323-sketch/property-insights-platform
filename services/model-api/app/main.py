"""FastAPI app exposing /health, /model-info, /model-compare and /predict endpoints."""

import logging

from fastapi import FastAPI, HTTPException

from app.logging_config import setup_logging
from app.model import ModelNotTrainedError, get_model_comparison, get_model_info, predict
from app.schemas import (
    HealthResponse,
    ModelComparisonResponse,
    ModelInfoResponse,
    PredictionResponse,
    PredictRequest,
)

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Housing Price Prediction API",
    description="Predicts housing prices from property features using a trained regression model.",
    version="1.1.0",
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model"])
def model_info() -> ModelInfoResponse:
    try:
        info = get_model_info()
    except ModelNotTrainedError as e:
        logger.error("Model not trained: %s", e)
        raise HTTPException(status_code=503, detail=str(e))
    return ModelInfoResponse(**info)


@app.get("/model-compare", response_model=ModelComparisonResponse, tags=["Model"])
def model_compare() -> ModelComparisonResponse:
    try:
        comparison = get_model_comparison()
    except ModelNotTrainedError as e:
        logger.error("Model not trained: %s", e)
        raise HTTPException(status_code=503, detail=str(e))
    return ModelComparisonResponse(**comparison)


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict_price(request: PredictRequest) -> PredictionResponse:
    houses = request.root if isinstance(request.root, list) else [request.root]
    logger.info("Received prediction request for %d house(s)", len(houses))

    feature_dicts = [house.model_dump() for house in houses]

    try:
        predictions = predict(feature_dicts)
    except ModelNotTrainedError as e:
        logger.error("Model not trained: %s", e)
        raise HTTPException(status_code=503, detail=str(e))

    return PredictionResponse(predictions=predictions, count=len(predictions))