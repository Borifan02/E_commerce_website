# Multi-stage build for production

# Backend build
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Frontend build
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend ./backend

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Create logs directory
RUN mkdir -p backend/logs backend/uploads

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "backend/server.js"]
