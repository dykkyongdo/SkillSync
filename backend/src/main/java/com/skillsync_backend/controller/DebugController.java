package com.skillsync_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.sentry.Sentry;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private Environment environment;

    @GetMapping("/db-test")
    public ResponseEntity<Map<String, Object>> testDatabase() {
        Map<String, Object> result = new HashMap<>();
        
        // Check active profiles
        String[] activeProfiles = environment.getActiveProfiles();
        result.put("activeProfiles", activeProfiles);
        result.put("springProfilesActive", environment.getProperty("spring.profiles.active"));
        
        try (Connection connection = dataSource.getConnection()) {
            result.put("status", "success");
            result.put("database", connection.getMetaData().getDatabaseProductName());
            result.put("url", connection.getMetaData().getURL());
            result.put("username", connection.getMetaData().getUserName());
        } catch (SQLException e) {
            result.put("status", "error");
            result.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/test-error")
    public ResponseEntity<Map<String, Object>> testError() {
        try {
            throw new Exception("This is a test error for Sentry monitoring.");
        } catch (Exception e) {
            // Send error to Sentry
            Sentry.captureException(e);
            
            Map<String, Object> result = new HashMap<>();
            result.put("status", "error");
            result.put("message", "Test error sent to Sentry");
            result.put("error", e.getMessage());
            return ResponseEntity.ok(result);
        }
    }
}
