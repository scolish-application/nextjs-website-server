FROM node:20-slim AS builder

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# First copy only package files to leverage Docker cache
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

CMD ["pnpm", "run", "dev"]