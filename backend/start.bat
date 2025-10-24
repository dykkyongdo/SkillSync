@echo off
REM Windows batch script to start SkillSync backend

REM Set environment variables
set JWT_SECRET=%JWT_SECRET%
set JWT_EXPIRATION=86400000
set SPRING_DATASOURCE_USERNAME=postgres
set SPRING_DATASOURCE_PASSWORD=password

REM Start the Spring Boot application
call mvnw.cmd spring-boot:run
