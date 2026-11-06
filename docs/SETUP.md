# SETUP

## Prerequisites
JDK 21, Maven (wrapper included), Node 20+, Git. No local database needed — the backend connects to Supabase (hosted PostgreSQL).

## Database (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project → Settings → Database → Connection string → JDBC** and copy the JDBC URL.
3. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in your `.env` (see below).
4. Flyway will create all tables and seed data on first startup.

## Environment
Copy `.env.example` to `.env` (root) and `frontend/.env` for `VITE_API_URL`. Spring reads OS environment variables; in IntelliJ set them in the Run Configuration, or export them in your shell.

| Variable | Purpose |
|---|---|
| DB_URL | Supabase JDBC URL (`jdbc:postgresql://db.<ref>.supabase.co:5432/postgres`) |
| DB_USERNAME | Supabase DB user (usually `postgres`) |
| DB_PASSWORD | Supabase DB password |
| JWT_SECRET | signing key, 32+ bytes |
| JWT_EXPIRATION_MINUTES | token lifetime (default 480) |
| CORS_ALLOWED_ORIGINS | comma-separated origins |
| ADMIN_EMAIL, ADMIN_PASSWORD | seeded admin |
| SPRING_PROFILES_ACTIVE | `dev` or `prod` |
| VITE_API_URL | frontend API base |

## Run
```
cd backend  && ./mvnw spring-boot:run     # http://localhost:8080
cd frontend && npm install && npm run dev # http://localhost:5173
```

## Docker Compose
The `docker-compose.yml` builds and runs only the backend and frontend containers. Supabase is external; set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in your host environment (or a `.env` file) before running `docker compose up`.

## Ports
Backend 8080, frontend 5173.

## Common problems
- `Connection refused` / `FATAL: password authentication failed`: check DB_URL/DB_USERNAME/DB_PASSWORD against Supabase dashboard.
- CORS errors: add the frontend origin to CORS_ALLOWED_ORIGINS.
- Flyway checksum error: never edit applied migrations; add a new one.
