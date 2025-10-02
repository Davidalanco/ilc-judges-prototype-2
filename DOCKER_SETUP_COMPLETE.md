# Docker Setup Complete! 🐳

Your Docker environment with Supabase is now working properly. Here's what was accomplished:

## ✅ Issues Fixed

1. **Docker Desktop VM Permission Issue**
   - Fixed ownership of `/Users/daveconklin/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw`
   - Changed from `root:staff` to `daveconklin:staff`

2. **TypeScript Build Error**
   - Fixed `court_level` parameter issue in `app/api/cases/route.ts`
   - Removed unsupported parameter from `createCase` function call

3. **Port Conflicts**
   - Changed Docker app port from `4000` to `4001` to avoid conflicts
   - Your app runs at http://localhost:4001 in Docker

## 🚀 Available Docker Configurations

### 1. Simple Development Setup (`docker-compose.simple.yml`)
**Perfect for daily development work**
- Next.js app on port 4001
- PostgreSQL database on port 54322
- Development mode with hot reload
- Volume mounting for live code changes

```bash
# Quick commands
npm run docker:dev     # Start everything
npm run docker:logs    # View logs
npm run docker:down    # Stop containers
```

### 2. Full Supabase Stack (`docker-compose.yml`)
**Complete Supabase environment with all services**
- Full Supabase ecosystem (API, Studio, Realtime, Storage)
- Supabase Studio on port 54323
- All Supabase services containerized

## 📋 Docker Commands Reference

```bash
# Development workflow (recommended)
./scripts/docker-dev.sh              # Complete setup script
docker-compose -f docker-compose.simple.yml up -d   # Start simple stack
docker-compose -f docker-compose.simple.yml down    # Stop simple stack

# Full Supabase stack
docker-compose up -d                  # Start full stack
docker-compose down                   # Stop full stack

# Utilities
docker-compose ps                     # Show running containers
docker-compose logs -f app            # Follow app logs
docker system prune -f               # Clean up Docker
```

## 🌐 Service URLs (When Running)

### Simple Stack
- **Next.js App**: http://localhost:4001
- **PostgreSQL**: postgresql://postgres:postgres@localhost:54322/postgres

### Full Stack (when using main docker-compose.yml)
- **Next.js App**: http://localhost:4000
- **Supabase API**: http://localhost:54321
- **Supabase Studio**: http://localhost:54323
- **Email Testing**: http://localhost:54324
- **PostgreSQL**: postgresql://postgres:postgres@localhost:54322/postgres

## 🔧 Environment Configuration

- **Local Development**: Use `.env.local`
- **Docker Development**: Uses `.env.docker` (auto-created)
- **Port Mapping**: App accessible on host port 4001

## 📁 Created Files

- `Dockerfile` - Production build image
- `Dockerfile.dev` - Development image (no build step)
- `docker-compose.yml` - Full Supabase stack
- `docker-compose.simple.yml` - Simple dev stack
- `.dockerignore` - Docker ignore rules
- `.env.docker` - Docker environment variables
- `scripts/docker-dev.sh` - Complete setup script
- `scripts/setup-docker-env.sh` - Environment setup

## ✨ Next Steps

1. **Start developing**: `npm run docker:dev`
2. **Access your app**: http://localhost:4001
3. **Check logs**: `npm run docker:logs`
4. **Stop when done**: `npm run docker:down`

## 🛠 Troubleshooting

If you encounter issues:

1. **Port conflicts**: Check what's using ports with `lsof -ti:4001`
2. **Permission issues**: Run `sudo chown -R $(whoami):staff /Users/$(whoami)/Library/Containers/com.docker.docker/Data/vms/0/data/`
3. **Docker not running**: `open -a Docker` and wait for startup
4. **Clean start**: `docker-compose down -v && docker system prune -f`

Your Docker setup is ready for development! 🎉
