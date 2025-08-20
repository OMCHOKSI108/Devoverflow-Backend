#!/bin/bash

# Exit on error
set -e

# Install dependencies
echo "Installing dependencies..."
npm install

# Build if needed (uncomment if you have a build step)
# echo "Building application..."
# npm run build

# Start the application
echo "Starting application..."
npm start
