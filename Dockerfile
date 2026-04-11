# ── Stage 1: Build React frontend ──────────────────────────
FROM node:22-alpine AS builder

WORKDIR /build/client
COPY client/package.json ./
RUN npm install --legacy-peer-deps

COPY client/ ./
RUN npm run build

# ── Stage 2: Production server ─────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Install server deps
COPY server/package.json ./
RUN npm install --omit=dev

# Copy server source
COPY server/ ./

# Copy built React app into server's static folder
COPY --from=builder /build/client/dist ./public

EXPOSE 5000
CMD ["node", "index.js"]
