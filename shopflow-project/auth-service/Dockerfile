# auth-service/Dockerfile
#
# What this file does:
# Builds the Auth Service into a tiny, production-ready container image.
#
# Feynman version:
# This is a two-stage kitchen. Stage 1 ("builder") is the messy prep kitchen —
# full of compilers, build tools, and source code. Stage 2 is the clean plate
# we actually serve — just the compiled binary, nothing else. The customer
# (production server) never sees the mess; they only get the finished dish.
#
# Why this matters for Go specifically: Go compiles to ONE single binary file
# with everything baked in. That means our final image can be almost empty —
# no Go installed, no source code, just one executable. This is why Go
# containers are famously tiny (often under 20MB) compared to Python or Node.

# ── STAGE 1: BUILD ───────────────────────────────────────────────────────────
FROM golang:1.21-alpine AS builder

# Alpine is a minimal Linux distro — much smaller than full Ubuntu/Debian images
# git is needed because some Go modules are fetched directly from git repos
RUN apk add --no-cache git

WORKDIR /app

# Copy ONLY dependency files first, not the whole source code yet.
# Feynman: like buying all your ingredients before you start cooking anything.
# Docker caches this layer — if go.mod/go.sum don't change between builds,
# Docker skips re-downloading dependencies entirely. Huge speed win during development.
COPY go.mod ./
COPY go.sum* ./

# Download dependencies and generate go.sum if it doesn't exist yet
# (go.sum is Go's "lockfile" — pins exact dependency versions, like package-lock.json)
RUN go mod download 2>/dev/null || true

# Now copy the actual application source code
COPY . .

# Make sure go.sum is fully generated and consistent with our imports
RUN go mod tidy

# Compile the application into a single static binary named "auth-service"
#   CGO_ENABLED=0 → don't link against C libraries (needed for true static binary)
#   GOOS=linux    → always compile for Linux, since that's what containers run
#   -ldflags="-s -w" → strips debug symbols, makes the binary smaller
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o auth-service main.go

# ── STAGE 2: RUN ──────────────────────────────────────────────────────────────
# alpine here too (not "scratch") because we still need basic things like
# ca-certificates for HTTPS calls and a shell for debugging if needed.
# This keeps the final image small (~15-20MB) but not so bare it's hard to debug.
FROM alpine:3.19

# ca-certificates: needed if this service ever makes HTTPS calls (e.g. to other services)
# tzdata: needed for correct timestamp handling
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Create a dedicated non-root user to run the app
# Feynman: like giving the kitchen staff a specific uniform and badge instead
# of letting them wander in wearing the manager's master key. If anything goes
# wrong inside this container, the damage is limited to what this limited user can touch.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy ONLY the compiled binary from the builder stage — nothing else.
# This is the magic of multi-stage builds: source code, Go toolchain, and
# build cache from Stage 1 are completely discarded here.
COPY --from=builder /app/auth-service .

# Switch to the non-root user before running anything
USER appuser

# Document which port this container listens on (informational — doesn't publish it)
EXPOSE 8001

# The command that runs when the container starts
CMD ["./auth-service"]
