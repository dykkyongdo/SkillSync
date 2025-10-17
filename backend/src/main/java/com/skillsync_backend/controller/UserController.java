package com.skillsync_backend.controller;

import com.skillsync_backend.service.StudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final StudyService studyService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(Authentication auth) {
        return ResponseEntity.ok(studyService.getUserStats(auth.getName()));
    }
}