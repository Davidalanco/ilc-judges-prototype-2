#!/bin/bash

# Setup Docker Environment for Local Development

set -e

echo "🔧 Setting up Docker environment..."

# Create necessary directories
mkdir -p scripts
mkdir -p supabase/migrations
mkdir -p supabase/seed

# Copy environment file for Docker
if [ -f .env.local ]; then
    echo "📋 Copying environment variables for Docker..."
    cp .env.local .env.docker
    
    # Update URLs for Docker network
    sed -i.backup 's|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321|g' .env.docker
    sed -i.backup 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=http://localhost:4000|g' .env.docker
    sed -i.backup 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://localhost:4000|g' .env.docker
    sed -i.backup 's|NEXT_PUBLIC_URL=.*|NEXT_PUBLIC_URL=http://localhost:4000|g' .env.docker
    
    # Remove backup file
    rm -f .env.docker.backup
    
    echo "✅ Docker environment file created: .env.docker"
else
    echo "⚠️  No .env.local found, using default Docker environment"
fi

# Initialize Supabase if not already done
if [ ! -f supabase/config.toml ]; then
    echo "🚀 Initializing Supabase..."
    supabase init
fi

# Update package.json with Docker scripts
echo "📦 Adding Docker scripts to package.json..."
npm pkg set scripts.docker:dev="./scripts/docker-dev.sh"
npm pkg set scripts.docker:build="docker-compose build"
npm pkg set scripts.docker:up="docker-compose up -d"
npm pkg set scripts.docker:down="docker-compose down"
npm pkg set scripts.docker:logs="docker-compose logs -f"
npm pkg set scripts.docker:clean="docker-compose down -v && docker system prune -f"

echo ""
echo "🎉 Docker environment setup complete!"
echo ""
echo "🚀 To start development with Docker:"
echo "   npm run docker:dev"
echo ""
echo "🔧 Other useful commands:"
echo "   npm run docker:build  - Build containers"
echo "   npm run docker:up     - Start containers"
echo "   npm run docker:down   - Stop containers"
echo "   npm run docker:logs   - View logs"
echo "   npm run docker:clean  - Clean up everything"
echo ""
