#!/bin/bash

# Docker Development Script for Supabase + Next.js

set -e

echo "🐳 Setting up Docker development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Docker and Supabase CLI are ready"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down -v

# Build and start containers
echo "🚀 Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if Supabase API is ready
echo "🔍 Checking Supabase API..."
for i in {1..30}; do
    if curl -s http://localhost:54321/health > /dev/null 2>&1; then
        echo "✅ Supabase API is ready"
        break
    fi
    echo "   Waiting for Supabase API... ($i/30)"
    sleep 2
done

# Check if Next.js app is ready
echo "🔍 Checking Next.js application..."
for i in {1..30}; do
    if curl -s http://localhost:4000 > /dev/null 2>&1; then
        echo "✅ Next.js application is ready"
        break
    fi
    echo "   Waiting for Next.js app... ($i/30)"
    sleep 2
done

echo ""
echo "🎉 Docker development environment is ready!"
echo ""
echo "📋 Available services:"
echo "   🌐 Next.js App:      http://localhost:4000"
echo "   🗄️  Supabase API:    http://localhost:54321"
echo "   🎛️  Supabase Studio: http://localhost:54323"
echo "   📧 Email Testing:    http://localhost:54324"
echo "   💾 Database:         postgresql://postgres:postgres@localhost:54322/postgres"
echo ""
echo "📝 Useful commands:"
echo "   📊 View logs:         docker-compose logs -f"
echo "   📊 View app logs:     docker-compose logs -f app"
echo "   🛑 Stop all:          docker-compose down"
echo "   🔄 Restart app:       docker-compose restart app"
echo "   🧹 Clean up:          docker-compose down -v"
echo ""
