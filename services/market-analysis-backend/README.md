Market Analysis Backend:

Overview:
Spring Boot 3.4.4 / Java 21 ,REST API that serves aggregate statistics from the housing dataset and runs what-if comparisons through the ML model API. It is the backend for App (Property Market Analysis) of the Realty Insights Portal.

Endpoints:

GET /api/health - Health check
GET /api/market/summary - Count, average, median, min, max price, average size, price per sq ft
GET /api/market/by-bedrooms - Count and average price per bedroom count
GET /api/market/by-age-band - Count and average price per year-built band
GET /api/market/properties - The dataset rows
POST /api/what-if - Prices a base and a scenario property in one model call and returns the difference


Run locally:

Requires Java 21 and the model API running on port 8000.

    ./mvnw spring-boot:run


Run with Docker:

    docker build -t market-analysis-backend .
    docker run -d -p 8002:8002 -e MODEL_API_URL=http://host.docker.internal:8000 --name market-api market-analysis-backend
