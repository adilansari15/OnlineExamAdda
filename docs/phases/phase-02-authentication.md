# Phase 2 — Authentication
Goal: secure login for students and admin, route protection both sides.

## 2A — Backend auth and security
**Docs:** API (Auth), SECURITY, DATABASE (users, roles)
**Tasks**
- `POST /auth/register` (STUDENT only; email unique; password policy: 8+ chars, letter + number), `POST /auth/login`, `GET /auth/me`.
- `JwtService` (HS256, claims: sub=userId, role, exp), `JwtAuthFilter`, `UserDetailsService`, disabled-user check.
- `SecurityConfig`: stateless, BCrypt, CORS, route rules (`/api/auth/**`, `/api/health` public; `/api/admin/**` ADMIN; rest authenticated), `@EnableMethodSecurity`.
- 401/403 JSON handlers using the error envelope. Generic login failure message.
**Done when:** tests pass for register/login/me, duplicate email 409, bad credentials 401, student on `/api/admin/x` 403, tampered/expired token 401, admin seeded login works.

## 2B — Frontend auth and route guards
**Docs:** DESIGN (Login/Register), ARCHITECTURE (routes)
**Tasks**
- Login and Register pages (validation, server field errors, loading state, link between them).
- `AuthContext`: token + user, `login`, `register`, `logout`, bootstrap via `/auth/me` on load.
- Axios request interceptor adds Bearer token; response interceptor logs out on 401 (except login call).
- `ProtectedRoute` and `RoleRoute`; redirect: admin → `/admin/dashboard`, student → `/app/overview`; unauthorized page.
- Wire Logout in both sidebars; show user name in top bar.
**Done when:** both roles can log in and land on the right layout, guards block wrong role and anonymous users, refresh keeps session, tests pass.
