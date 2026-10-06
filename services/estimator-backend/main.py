"""FastAPI service that validates property estimate requests and forwards them to the model API."""

import logging
import os

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

API_URL = os.environ.get("API_URL", "http://localhost:8000/predict")

app = FastAPI(
    title="Property Estimator Backend",
    description="Receives form submissions from the Next.js portal and forwards them to the ML model API.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class PropertyFeatures(BaseModel):
    square_footage: float = Field(..., gt=0)
    bedrooms: int = Field(..., ge=0)
    bathrooms: float = Field(..., ge=0)
    year_built: int = Field(..., ge=1800, le=2026)
    lot_size: float = Field(..., gt=0)
    distance_to_city_center: float = Field(..., ge=0)
    school_rating: float = Field(..., ge=0, le=10)


class EstimateResponse(BaseModel):
    predictions: list[float]
    count: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/estimate", response_model=EstimateResponse)
async def estimate(features: PropertyFeatures):
    logger.info("Received estimate request: %s", features.model_dump())
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                API_URL,
                json=features.model_dump(),
                timeout=10.0,
            )
        except httpx.ConnectError:
            logger.error("Cannot reach prediction model API at %s", API_URL)
            raise HTTPException(
                status_code=503,
                detail="Cannot reach the prediction model API",
            )
        except httpx.TimeoutException:
            logger.error("Prediction model API timed out at %s", API_URL)
            raise HTTPException(
                status_code=504,
                detail="The prediction model API took too long to respond.",
            )

    if response.status_code != 200:
        logger.error("Model API returned %d: %s", response.status_code, response.text)
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Model API returned an error: {response.text}",
        )

    logger.info("Forwarded estimate successfully")
    return response.json()