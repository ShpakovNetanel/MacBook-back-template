# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer-cache friendly)
COPY package*.json ./
RUN npm ci

# Copy source and compile
COPY . .
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy only what is needed to run the app
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
