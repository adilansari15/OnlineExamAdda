# Multi-stage Dockerfile for Spring Boot 3 Backend
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Copy maven wrapper and pom.xml
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Download dependencies
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and package application
COPY src src
RUN ./mvnw clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /workspace/target/*.jar app.jar

ENV PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

