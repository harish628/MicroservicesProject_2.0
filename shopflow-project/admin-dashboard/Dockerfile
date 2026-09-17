# admin-dashboard/Dockerfile
#
# Same fundamental idea as frontend/Dockerfile — Angular, like React,
# compiles to static HTML/CSS/JS with nothing left to "run" once built.
# Stage 1 uses Node to compile; Stage 2 uses nginx to serve, with Node
# completely absent from the final image.
#
# The one detail that genuinely differs from React: Angular's build output
# lands in dist/shopflow-admin/ (nested under the project name, as defined
# in angular.json), NOT a flat dist/ folder. Getting this path wrong is
# the single most common mistake when Dockerizing Angular apps — the build
# succeeds, but Stage 2 copies from the wrong path and nginx serves an
# empty/missing folder.

# ── STAGE 1: BUILD THE STATIC FILES ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ── STAGE 2: SERVE THE STATIC FILES ──────────────────────────────────────────
FROM nginx:1.25-alpine

# Note the nested path here — this MUST exactly match angular.json's
# outputPath ("dist/shopflow-admin"), confirmed directly from this project's
# actual angular.json rather than assumed.
COPY --from=builder /app/dist/shopflow-admin /usr/share/nginx/html

# Same client-side routing fix as the React frontend — Angular's router
# has the identical refresh-on-a-route problem, same solution.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
