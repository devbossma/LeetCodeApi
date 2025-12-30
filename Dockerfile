# Multi-stage build for optimal image size

# Stage 1: Build
FROM node:24.12.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src ./src
COPY prisma.config.ts ./prisma.config.ts

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# List generated files for debugging
RUN find /app -name ".prisma" -type d 2>/dev/null || true
RUN find /app -name "@prisma" -type d 2>/dev/null || true


# Stage 2: Production
FROM node:24.12.0-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user (security best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Copy Prisma schema
COPY prisma ./prisma/
COPY prisma.config.ts ./prisma.config.ts

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy generated files from builder (including Prisma client if it's in dist)
# This assumes your build process includes the generated Prisma client
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy the migration history from the project root
COPY --from=builder /app/prisma/* ./prisma

# Copy seed data
COPY data ./data

# Create logs directory and set permissions
RUN mkdir -p /app/logs

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to nodejs user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]