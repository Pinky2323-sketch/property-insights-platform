Property Estimator Backend:

Overview:
FastAPI service that backs App (Property Value Estimator) of the Realty Insights Portal. It validates form submissions and forwards them to the ML model API.

Endpoints:

GET /health - Health check
POST /estimate - Validates the 7 property fields, calls the model API and returns the predicted price.

Behaviour:

- Input is validated with Pydantic before anything is forwarded.
- Invalid input returns HTTP 422 with field-level messages.
- If the model API is unreachable, the service returns HTTP 503 with a clear message.
- CORS allows the Next.js dev server on http://localhost:3000.

Run locally:

Requires Python 3.12 and the model API running on port 8000.
    python3.12 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8001
