#!/bin/bash
echo "Building for Firebase deployment..."

# Build the project
npm run build

# Create public directory and copy built files
mkdir -p public
cp -r dist/public/* public/

# Copy Firebase key to functions directory
cp firebase-key.json dist/

echo "Build completed! Ready for Firebase deployment."
echo "Run: firebase deploy"