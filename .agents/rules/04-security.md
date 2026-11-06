---
trigger: always_on
description: Security baseline
---

- BCrypt password hashing. Never log passwords, tokens or answer keys.
- Role comes from the database/JWT signed by the server. Registration always creates STUDENT; ignore any role in the request body.
- Stateless JWT; `/api/admin/**` requires ROLE_ADMIN; everything except `/api/auth/**` and `/api/health` requires authentication.
- CORS origins from `CORS_ALLOWED_ORIGINS`. No wildcard with credentials.
- Config and secrets from environment variables. `.env` is git-ignored.
- Return generic auth errors (do not reveal whether an email exists on login).
- Full checklist: `docs/SECURITY.md`.
