# Context: Security & Workflow Protocol

## Security Standards
- Passwords hashed with BCrypt.
- Environment variables store secrets (`JWT_SECRET`, `SPRING_DATASOURCE_PASSWORD`); no secrets in code or git.
- Self-registration is restricted to `ROLE_STUDENT`.
- Endpoint security:
  - `/api/auth/**`, `/api/health` are publicly accessible.
  - `/api/admin/**` requires `ROLE_ADMIN`.
  - All other API routes require authentication.

## Sub-part Session Protocol
1. Consult `docs/PROGRESS.md` (or root `progress.md`) to identify the active sub-part.
2. Review the corresponding phase guide under `docs/phases/`.
3. Implement strictly within the boundaries of the designated sub-part.
4. Execute tests specified in `docs/TESTING.md` (or root `test.md`).
5. Update progress records upon completion.

