package com.skillsync_backend.controller;

import com.skillsync_backend.dto.FlashcardDto;
import com.skillsync_backend.dto.FlashcardRequest;
import com.skillsync_backend.service.FlashcardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
@Slf4j
public class FlashcardController {

    private final FlashcardService service;

    /** Create a flashcard in a set (caller must be a member of the set's group). */
    @PostMapping
    public ResponseEntity<FlashcardDto> create(@Valid @RequestBody FlashcardRequest request,
                                               Authentication auth) {
        log.info("Creating flashcard for user: {}", auth.getName());
        return ResponseEntity.ok(service.create(request, auth.getName()));
    }

    /** Update a flashcard (caller must be a member of the owning group). */
    @PutMapping("/{flashcardId}")
    public ResponseEntity<FlashcardDto> update(@PathVariable UUID flashcardId,
                                               @Valid @RequestBody FlashcardRequest request,
                                               Authentication auth) {
        log.info("Updating flashcard: {} by user: {}", flashcardId, auth.getName());
        return ResponseEntity.ok(service.update(flashcardId, request, auth.getName()));
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

    /** List flashcards with filtering options */
    @GetMapping("/set/{setId}/filtered")
    public ResponseEntity<Page<FlashcardDto>> listBySetWithFilters(@PathVariable UUID setId,
                                                                   @RequestParam(required = false) Integer minDifficulty,
                                                                   @RequestParam(required = false) Integer maxDifficulty,
                                                                   @RequestParam(required = false) String tags,
                                                                   @RequestParam(required = false) String search,
                                                                   @RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "10") int size,
                                                                   @RequestParam(defaultValue = "id") String sortBy,
                                                                   @RequestParam(defaultValue = "ASC") String direction,
                                                                   Authentication auth) {
        log.info("Filtering flashcards for set: {} with filters - difficulty: {}-{}, tags: {}, search: {}", 
                setId, minDifficulty, maxDifficulty, tags, search);
        
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(size, 100),
                direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending()
        );
        
        List<String> tagList = null;
        if (tags != null && !tags.trim().isEmpty()) {
            tagList = Arrays.asList(tags.split(","));
        }
        
        return ResponseEntity.ok(service.listBySetWithFilters(
                setId, auth.getName(), minDifficulty, maxDifficulty, tagList, search, pageable));
    }

    /** Get flashcard statistics for a set */
    @GetMapping("/set/{setId}/stats")
    public ResponseEntity<FlashcardService.FlashcardStatsDto> getStats(@PathVariable UUID setId,
                                                                       Authentication auth) {
        log.info("Getting flashcard stats for set: {}", setId);
        return ResponseEntity.ok(service.getStats(setId, auth.getName()));
    }

    /** Delete a flashcard (caller must be a member of the owning group). */
    @DeleteMapping("/{flashcardId}")
    public ResponseEntity<String> delete(@PathVariable UUID flashcardId, Authentication auth) {
        log.info("Deleting flashcard: {} by user: {}", flashcardId, auth.getName());
        service.delete(flashcardId, auth.getName());
        return ResponseEntity.ok("Deleted flashcard successfully");
    }
}
