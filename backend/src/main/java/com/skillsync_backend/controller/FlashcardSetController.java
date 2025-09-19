package com.skillsync_backend.controller;

import com.skillsync_backend.dto.FlashcardSetRequest;
import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.service.FlashcardSetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcard-sets")
@RequiredArgsConstructor
public class FlashcardSetController {

    private final FlashcardSetService flashcardSetService;

    /**
     * Create a new flashcard set in a group (caller must be a member of the group).
     */
    @PostMapping
    public ResponseEntity<FlashcardSet> create(@Valid @RequestBody FlashcardSetRequest request,
                                               Authentication auth) {
        FlashcardSet created = flashcardSetService.createSet(request, auth.getName());
        return ResponseEntity.ok(created);
    }

    /**
     * List all sets in a group (caller must be a member of the group).
     */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<FlashcardSet>> getByGroup(@PathVariable UUID groupId,
                                                         Authentication auth) {
        List<FlashcardSet> sets = flashcardSetService.getSetsByGroup(groupId, auth.getName());
        return ResponseEntity.ok(sets);
    }

    /**
     * Delete a set (caller must be a member of the group that owns the set).
     * You can later restrict to owner/admin.
     */
    @DeleteMapping("/{setId}")
    public ResponseEntity<Void> delete(@PathVariable UUID setId, Authentication auth) {
        flashcardSetService.deleteSet(setId, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
