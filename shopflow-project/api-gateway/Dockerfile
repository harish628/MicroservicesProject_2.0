# api-gateway/Dockerfile
#
# Same Node.js pattern as order-service and notification-service, with
# ONE difference worth understanding: this service currently has no
# package-lock.json file (it was never generated in our build environment).
#
# npm ci REQUIRES a lockfile to exist — it will fail immediately without one.
# So here we use "npm install" instead, which works with or without a
# lockfile (and will generate one as a side effect).
#
# Feynman version: npm ci is like following an exact, signed recipe card —
# refuses to cook if the card is missing. npm install is more like a chef
# who can improvise from the ingredient list (package.json) alone, but
# might pick a slightly different brand of an ingredient than last time.
#
# IMPORTANT FOLLOW-UP: once you build this once and get a package-lock.json
# generated locally (just run `npm install` directly on your machine inside
# api-gateway/), commit that lockfile to git and switch this Dockerfile to
# "npm ci" like the other Node services — for the same reproducibility reasons.

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

FROM node:20-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app .

USER appuser

EXPOSE 8000

CMD ["node", "src/index.js"]
