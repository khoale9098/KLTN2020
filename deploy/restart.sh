#!/bin/bash
set -e

echo "=> Restarting..."
docker-compose down
docker-compose pull
docker-compose up -d

echo "=> Restart complete!"