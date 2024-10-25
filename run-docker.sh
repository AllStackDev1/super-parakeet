#!/bin/bash

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Create .env from .env.development if it doesn't exist
if [ ! -f .env ] && [ -f .env.development ]; then
    echo "Creating .env file from .env.development..."
    cp .env.development .env || handle_error "Failed to create .env file"
fi

# Check if .env exists now
if [ ! -f .env ]; then
    handle_error "No .env file found and couldn't create one"
fi

# Determine environment
ENV=${NODE_ENV:-development}
echo "Starting in $ENV environment..."

# Choose the appropriate docker-compose files based on environment
if [ "$ENV" = "development" ]; then
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build "$@"
elif [ "$ENV" = "production" ]; then
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build "$@"
else
    handle_error "Invalid environment: $ENV"
fi