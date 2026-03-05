#!/bin/sh
set -e

echo "Running table creation..."
node dist/scripts/create-tables.js

echo "Running seeds..."
node dist/scripts/seed-all.js

echo "Starting server..."
exec node dist/server.js