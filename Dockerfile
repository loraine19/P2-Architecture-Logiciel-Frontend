# ─── Stage 1 : Build & Test ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Run tests — image build fails if any test fails
RUN npm test -- --no-coverage --watchAll=false

# Build production bundle
RUN npm run build --configuration=production

# ─── Stage 2 : Serve ──────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy built Angular app
COPY --from=builder /app/dist/etudiant-frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
