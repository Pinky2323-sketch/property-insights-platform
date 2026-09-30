import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

VALID_HOUSE = {
    "square_footage": 1850,
    "bedrooms": 3,
    "bathrooms": 2,
    "year_built": 1998,
    "lot_size": 7500,
    "distance_to_city_center": 5.6,
    "school_rating": 8.2,
}


class TestHealth:
    def test_health_returns_ok(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestModelInfo:
    def test_model_info_returns_expected_fields(self):
        response = client.get("/model-info")
        assert response.status_code == 200

        data = response.json()
        assert data["model_type"] == "LinearRegression"
        assert len(data["coefficients"]) == 7
        assert "r2" in data["metrics"]
        assert "rmse" in data["metrics"]
        assert "mae" in data["metrics"]
        assert data["trained_on_samples"] == 50

    def test_model_info_metrics_are_reasonable(self):
        response = client.get("/model-info")
        metrics = response.json()["metrics"]
        assert 0 <= metrics["r2"] <= 1
        assert metrics["rmse"] > 0
        assert metrics["mae"] > 0


class TestPredictSingle:
    def test_predict_single_house_returns_one_prediction(self):
        response = client.post("/predict", json=VALID_HOUSE)
        assert response.status_code == 200

        data = response.json()
        assert data["count"] == 1
        assert len(data["predictions"]) == 1
        assert data["predictions"][0] > 0

    def test_predict_price_in_reasonable_range(self):
        response = client.post("/predict", json=VALID_HOUSE)
        price = response.json()["predictions"][0]
        assert 150_000 < price < 500_000


class TestPredictBatch:
    def test_predict_batch_returns_matching_count(self):
        batch = [VALID_HOUSE, VALID_HOUSE, VALID_HOUSE]
        response = client.post("/predict", json=batch)
        assert response.status_code == 200

        data = response.json()
        assert data["count"] == 3
        assert len(data["predictions"]) == 3

    def test_predict_batch_identical_houses_give_identical_prices(self):
        batch = [VALID_HOUSE, VALID_HOUSE]
        response = client.post("/predict", json=batch)
        predictions = response.json()["predictions"]
        assert predictions[0] == predictions[1]


class TestPredictValidation:
    def test_missing_required_field_returns_422(self):
        incomplete = VALID_HOUSE.copy()
        del incomplete["square_footage"]

        response = client.post("/predict", json=incomplete)
        assert response.status_code == 422  # FastAPI's validation error code

    def test_negative_square_footage_rejected(self):
        invalid = VALID_HOUSE.copy()
        invalid["square_footage"] = -100

        response = client.post("/predict", json=invalid)
        assert response.status_code == 422

    def test_negative_bedrooms_rejected(self):
        invalid = VALID_HOUSE.copy()
        invalid["bedrooms"] = -1

        response = client.post("/predict", json=invalid)
        assert response.status_code == 422

    def test_school_rating_above_ten_rejected(self):
        invalid = VALID_HOUSE.copy()
        invalid["school_rating"] = 15

        response = client.post("/predict", json=invalid)
        assert response.status_code == 422

    def test_empty_body_rejected(self):
        response = client.post("/predict", json={})
        assert response.status_code == 422