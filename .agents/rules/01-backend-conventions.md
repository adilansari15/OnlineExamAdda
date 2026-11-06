---
trigger: glob
globs: backend/**/*.java
description: Spring Boot coding rules
---

- Base package `com.examadda`, layered: controller → service → repository. No business logic in controllers or entities.
- Controllers accept and return DTOs wrapped in `ApiResponse<T>`. Never expose JPA entities.
- Constructor injection only. Services are `@Transactional` at the method level where they write.
- Validate requests with Bean Validation (`@Valid`). Throw typed exceptions (`ResourceNotFoundException`, `ConflictException`, `AttemptClosedException`, ...); `GlobalExceptionHandler` maps them.
- Use the injected `Clock` for every time read. No `Instant.now()` / `LocalDateTime.now()` in services.
- Avoid N+1: use fetch joins, `@EntityGraph` or DTO projections. Paginate every list endpoint.
- Schema changes only through new Flyway files `V{n}__description.sql`. Never edit an applied migration. `ddl-auto=validate`.
- Authorization via `@PreAuthorize` and route rules. Ownership checks (student can only read own attempts) live in services.
- Write tests for every service method that contains a rule (see `docs/TESTING.md`).
