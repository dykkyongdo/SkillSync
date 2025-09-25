package com.skillsync_backend.controller;

import com.skillsync_backend.dto.*;
import com.skillsync_backend.service.StudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/sets/{setId}/study")
@RequiredArgsConstructor
public class StudyController {

    private final StudyService study;

    @GetMapping("/due")
    public ResponseEntity<List<DueCardDto>> due(@PathVariable UUID setId, @RequestParam(defaultValue = "20") int limit, Authentication auth) {
        return ResponseEntity.ok(study.listDue(setId, auth.getName(), limit));
    }

    @PostMapping("/{flashcardId}/review")
    public ResponseEntity<ReviewResultDto> review(@PathVariable UUID setId, @PathVariable UUID flashcardId, @RequestBody ReviewRequest req, Authentication auth) {
        return ResponseEntity.ok(study.review(setId, flashcardId, req.getGrade(), auth.getName()));
    }
}
