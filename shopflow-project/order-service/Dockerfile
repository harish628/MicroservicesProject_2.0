# order-service/Dockerfile
#
# What this file does:
# Builds the Order Service into a container image.
#
# Feynman version — how this differs from auth-service and product-service:
# Like Python, Node.js doesn't compile to a single binary either — but unlike
# Python, there's no separate "build tools vs runtime" split needed for most
# Node apps. The real reason we still use two stages here is DEPENDENCY
# CACHING: copying package.json BEFORE the rest of the code means Docker can
# skip re-running "npm install" entirely if your dependencies haven't changed,
# even if you've edited your actual application code 50 times since the
# last build. This alone can turn a 2-minute rebuild into a 5-second one.
#
# Also note: we use "npm ci" instead of "npm install" here.
#   npm install → may update package-lock.json, slower, meant for development
#   npm ci      → installs EXACTLY what's in package-lock.json, faster,
#                 deterministic — the correct choice for any automated build
#                 (Docker, CI/CD pipelines) where you want the exact same
#                 dependency versions every single time, no surprises.

FROM node:20-alpine AS builder

WORKDIR /app

# Copy ONLY dependency files first — the caching trick, same as the other services
COPY package*.json ./

# npm ci requires package-lock.json to exist and match package.json exactly.
# It deletes node_modules first if present, then installs fresh from the lockfile.
RUN npm ci --omit=dev

# Now copy the actual application source code
COPY . .

# ── FINAL STAGE ───────────────────────────────────────────────────────────────
# We still use a second stage even though it's the same base image —
# this guarantees the final image NEVER accidentally contains leftover
# build caches, dev dependencies, or temp files that could sneak in during
# Stage 1's npm ci process.
FROM node:20-alpine

WORKDIR /app

# Create a non-root user — alpine images include addgroup/adduser by default
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the installed dependencies AND the application code from the builder stage
COPY --from=builder /app .

# Switch to non-root user before running anything
USER appuser

EXPOSE 8003

# Run the actual entry point — matches "npm start" in package.json,
# but calling node directly avoids an unnecessary extra process layer
CMD ["node", "src/index.js"]
