# product-service/Dockerfile
#
# What this file does:
# Builds the Product Service into a container image, using a multi-stage
# build to keep dependency installation separate from running the app.
#
# Feynman version — how this differs from auth-service's Dockerfile:
# Go COMPILES into one binary file — Stage 1 builds it, Stage 2 just copies
# that single file over, discarding the entire Go toolchain.
#
# Python does NOT compile like that. There's no single "product-service binary"
# to produce — Python code runs directly, interpreted, every time. So instead
# of "build then copy the result," our multi-stage split here is about
# "install dependencies in one stage, then copy only the installed packages
# (not pip itself, not build tools) into a clean final stage."
#
# Think of it like ordering ingredients online (Stage 1: a delivery truck
# full of packaging, invoices, and the ingredients) versus what actually
# goes in your fridge (Stage 2: just the ingredients, no truck, no packaging).

# ── STAGE 1: BUILD/INSTALL DEPENDENCIES ──────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# gcc and other build tools are needed to compile certain Python packages
# that have C extensions (some cryptography/database libraries need this).
# These tools are NOT needed once the packages are already compiled —
# which is exactly why they belong in the throwaway "builder" stage.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy ONLY requirements.txt first — same caching trick as auth-service.
# If requirements.txt doesn't change between builds, Docker reuses the
# cached "pip install" layer instead of re-downloading every package.
COPY requirements.txt .

# Install dependencies into a separate location (/install) rather than
# the system Python — this makes it trivial to copy ONLY the installed
# packages into Stage 2, leaving gcc and build tools behind.
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── STAGE 2: RUN ──────────────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install only the runtime library needed to actually CONNECT to MySQL
# (default-libmysqlclient-dev was for COMPILING the driver in Stage 1;
# this is the much smaller runtime-only equivalent)
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy ONLY the installed Python packages from Stage 1 — not gcc,
# not pip's cache, not any build artifacts.
COPY --from=builder /install /usr/local

# Now copy the actual application source code
COPY . .

# Create a non-root user, same security reasoning as auth-service:
# if this container is ever compromised, the attacker isn't root.
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

EXPOSE 8002

# Run with uvicorn directly (not "python main.py") — this is the
# production-appropriate way to start a FastAPI app. --host 0.0.0.0 is
# required inside Docker: "localhost" inside a container only means
# "this container," but 0.0.0.0 means "accept connections from anywhere,"
# which is what lets Docker's port mapping actually reach the app.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
