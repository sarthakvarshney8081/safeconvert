# Stage 0: Wasm Builder
FROM rust:1.75-alpine AS wasm-builder
WORKDIR /wasm
RUN apk add --no-cache musl-dev curl
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
# Context is root, so copy wasm folder
COPY wasm/pdf-utils ./
# Build for web target (generates .js and .wasm)
RUN wasm-pack build --target web --out-dir ./pkg

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
# Context is root, so copy frontend package files
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy frontend source files
COPY frontend/ .
# Copy compiled Wasm to public directory so it can be served
COPY --from=wasm-builder /wasm/pkg ./public/wasm
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Disable next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/public ./public
# Set permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
