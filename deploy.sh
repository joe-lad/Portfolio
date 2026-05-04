#!/bin/bash
set -a
source "$(dirname "$0")/.env"
set +a

echo "🔨 Building image..."
docker build -t $REGISTRY/portfolio:latest .

echo "📦 Pushing to Synology registry..."
docker push $REGISTRY/portfolio:latest

echo "🚀 Deploying on Synology..."
ssh $SYNOLOGY_USER@$SYNOLOGY_IP -p $SYNOLOGY_SSH_PORT "
  sudo /usr/local/bin/docker pull $REGISTRY/portfolio:latest &&
  sudo /usr/local/bin/docker stop portfolio &&
  sudo /usr/local/bin/docker rm portfolio &&
  sudo /usr/local/bin/docker run -d \
    --name portfolio \
    --restart unless-stopped \
    -p 3000:3000 \
    -e RAILS_ENV=production \
    -e RAILS_MASTER_KEY='$RAILS_MASTER_KEY' \
    -e DB_HOST='$DB_HOST' \
    -e DB_PORT='$DB_PORT' \
    -e PORTFOLIO_DATABASE_PASSWORD='$PORTFOLIO_DATABASE_PASSWORD' \
    -e ADMIN_USERNAME='$ADMIN_USERNAME' \
    -e ADMIN_PASSWORD='$ADMIN_PASSWORD' \
    $REGISTRY/portfolio:latest
"

echo "✅ Done! Visit https://jknight.uk"