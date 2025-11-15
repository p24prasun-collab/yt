# 🚀 GAIM Production Deployment Guide

**Complete guide for deploying GAIM YouTube Influencer Discovery Platform to production**

## 🏗️ Deployment Architecture

### Recommended Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Frontend      │────│   Backend API   │
│   (nginx/CDN)   │    │   (React/Vite)  │    │   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Redis Cache   │    │   SQLite DB     │
                       │   (Optional)    │    │   (Production)  │
                       └─────────────────┘    └─────────────────┘
```

## 🔧 Environment Setup

### Production Environment Variables
Create a production `.env` file:

```env
# API Keys (Required)
YOUTUBE_API_KEY=your_production_youtube_api_key
GEMINI_API_KEY=your_production_gemini_api_key

# Production Configuration
NODE_ENV=production
PYTHON_ENV=production
DEBUG=false

# API Rate Limiting
YT_MAX_SEARCH_CALLS_PER_REQUEST=15
YT_MAX_LANGUAGES_PER_KEYWORD=1
API_RATE_LIMIT_PER_MINUTE=100

# Database Configuration
DATABASE_URL=sqlite:///gaim_production.db
CACHE_ENABLED=true
CACHE_TTL=3600

# Security
SECRET_KEY=your_super_secure_secret_key_here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/gaim/app.log

# Performance
MAX_WORKERS=4
WORKER_TIMEOUT=120
```

## 🐳 Docker Deployment

### Dockerfile
Create `Dockerfile` in project root:

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim AS backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY .env ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create non-root user
RUN useradd --create-home --shell /bin/bash gaim
RUN chown -R gaim:gaim /app
USER gaim

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Docker Compose
Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  gaim-app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - PYTHON_ENV=production
    env_file:
      - .env
    volumes:
      - gaim-data:/app/data
      - gaim-logs:/var/log/gaim
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - gaim-app
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  gaim-data:
  gaim-logs:
  redis-data:
```

### Nginx Configuration
Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream gaim_backend {
        server gaim-app:8000;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # API requests
        location /api/ {
            proxy_pass http://gaim_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend static files
        location / {
            proxy_pass http://gaim_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## ☁️ Cloud Deployment Options

### 1. AWS Deployment

#### Using AWS ECS + Fargate
```bash
# Build and push to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-west-2.amazonaws.com
docker build -t gaim .
docker tag gaim:latest 123456789.dkr.ecr.us-west-2.amazonaws.com/gaim:latest
docker push 123456789.dkr.ecr.us-west-2.amazonaws.com/gaim:latest

# Deploy using ECS CLI or AWS Console
```

#### Using AWS Elastic Beanstalk
Create `Dockerrun.aws.json`:
```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "123456789.dkr.ecr.us-west-2.amazonaws.com/gaim:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "8000"
    }
  ]
}
```

### 2. Google Cloud Platform

#### Using Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/gaim
gcloud run deploy gaim \
  --image gcr.io/PROJECT_ID/gaim \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production"
```

### 3. Digital Ocean App Platform

Create `.do/app.yaml`:
```yaml
name: gaim
services:
- name: web
  source_dir: /
  github:
    repo: your-username/yt
    branch: main
  run_command: uvicorn backend.main:app --host 0.0.0.0 --port 8080
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8080
  envs:
  - key: NODE_ENV
    value: production
  - key: YOUTUBE_API_KEY
    value: ${YOUTUBE_API_KEY}
  - key: GEMINI_API_KEY
    value: ${GEMINI_API_KEY}
```

## 🔒 Security Configuration

### API Key Management
```python
# backend/config.py
import os
from functools import lru_cache

class Settings:
    youtube_api_key: str = os.getenv("YOUTUBE_API_KEY")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY")
    secret_key: str = os.getenv("SECRET_KEY")
    allowed_hosts: list = os.getenv("ALLOWED_HOSTS", "").split(",")
    
    class Config:
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()
```

### CORS Configuration
```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().allowed_hosts,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### Rate Limiting
```python
# backend/middleware.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/search-top-videos")
@limiter.limit("10/minute")
async def search_top_videos(request: Request, data: SearchTopVideosRequest):
    # Implementation
```

## 📊 Monitoring & Logging

### Application Monitoring
```python
# backend/monitoring.py
import logging
from prometheus_client import Counter, Histogram, generate_latest

# Metrics
api_requests = Counter('api_requests_total', 'Total API requests', ['method', 'endpoint'])
response_time = Histogram('api_response_time_seconds', 'API response time')

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/gaim/app.log'),
        logging.StreamHandler()
    ]
)
```

### Health Checks
```python
# Enhanced health check endpoint
@app.get("/api/health")
async def health_check():
    checks = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {
            "youtube_api": bool(youtube_api.api_key),
            "gemini_api": bool(llm.enabled),
            "database": await check_database_connection(),
            "cache": await check_cache_connection(),
        }
    }
    
    if all(checks["services"].values()):
        return JSONResponse(content=checks, status_code=200)
    else:
        return JSONResponse(content=checks, status_code=503)
```

## 🚀 Deployment Commands

### Production Build
```bash
# Build frontend for production
cd frontend
npm run build

# Test production build locally
npm run preview

# Build backend
cd ../backend
pip install -r requirements.txt

# Run production server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker Deployment
```bash
# Build production image
docker build -t gaim:prod .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale gaim-app=3
```

## 📈 Performance Optimization

### Backend Optimizations
- Use async/await for all I/O operations
- Implement connection pooling for external APIs
- Add Redis caching for frequently accessed data
- Use database indexing for common queries
- Implement request batching for YouTube API calls

### Frontend Optimizations
- Enable Vite build optimizations
- Use React.lazy for code splitting
- Implement service worker for caching
- Optimize images and assets
- Use CDN for static file delivery

### Database Optimizations
- Regular VACUUM operations for SQLite
- Implement proper indexing strategy
- Use read replicas for high-traffic scenarios
- Monitor query performance

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest
      - name: Run tests
        run: pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Your deployment commands here
          echo "Deploying to production..."
```

## 🛡️ Backup Strategy

### Database Backup
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
sqlite3 gaim_production.db ".backup gaim_backup_$DATE.db"
aws s3 cp gaim_backup_$DATE.db s3://gaim-backups/
```

### Application Backup
- Regular database snapshots
- Configuration file backups
- Log file archival
- Disaster recovery procedures

---

## 🔍 Post-Deployment Checklist

- [ ] SSL certificates installed and renewed
- [ ] Environment variables configured
- [ ] API rate limits properly set
- [ ] Monitoring and alerting active
- [ ] Backup procedures tested
- [ ] Performance benchmarks established
- [ ] Security scan completed
- [ ] Load testing performed
- [ ] Documentation updated

**Your GAIM platform is now production-ready! 🚀**