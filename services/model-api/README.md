Housing Price Prediction API

Overview:
A FastAPI service that predicts housing prices using a  Ridge regression (alpha=3) model, trained on 50 sample properties with cross-validated performance metrics.

Features:
- POST /predict — accepts a single house or a batch (list) of houses, returns predicted price(s)
- GET /model-info — returns model coefficients, intercept, and performance metrics
- GET /health — health check

Tech Stack:
- Python 3.12
- FastAPI
- scikit-learn (LinearRegression)
- Docker


Running Locally:

1. Set up a virtual environment:

    python3.12 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

2. Train the model:

    python -m app.train


3. Start the API:

    uvicorn app.main:app --reload

4. Open the interactive docs:

    http://127.0.0.1:8000/docs


Running with Docker

1. Build the image:

    docker build -t housing-price-prediction .


2. Run the container:

    docker run -d -p 8000:8000 --name housing-api housing-price-prediction

3. Test it:

    curl http://127.0.0.1:8000/health
