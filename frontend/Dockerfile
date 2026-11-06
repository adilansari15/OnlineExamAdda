# Multi-stage Dockerfile for React + Vite Frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies with frozen lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Nginx production runtime stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default assets and copy compiled assets
RUN rm -rf ./*
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

