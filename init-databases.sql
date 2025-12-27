-- Initialize all databases for photo-painter microservices

-- Create databases
CREATE DATABASE IF NOT EXISTS user_auth_db;
CREATE DATABASE IF NOT EXISTS photo_painter_db;
CREATE DATABASE IF NOT EXISTS upload_service_db;

-- Grant privileges to appuser
GRANT ALL PRIVILEGES ON user_auth_db.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON photo_painter_db.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON upload_service_db.* TO 'appuser'@'%';

FLUSH PRIVILEGES;

