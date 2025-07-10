# ASCEP Multi-stage Docker Build
FROM node:18-alpine AS frontend-builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app/frontend
COPY frontend/package*.json ./
COPY frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY frontend/ ./
RUN pnpm run build

# Backend stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Copy startup scripts
COPY start_railway.sh ./
RUN chmod +x start_railway.sh

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["./start_railway.sh"] 