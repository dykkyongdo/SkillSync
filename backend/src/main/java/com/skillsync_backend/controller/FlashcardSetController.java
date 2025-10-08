package com.skillsync_backend.controller;

import com.skillsync_backend.dto.FlashcardSetDto;
import com.skillsync_backend.dto.FlashcardSetRequest;
import com.skillsync_backend.service.FlashcardSetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flashcard-sets")
@RequiredArgsConstructor
public class FlashcardSetController {

    private final FlashcardSetService service;

    /** Create a new flashcard set in a group (caller must be a member). */
    @PostMapping
    public ResponseEntity<FlashcardSetDto> create(@Valid @RequestBody FlashcardSetRequest request,
                                                  Authentication auth) {
        return ResponseEntity.ok(service.createSet(request, auth.getName()));
    }

    /** Get a single flashcard set by ID (caller must be a member). */
    @GetMapping("/{setId}")
    public ResponseEntity<FlashcardSetDto> getById(@PathVariable UUID setId, Authentication auth) {
        return ResponseEntity.ok(service.getSetById(setId, auth.getName()));
    }

    /** List all sets in a group (caller must be a member). */
    @GetMapping("/group/{groupId}")
    public ResponseEntity<Page<FlashcardSetDto>> getByGroup(@PathVariable UUID groupId,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size,
                                                            @RequestParam(defaultValue = "createdAt") String sortBy,
                                                            @RequestParam(defaultValue = "DESC") String direction,
                                                            Authentication auth) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(size, 100),
                direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending()
        );
        return ResponseEntity.ok(service.getSetsByGroup(groupId, auth.getName(), pageable));
    }

    /** Delete a set (caller must be a member of the owning group). */
    @DeleteMapping("/{setId}")
    public ResponseEntity<String> delete(@PathVariable UUID setId, Authentication auth) {
        service.deleteSet(setId, auth.getName());
        return ResponseEntity.ok("Deleted flashcard set successfully");
    }
}
