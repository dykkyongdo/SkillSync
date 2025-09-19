package com.skillsync_backend.controller;

import com.skillsync_backend.dto.FlashcardDto;
import com.skillsync_backend.dto.FlashcardRequest;
import com.skillsync_backend.service.FlashcardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardService flashcardService;

    /** Create a flashcard in a set (caller must be a member of the set’s group). */
    @PostMapping
    public ResponseEntity<FlashcardDto> create(@Valid @RequestBody FlashcardRequest request,
                                               Authentication auth) {
        FlashcardDto created = flashcardService.create(request, auth.getName());
        return ResponseEntity.ok(created);
    }

    /** List all flashcards in a set (caller must be a member). */
    @GetMapping("/set/{setId}")
    public ResponseEntity<List<FlashcardDto>> listBySet(@PathVariable UUID setId,
                                                        Authentication auth) {
        List<FlashcardDto> cards = flashcardService.listBySet(setId, auth.getName());
        return ResponseEntity.ok(cards);
    }

    /** Delete a flashcard (caller must be a member of the owning group). */
    @DeleteMapping("/{flashcardId}")
    public ResponseEntity<Void> delete(@PathVariable UUID flashcardId, Authentication auth) {
        flashcardService.delete(flashcardId, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
