package com.skillsync_backend.controller;

import com.skillsync_backend.dto.FlashcardDto;
import com.skillsync_backend.dto.FlashcardRequest;
import com.skillsync_backend.service.FlashcardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardService service;

    /** Create a flashcard in a set (caller must be a member of the set’s group). */
    @PostMapping
    public ResponseEntity<FlashcardDto> create(@Valid @RequestBody FlashcardRequest request,
                                               Authentication auth) {
        return ResponseEntity.ok(service.create(request, auth.getName()));
    }

    /** List all flashcards in a set (caller must be a member). */
    @GetMapping("/set/{setId}")
    public ResponseEntity<Page<FlashcardDto>> listBySet(@PathVariable UUID setId,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size,
                                                        @RequestParam(defaultValue = "id") String sortBy,
                                                        @RequestParam(defaultValue = "ASC") String direction,
                                                        Authentication auth) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(size, 100),
                direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending()
        );
        return ResponseEntity.ok(service.listBySet(setId, auth.getName(), pageable));
    }

    /** Delete a flashcard (caller must be a member of the owning group). */
    @DeleteMapping("/{flashcardId}")
    public ResponseEntity<String> delete(@PathVariable UUID flashcardId, Authentication auth) {
        service.delete(flashcardId, auth.getName());
        return ResponseEntity.ok("Deleted flashcard successfully");
    }
}
