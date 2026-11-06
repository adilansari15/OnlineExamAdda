# SECURITY CHECKLIST

## Auth
- [ ] BCrypt (strength 10+), no plaintext/logged passwords
- [ ] JWT signed HS256+ with 32+ byte secret from env, expiry configured (default 480 min so it outlasts long exams)
- [ ] Register ignores role input; admin seeded from env
- [ ] Generic login error message; rate limit or delay on repeated failures (8C)
- [ ] Disabled users cannot log in or use an existing token

## Authorization
- [ ] `/api/admin/**` ROLE_ADMIN only; all else authenticated except `/api/auth/**`, `/api/health`
- [ ] Ownership check on attempts, results, review
- [ ] Method security enabled (`@EnableMethodSecurity`)

## Exam integrity
- [ ] Server time authority, grace window, closed-attempt rejection
- [ ] No answer key or explanation in payloads before submit
- [ ] Idempotent submit with DB uniqueness, row lock during evaluation
- [ ] Quiz lock once attempted

## Input and output
- [ ] Bean Validation on every request DTO; size limits on text fields
- [ ] JPA parameterized queries only (no string-built JPQL/SQL)
- [ ] Output via DTOs; no entity or stack trace leakage; global handler hides internals
- [ ] React escapes by default; never use `dangerouslySetInnerHTML` on user content

## Config
- [ ] Secrets only in env; `.env` ignored by git
- [ ] CORS limited to configured origins
- [ ] Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy; HSTS in prod)
- [ ] Prod profile: no SQL logging, no detailed errors, Swagger disabled or protected

## Known trade-off
JWT stored in `localStorage` (simple, XSS-exposed). Mitigation: strict escaping, no inline scripts, short exposure. Revisit httpOnly cookie in DECISIONS if requirements change.
