# payment-service/Dockerfile
#
# What this file does:
# Builds the Payment Service into a container image. Same Python multi-stage
# pattern as product-service — Stage 1 installs dependencies (with build
# tools available), Stage 2 runs the app (without them).
#
# One real difference worth understanding here: locally, you run this with
#   python app.py
# which uses Flask's own built-in development server. Flask's documentation
# explicitly says this server is "not intended for use in production" —
# it's single-threaded by default and not built for real traffic.
#
# Feynman version: Flask's dev server is like cooking on a single home stove
# burner — fine for testing one dish, but a real restaurant kitchen (gunicorn)
# has multiple burners running simultaneously to handle real order volume.
# Inside this container, we run gunicorn instead — same Flask app code,
# just served by something actually meant for production.

# ── STAGE 1: BUILD/INSTALL DEPENDENCIES ──────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── STAGE 2: RUN ──────────────────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local
COPY . .

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

EXPOSE 8004

# gunicorn syntax: "app:create_app()" means
#   - look inside app.py (the "app" module)
#   - call the create_app() factory function defined there
#   - that function returns the actual Flask app object to serve
#
# --workers 2: run 2 separate worker processes that share incoming requests
#   between them — this is the "multiple burners" from the analogy above.
#   2 is a sensible default for a small container; real production tuning
#   uses a formula based on CPU cores, but we're deliberately keeping this
#   modest given our free-tier resource constraints.
CMD ["gunicorn", "--bind", "0.0.0.0:8004", "--workers", "2", "app:create_app()"]
