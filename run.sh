#!/bin/bash

# Exit if any command fails
set -e

echo "Starting backend (plotvisAPI) and frontend (Angular)..."

# Run both backend and frontend in parallel
npx concurrently \
  "dotnet run --project plotvisAPI --urls=http://localhost:5119" \
  "cd web/plotvis-web && npm start"
