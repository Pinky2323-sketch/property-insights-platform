Realty Insights Portal

Overview:
A Next.js portal that hosts two independent applications, each with its own backend, both using the same ML model API.


Property Value Estimator  /estimator - Python 3.12 / FastAPI (port 8001)
Property Market Analysis  /market-analysis - Java 21 / Spring Boot 3.4.4 (port 8002)

Both backends call the housing price model API.

Features:

App 1: Property Value Estimator
- Form for all 7 model fields with client-side validation and accessible error messages
- Latest result as a table and a bar chart
- History that survives page refresh (localStorage), with a Clear button
- Side-by-side comparison of 2 to 4 saved estimates.

App 2: Property Market Analysis
- Dashboard cards and charts rendered from server-fetched data.
- Filters for price, bedrooms and size, kept in the URL so views can be shared
- Sortable, searchable table
- What-if tool: compares a base and a scenario property through the model
- Export of the visible rows to CSV and PDF


Run locally:

Start these four services, each in its own terminal.

1. Model API (Docker image):

        docker start housing-api

2. Python backend (from property-estimator-backend):

        uvicorn main:app --reload --port 8001

3. Java backend (from market-analysis-backend):

        ./mvnw spring-boot:run

4. This portal:

        npm install
        npm run dev


Open http://localhost:3000


Scripts:

    npm run dev      development server
    npm run build    production build
    npm run lint     ESLint