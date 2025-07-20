# ---- Base Python image ----
FROM python:3.10-slim AS base

WORKDIR /app

# Install system dependencies for Python and Node
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# ---- Install backend dependencies ----
COPY backend/requirements.txt backend/requirements.txt
COPY backend/services/arbitrage/requirements.txt backend/services/arbitrage/requirements.txt
COPY backend/services/price_feeds/requirements.txt backend/services/price_feeds/requirements.txt
COPY backend/services/cep_engine/requirements.txt backend/services/cep_engine/requirements.txt
COPY backend/services/health/requirements.txt backend/services/health/requirements.txt

# Install all unique Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt \
    && pip install --no-cache-dir -r backend/services/arbitrage/requirements.txt \
    && pip install --no-cache-dir -r backend/services/price_feeds/requirements.txt \
    && pip install --no-cache-dir -r backend/services/cep_engine/requirements.txt \
    && pip install --no-cache-dir -r backend/services/health/requirements.txt

# ---- Copy backend code ----
COPY backend/ backend/
COPY supervisord.conf supervisord.conf

# ---- Build frontend ----
COPY frontend/ frontend/
WORKDIR /app/frontend

# Use pnpm if you want, or npm (your Dockerfile uses pnpm, but package.json only has npm scripts)
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build

# ---- Move frontend build to API Gateway static directory ----
WORKDIR /app
RUN mkdir -p backend/services/api_gateway/static
RUN cp -r frontend/build/* backend/services/api_gateway/static/

# ---- Final setup ----
WORKDIR /app

# Expose API Gateway port
EXPOSE 5000

# Start all services with supervisord
CMD ["supervisord", "-c", "supervisord.conf"] 