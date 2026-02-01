#!/bin/bash

# Exit on error
set -e

# Define image names
BACKEND_IMAGE="varshneysarthak/safeconvert-backend:latest"
FRONTEND_IMAGE="varshneysarthak/safeconvert-frontend:latest"
GATEWAY_IMAGE="varshneysarthak/safeconvert-gateway:latest"

# Ensure buildx builder exists
echo "Setting up Docker Buildx..."
docker buildx create --use --name safeconvert-builder || docker buildx use safeconvert-builder
docker buildx inspect --bootstrap

# Build and Push Backend
echo "Building and Pushing Backend..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t $BACKEND_IMAGE \
  --push backend

# Build and Push Frontend
# Note: Frontend build requires ARG variables. Ensure these are set or passed if needed.
# For public release, we might want to default them or warn the user.
echo "Building and Pushing Frontend..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t $FRONTEND_IMAGE \
  -f frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_GA_ID="" \
  --build-arg NEXT_PUBLIC_CLARITY_ID="" \
  --push .

# Build and Push Gateway
echo "Building and Pushing Gateway..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t $GATEWAY_IMAGE \
  --push nginx

echo "All images built and pushed successfully!"
echo "- $BACKEND_IMAGE"
echo "- $FRONTEND_IMAGE"
echo "- $GATEWAY_IMAGE"
