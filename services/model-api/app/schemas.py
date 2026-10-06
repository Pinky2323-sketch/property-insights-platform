from typing import List, Union

from pydantic import BaseModel, Field, RootModel


class HouseFeatures(BaseModel):
    square_footage: float = Field(..., gt=0, description="Total square footage of the house")
    bedrooms: int = Field(..., ge=0, description="Number of bedrooms")
    bathrooms: float = Field(..., ge=0, description="Number of bathrooms (can be fractional, e.g. 2.5)")
    year_built: int = Field(..., ge=1800, le=2026, description="Year the house was built")
    lot_size: float = Field(..., gt=0, description="Lot size in square feet")
    distance_to_city_center: float = Field(..., ge=0, description="Distance to city center in miles")
    school_rating: float = Field(..., ge=0, le=10, description="Nearby school rating, 0-10 scale")

    model_config = {
        "json_schema_extra": {
            "example": {
                "square_footage": 1850, "bedrooms": 3, "bathrooms": 2,
                "year_built": 1998, "lot_size": 7500,
                "distance_to_city_center": 5.6, "school_rating": 8.2,
            }
        }
    }


class PredictRequest(RootModel[Union[HouseFeatures, List[HouseFeatures]]]):
    pass


class PredictionResponse(BaseModel):
    predictions: List[float]
    count: int


class ModelMetrics(BaseModel):
    r2: float
    rmse: float
    mae: float


class ModelInfoResponse(BaseModel):
    model_type: str
    coefficients: dict
    intercept: float
    features: List[str]
    metrics: ModelMetrics
    trained_on_samples: int


class ComparedModel(BaseModel):
    model_type: str
    coefficients: dict
    intercept: float
    metrics: ModelMetrics


class ModelComparisonResponse(BaseModel):
    served_model: str
    features: List[str]
    models: dict[str, ComparedModel]


class HealthResponse(BaseModel):
    status: str