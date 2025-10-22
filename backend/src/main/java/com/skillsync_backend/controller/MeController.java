package com.skillsync_backend.controller;

import com.skillsync_backend.service.StudyService;
import com.skillsync_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final StudyService studyService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMe(Authentication auth) {
        var user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
            "id", user.getId().toString(),
            "email", user.getEmail(),
            "name", user.getEmail() // Use email as name since User model doesn't have name field
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication auth) {
        return ResponseEntity.ok(studyService.getUserStats(auth.getName()));
    }

    @GetMapping("/daily-xp")
    public ResponseEntity<List<Map<String, Object>>> getDailyXp(Authentication auth) {
        return ResponseEntity.ok(studyService.getDailyXpData(auth.getName()));
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity(Authentication auth) {
        return ResponseEntity.ok(studyService.getRecentActivity(auth.getName()));
    }
}