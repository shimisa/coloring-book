# Local Development Setup

This guide explains how to run the Photo Painter services locally from IntelliJ while using Docker for MySQL and Kafka.

## Prerequisites

- Docker Desktop installed and running
- IntelliJ IDEA with Spring Boot support
- Maven installed
- Environment variables configured (see `.env` file)

## Starting Infrastructure Services

For local development, use the `docker-compose.local.yml` file which runs only the infrastructure services (MySQL databases and Kafka):

```powershell
# Start all infrastructure services
docker-compose -f docker-compose.local.yml up -d

# Check status
docker-compose -f docker-compose.local.yml ps

# View logs
docker-compose -f docker-compose.local.yml logs -f

# Stop all services
docker-compose -f docker-compose.local.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.local.yml down -v
```

## Services Overview

The local docker-compose provides:

### Kafka (KRaft mode - no Zookeeper)
- **Port:** 9092
- **Connection:** `localhost:9092`
- **Auto-creates topics:** Yes

### MySQL Databases
1. **User Auth DB**
   - **Port:** 3307
   - **Database:** `${MYSQL_DATABASE}` (default: user_auth_db)
   - **Connection:** `jdbc:mysql://localhost:3307/${MYSQL_DATABASE}`

2. **Photo Painter DB**
   - **Port:** 3308
   - **Database:** `${MYSQL_DATABASE_SERVER}` (default: photo_painter_db)
   - **Connection:** `jdbc:mysql://localhost:3308/${MYSQL_DATABASE_SERVER}`

3. **Upload Service DB**
   - **Port:** 3309
   - **Database:** `${MYSQL_UPLOAD_SERVICE}` (default: upload_service_db)
   - **Connection:** `jdbc:mysql://localhost:3309/${MYSQL_UPLOAD_SERVICE}`

**Default credentials for all MySQL instances:**
- **Username:** root
- **Password:** `${MYSQL_ROOT_PASSWORD}` (from .env file, default: rootpassword)

## Running Services from IntelliJ

### 1. Start Infrastructure
```powershell
docker-compose -f docker-compose.local.yml up -d
```

### 2. Configure Application Properties

Each service should have these settings in their `application.properties` or environment variables:

**For User Auth Service (port 8081):**
```properties
spring.datasource.url=jdbc:mysql://localhost:3307/${MYSQL_DATABASE}
spring.kafka.bootstrap-servers=localhost:9092
```

**For Photo Painter Service (port 8082):**
```properties
spring.datasource.url=jdbc:mysql://localhost:3308/${MYSQL_DATABASE_SERVER}
spring.kafka.bootstrap-servers=localhost:9092
```

**For Upload Service (port 8083):**
```properties
spring.datasource.url=jdbc:mysql://localhost:3309/${MYSQL_UPLOAD_SERVICE}
spring.kafka.bootstrap-servers=localhost:9092
```

**For API Gateway (port 8080):**
```properties
app.user-auth-service.url=http://localhost:8081
app.photo-painter-service.url=http://localhost:8082
```

### 3. Run Services in IntelliJ

Run each Spring Boot service individually from IntelliJ in this order:
1. User Auth Service
2. Photo Painter Service
3. Upload Service
4. API Gateway
5. Frontend (React app) - `npm start` in UI folder

## Testing Kafka Connection

You can test Kafka by listing topics:

```powershell
# Using Docker exec
docker exec -it kafka-local kafka-topics.sh --bootstrap-server localhost:9092 --list

# Create a test topic
docker exec -it kafka-local kafka-topics.sh --bootstrap-server localhost:9092 --create --topic test-topic --partitions 1 --replication-factor 1
```

## Troubleshooting

### Kafka connection issues
- Make sure Kafka is running: `docker ps | findstr kafka-local`
- Check Kafka logs: `docker logs kafka-local`
- Ensure your services use `localhost:9092` for Kafka connection

### MySQL connection issues
- Check if MySQL is running: `docker ps | findstr mysql-local`
- Test connection: `mysql -h 127.0.0.1 -P 3307 -u root -p`
- Check MySQL logs: `docker logs user-auth-mysql-local`

### Port conflicts
If ports are already in use:
- Check what's using the port: `netstat -ano | findstr :9092`
- Stop the conflicting service or change the port in docker-compose.local.yml

## Production Deployment

For production deployment, use the main `docker-compose.yml` file which includes all services in a Docker network:

```powershell
docker-compose up -d
```

This will run all services (including Spring Boot apps) in Docker containers with proper networking.

