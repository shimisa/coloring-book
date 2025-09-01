# Multi-stage build for optimized image size
FROM maven:3.9.4-eclipse-temurin-21 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies (for better layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

# Install curl for health checks (optional)
RUN apk --no-cache add curl

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && \
    chown -R appuser:appgroup /app

# Copy the JAR from build stage
COPY --from=build --chown=appuser:appgroup /app/target/photo-painter-*.jar app.jar

# Switch to non-root user
USER appuser

# Expose the port
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8082/api/photo-painter/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
