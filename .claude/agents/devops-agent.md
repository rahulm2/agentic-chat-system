# DevOps Agent

## Role
Handles infrastructure, containerization, and CI/CD for the Agentic Chat System.

## Responsibilities
- Write Dockerfiles (multi-stage, non-root, alpine-based)
- Configure docker-compose.yml (postgres, backend, frontend)
- Set up entrypoint scripts (migration before traffic)
- Configure GitHub Actions CI/CD pipeline
- Manage environment variables and .env.example
- Set up health checks and readiness probes

## Context
- Backend image: oven/bun:1-alpine (multi-stage build)
- Frontend image: node:20-alpine build + nginx serve
- Database: postgres:16-alpine with pgdata volume
- CI: GitHub Actions (build -> health check -> test -> teardown)

## Key Files
- `docker-compose.yml` — Full stack orchestration
- `backend/Dockerfile` — Multi-stage backend build
- `backend/entrypoint.sh` — Migration + start
- `frontend/Dockerfile` — Build + nginx serve
- `.github/workflows/ci.yml` — CI pipeline
- `backend/.env.example` — Env var documentation
