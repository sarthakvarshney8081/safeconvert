#!/bin/bash

# Exit on error
# set -e (Disabled for debugging)

# Default values
PLATFORMS="linux/amd64"
PUSH=false
CLEANUP=false

# Simple argument parsing
BUILD_ENABLED=true
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --full) PLATFORMS="linux/amd64,linux/arm64"; PUSH=true ;;
        --push) PUSH=true ;;
        --cleanup) CLEANUP=true ;;
        --cleanup-only) CLEANUP=true; BUILD_ENABLED=false ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# Define image names
BACKEND_IMAGE="varshneysarthak/safeconvert-backend:latest"
FRONTEND_IMAGE="varshneysarthak/safeconvert-frontend:latest"
GATEWAY_IMAGE="varshneysarthak/safeconvert-gateway:latest"

# Ensure buildx builder exists
echo "Setting up Docker Buildx..."
docker buildx create --use --name safeconvert-builder || docker buildx use safeconvert-builder
docker buildx inspect --bootstrap

BUILD_OPTS="--platform $PLATFORMS"
if [ "$PUSH" = true ]; then
  BUILD_OPTS="$BUILD_OPTS --push"
else
  BUILD_OPTS="$BUILD_OPTS --load"
fi

if [ "$BUILD_ENABLED" = true ]; then
    # Build Backend
    echo "Building Backend ($PLATFORMS)..."
    docker buildx build $BUILD_OPTS -t $BACKEND_IMAGE ./backend

    # Build Frontend
    # We use the root context (.) because the Dockerfile needs access to both /wasm and /frontend
    echo "Building Frontend ($PLATFORMS)..."
    docker buildx build $BUILD_OPTS \
      -t $FRONTEND_IMAGE \
      -f frontend/Dockerfile \
      --build-arg NEXT_PUBLIC_GA_ID="" \
      --build-arg NEXT_PUBLIC_CLARITY_ID="" \
      .

    # Build Gateway
    echo "Building Gateway ($PLATFORMS)..."
    docker buildx build $BUILD_OPTS -t $GATEWAY_IMAGE nginx
fi

if [ "$CLEANUP" = true ]; then
    echo "Cleaning up Docker resources..."
    docker system prune -f
    docker buildx prune -f
fi

echo "Process completed successfully!"
