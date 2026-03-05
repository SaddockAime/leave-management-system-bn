# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base

LABEL andasy_launch_runtime="Node.js"

WORKDIR /app
ENV NODE_ENV="production"

# ─── Build stage ─────────────────────────────────────────────────────────────
FROM base AS build

# Native deps for usb + hidapi (equivalent of railway's nixPkgs)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    node-gyp \
    pkg-config \
    python-is-python3 \
    libusb-1.0-0-dev \
    libudev-dev \
    libhidapi-dev && \
    rm -rf /var/lib/apt/lists/*

COPY package-lock.json package.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

RUN npm prune --omit=dev

# ─── Final image ─────────────────────────────────────────────────────────────
FROM base AS runner

# Runtime libs only (no dev headers needed in final image)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    libusb-1.0-0 \
    libudev1 \
    libhidapi-hidraw0 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY docker-entrypoint.js ./

EXPOSE 4000
ENTRYPOINT ["node", "docker-entrypoint.js"]