#!/bin/bash

# Set environment variables
export JWT_SECRET="${JWT_SECRET}"
export JWT_EXPIRATION="86400000"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="password"

# Start the Spring Boot application
./mvnw spring-boot:run
