Property Insights Platform:

Overview:
A housing price prediction system with two independent portal applications, each with its own backend, all built around one shared ML model.

Architecture:
    Browser -> Next.js portal (3000)
                App 1: Property Value Estimator -> Python/FastAPI (8001) -> Model API (8000)
                App 2: Property Market Analysis  -> Java/Spring Boot (8002) -> Model API (8000)

Services:

Model API services  /model-api - Python 3.12, FastAPI, scikit-learn 8000 
Estimator backend services  /estimator-backend - Python 3.12, FastAPI 8001
Market analysis backend services  /market-analysis-backend - Java 21, Spring Boot 3.4.4 8002 
Web portal web/portal  - Next.js, TypeScript, Tailwind 3000 

Each service has its own README with full details: endpoints, run instructions, and design notes.

Run locally:
Start these in order, each in its own terminal.

1. Model API

    cd services/model-api
    python3.12 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    python -m app.train
    uvicorn app.main:app --reload

2. Estimator backend

    cd services/estimator-backend
    python3.12 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8001

3. Market analysis backend

    cd services/market-analysis-backend
    ./mvnw spring-boot:run

4. Web portal

    cd web/portal
    npm install
    npm run dev

Open http://localhost:3000


Run the model API with Docker instead:

    cd services/model-api
    docker build -t model-api .
    docker run -d -p 8000:8000 --name model-api model-api
