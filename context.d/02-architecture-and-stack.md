# Context: Architecture & Tech Stack

## Technology Stack
- **Frontend:** React (Vite) + Tailwind CSS v4 + React Router DOM + Axios + Lucide React + Recharts
- **Backend:** Java 21, Spring Boot 3, Spring Security 6, Spring Data JPA, Hibernate, Maven
- **Database:** MySQL 8 managed via Flyway database migrations
- **Testing:**
  - Backend: JUnit 5, Mockito, Spring Boot Test, MockMvc, Testcontainers
  - Frontend: Vitest, React Testing Library, MSW

## System Boundaries
- **Stateless REST Services:** The backend provides purely stateless REST endpoints secured by Bearer JWT tokens.
- **DTO Isolation:** Entity models (`@Entity`) are strictly contained within the persistence and service layers. Only explicitly validated Data Transfer Objects (DTOs) cross the controller boundary.
- **Client Decoupling:** The React single-page application communicates exclusively via REST endpoints using Axios with standard authorization interceptors.

