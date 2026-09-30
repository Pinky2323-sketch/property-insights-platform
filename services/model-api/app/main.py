"""FastAPI app exposing /health, /model-info, and /predict endpoints."""

import logging
from app.logging_config import setup_logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from app.schemas import (
    PredictRequest,
    PredictionResponse,
    ModelInfoResponse,
    HealthResponse,
    HouseFeatures,
)
from app.model import predict, get_model_info, ModelNotTrainedError

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Housing Price Prediction API",
    description="Predicts housing prices from property features using a trained regression model.",
    version="1.0.0",
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