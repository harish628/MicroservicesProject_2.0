# frontend/Dockerfile
#
# What this file does:
# Builds the React app into static HTML/CSS/JS files, then serves those
# files using nginx — a dedicated, lightweight web server.
#
# Feynman version — why this is fundamentally different from every other
# Dockerfile we've written so far:
# Every backend service (auth, product, order, payment, notification, gateway)
# needs a LANGUAGE RUNTIME alive at all times — Go binary running, Python
# interpreter running, Node process running — because they actively compute
# things on every request (check a database, verify a token, calculate a total).
#
# React is different. "npm run build" produces plain HTML, CSS, and JS files —
# completely finished, static documents. There's nothing left to "run."
# The browser does all the work once it downloads these files. So our final
# container doesn't need Node.js installed AT ALL — it just needs ANY web
# server capable of handing out static files, and nginx is the
# industry-standard choice for exactly that job: extremely fast, extremely
# lightweight, built for nothing but serving files efficiently.
#
# This is why Stage 2 here uses a completely different base image family
# (nginx, not node) — unlike our other services where both stages share
# the same language's base image.

# ── STAGE 1: BUILD THE STATIC FILES ──────────────────────────────────────────
FROM node:20-alpine3.22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# This is the moment React becomes "finished" — npm run build reads all our
# .js files, JSX, CSS, resolves every import, and outputs a /build folder
# containing only plain HTML/CSS/JS, minified and optimized.
#
# REACT_APP_API_URL gets baked into the JavaScript bundle at build time —
# this is important to understand: unlike backend .env variables which are
# read fresh every time the container starts, React environment variables
# are permanently embedded into the compiled JS during this build step.
# If you need to point at a different API URL later, you must REBUILD this
# image — you cannot just change an environment variable at container runtime.
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max_old_space_size=4096

RUN npm run build

# ── STAGE 2: SERVE THE STATIC FILES ──────────────────────────────────────────
FROM nginx:1.29-alpine

# Copy ONLY the compiled /build output from Stage 1.
# Everything else — node_modules, source .js files, the entire Node.js
# runtime itself — is completely discarded. This typically results in a
# final image of around 25-40MB, versus 300MB+ if we'd naively kept Node
# installed in the final image just to serve static files.
COPY --from=builder /app/build /usr/share/nginx/html

# React Router (used for our /product/:id, /checkout, /orders routes) needs
# a small nginx config tweak: if someone refreshes the browser directly on
# /orders, nginx's default behavior is to look for a literal file called
# "orders" and return 404. We need nginx to instead always serve index.html
# and let React Router handle the routing client-side.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
