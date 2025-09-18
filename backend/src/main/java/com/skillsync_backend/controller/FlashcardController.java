package com.skillsync_backend.controller;

import com.skillsync_backend.model.Flashcard;
import com.skillsync_backend.service.FlashcardService;
import com.skillsync_backend.dto.FlashcardRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/flashcards")
public class FlashcardController {

    private final FlashcardService flashcardService;

    // Create a flashcard inside the set
    @PostMapping
    public ResponseEntity<Flashcard> create(@Valid @RequestBody FlashcardRequest request, Authentication auth) {

        return ResponseEntity.ok(flashcardService.create(request));
    }

    // List all flashcards by set
    @GetMapping("/set/{setId}")
    public ResponseEntity<List<Flashcard>> listBySetId(@PathVariable UUID setId, Authentication auth) {
        return ResponseEntity.ok(flashcardService.listBySet(setId));
    }

    // delete a flashcard
    @DeleteMapping("/{flashcardId}")
    public ResponseEntity<List<Flashcard>> delete(@PathVariable UUID flashcardId, Authentication auth) {
        flashcardService.delete(flashcardId);
        return ResponseEntity.notFound().build();
    }
}
