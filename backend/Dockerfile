# Production Dockerfile for Gawin AI Orchestrator
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for building
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install security updates and required system packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    ca-certificates \
    tzdata \
    tini && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S gawin -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=gawin:nodejs /app/dist ./dist
COPY --from=builder --chown=gawin:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=gawin:nodejs /app/package*.json ./

# Create required directories
RUN mkdir -p logs models artifacts && \
    chown -R gawin:nodejs /app

# Switch to non-root user
USER gawin

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "dist/app.js"]