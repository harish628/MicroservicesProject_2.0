# notification-service/Dockerfile
#
# Identical structure to order-service's Dockerfile — same language,
# same reasoning (npm ci for deterministic installs, multi-stage for a
# clean final image, non-root user for security). See order-service's
# Dockerfile comments for the full explanation if you need a refresher.

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

FROM node:20-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app .

USER appuser

EXPOSE 8005

CMD ["node", "src/index.js"]
