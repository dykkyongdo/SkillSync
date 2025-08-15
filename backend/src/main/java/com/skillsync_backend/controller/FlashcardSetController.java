package com.skillsync_backend.controller;

import com.skillsync_backend.dto.FlashcardSetRequest;
import com.skillsync_backend.model.Flashcard;
import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.service.FlashcardSetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcard-sets")
@RequiredArgsConstructor
public class FlashcardSetController {

    private final FlashcardSetService flashcardSetService;

    // Create a set (auth required)
    public ResponseEntity<FlashcardSet> create(@RequestBody FlashcardSetRequest request, Authentication authentication) {
        // Option: enforce the caller is a member of the group before creating
        FlashcardSet created = flashcardSetService.createSet(request);
        return ResponseEntity.ok(created);
    }

    // Get all sets in a group (auth required)
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<FlashcardSet>> getByGroup(@PathVariable("groupId") UUID groupId) {
        return ResponseEntity.ok(flashcardSetService.getSetsByGroup(groupId));
    }

    // Delete a set (auth required: later restrict to owner/admin)
    @DeleteMapping("/{setId}")
    public ResponseEntity<FlashcardSet> delete(@PathVariable UUID setId) {
        flashcardSetService.deleteSet(setId);
        return ResponseEntity.noContent().build();
    }
}
