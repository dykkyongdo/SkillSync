package com.skillsync_backend.service;

import com.skillsync_backend.dto.FlashcardDto;
import com.skillsync_backend.dto.FlashcardRequest;
import com.skillsync_backend.model.Flashcard;
import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.model.User;
import com.skillsync_backend.repository.FlashcardRepository;
import com.skillsync_backend.repository.FlashcardSetRepository;
import com.skillsync_backend.repository.UsedCardProgressRepository;
import com.skillsync_backend.repository.UserRepository;
import com.skillsync_backend.security.AccessGuard;
import com.skillsync_backend.security.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlashcardService {

    private final FlashcardRepository flashcardRepo;
    private final FlashcardSetRepository setRepo;
    private final UsedCardProgressRepository progressRepo;
    private final UserRepository userRepo;
    private final AccessGuard access;
    private final ValidationService validationService;

    /** Create a flashcard in a set. Caller must be a member of the owning group. */
    public FlashcardDto create(FlashcardRequest req, String email) {
        log.info("Creating flashcard for user: {} in set: {}", email, req.getSetId());
        
        // Validate request
        List<String> errors = req.getValidationErrors();
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException("Validation errors: " + String.join(", ", errors));
        }
        
        UUID setId = UUID.fromString(req.getSetId());
        FlashcardSet set = access.ensureMemberOfSet(setId, email);
        
        User creator = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        // Validate content quality
        validationService.validateFlashcardContent(req.getQuestion(), req.getAnswer());

        Flashcard.FlashcardBuilder builder = Flashcard.builder()
                .question(req.getQuestion().trim())
                .answer(req.getAnswer().trim())
                .explanation(req.getExplanation() != null ? req.getExplanation().trim() : null)
                .difficulty(req.getDifficulty())
                .tags(req.getTags() != null ? req.getTags().stream()
                        .map(String::toLowerCase)
                        .distinct()
                        .collect(Collectors.toList()) : List.of())
                .group(set.getGroup())
                .set(set)
                .createdBy(creator)
                .usageCount(0);

        // All questions are now multiple choice
        builder.questionType(Flashcard.QuestionType.MULTIPLE_CHOICE)
               .options(req.getOptions())
               .correctOptionIndex(req.getCorrectOptionIndex());

        Flashcard card = builder.build();

        Flashcard saved = flashcardRepo.save(card);
        log.info("Created flashcard: {} with difficulty: {} and tags: {}", 
                saved.getId(), saved.getDifficulty(), saved.getTags());
        
        return toDto(saved);
    }

    /** Update a flashcard. Caller must be a member of the owning group. */
    public FlashcardDto update(UUID flashcardId, FlashcardRequest req, String email) {
        log.info("Updating flashcard: {} by user: {}", flashcardId, email);
        
        Flashcard card = flashcardRepo.findById(flashcardId)
                .orElseThrow(() -> new NotFoundException("Flashcard not found"));

        access.ensureMemberOfGroup(card.getGroup().getId(), email);
        
        // Validate request
        List<String> errors = req.getValidationErrors();
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException("Validation errors: " + String.join(", ", errors));
        }
        
        // Update fields
        card.setQuestion(req.getQuestion().trim());
        card.setAnswer(req.getAnswer().trim());
        card.setExplanation(req.getExplanation() != null ? req.getExplanation().trim() : null);
        card.setDifficulty(req.getDifficulty());
        card.setTags(req.getTags() != null ? req.getTags().stream()
                .map(String::toLowerCase)
                .distinct()
                .collect(Collectors.toList()) : List.of());

        // All questions are now multiple choice
        card.setQuestionType(Flashcard.QuestionType.MULTIPLE_CHOICE);
        card.setOptions(req.getOptions());
        card.setCorrectOptionIndex(req.getCorrectOptionIndex());

        Flashcard saved = flashcardRepo.save(card);
        log.info("Updated flashcard: {} with difficulty: {} and tags: {}", 
                saved.getId(), saved.getDifficulty(), saved.getTags());
        
        return toDto(saved);
    }

    public Page<FlashcardDto> listBySet(UUID setId, String email, Pageable pageable) {
        access.ensureMemberOfSet(setId, email);
        return flashcardRepo.findBySetId(setId, pageable).map(this::toDto);
    }

    /** Get flashcards by set with filtering options */
    public Page<FlashcardDto> listBySetWithFilters(UUID setId, String email, 
                                                   Integer minDifficulty, 
                                                   Integer maxDifficulty,
                                                   List<String> tags,
                                                   String searchTerm,
                                                   Pageable pageable) {
        access.ensureMemberOfSet(setId, email);
        
        // Use database-level filtering for better performance
        Page<Flashcard> flashcards;
        
        if ((tags == null || tags.isEmpty()) && (searchTerm == null || searchTerm.trim().isEmpty())) {
            // Only difficulty filtering
            if (minDifficulty != null || maxDifficulty != null) {
                int min = minDifficulty != null ? minDifficulty : 1;
                int max = maxDifficulty != null ? maxDifficulty : 5;
                flashcards = flashcardRepo.findBySetIdAndDifficultyBetween(setId, min, max, pageable);
            } else {
                flashcards = flashcardRepo.findBySetId(setId, pageable);
            }
        } else if (tags != null && !tags.isEmpty()) {
            // Use combined filtering with tags
            flashcards = flashcardRepo.findBySetIdWithAllFilters(
                    setId, minDifficulty, maxDifficulty, tags, searchTerm, pageable);
        } else {
            // Only search term filtering
            flashcards = flashcardRepo.findBySetIdWithFilters(
                    setId, minDifficulty, maxDifficulty, searchTerm, pageable);
        }
        
        return flashcards.map(this::toDto);
    }

    /** Delete a flashcard. Caller must be a member of the owning group. */
    @Transactional
    public void delete(UUID flashcardId, String email) {
        log.info("Deleting flashcard: {} by user: {}", flashcardId, email);
        
        Flashcard card = flashcardRepo.findById(flashcardId)
                .orElseThrow(() -> new NotFoundException("Flashcard not found"));

        access.ensureMemberOfGroup(card.getGroup().getId(), email);
        
        // Delete all user progress records for this flashcard first
        progressRepo.deleteAllByFlashcard_Id(flashcardId);
        
        // Now delete the flashcard itself
        flashcardRepo.delete(card);
        
        log.info("Deleted flashcard: {}", flashcardId);
    }

    /** Get flashcard statistics for a set */
    public FlashcardStatsDto getStats(UUID setId, String email) {
        access.ensureMemberOfSet(setId, email);
        
        FlashcardStatsDto stats = new FlashcardStatsDto();
        
        // Get total count
        stats.setTotalCards((int) flashcardRepo.countBySetId(setId));
        
        // Get average difficulty using repository query
        Double avgDifficulty = flashcardRepo.getAverageDifficultyBySetId(setId);
        stats.setAverageDifficulty(avgDifficulty != null ? avgDifficulty : 0.0);
        
        // Get difficulty counts using repository query
        List<Object[]> difficultyCounts = flashcardRepo.getDifficultyCountsBySetId(setId);
        Map<Integer, Long> difficultyMap = new HashMap<>();
        for (Object[] result : difficultyCounts) {
            difficultyMap.put((Integer) result[0], (Long) result[1]);
        }
        stats.setDifficultyCounts(difficultyMap);
        
        // Get all unique tags using repository query
        stats.setAllTags(flashcardRepo.getAllTagsBySetId(setId));
        
        // Get most used cards using repository query
        Page<Flashcard> mostUsed = flashcardRepo.findBySetIdOrderByUsageCountDesc(setId, PageRequest.of(0, 5));
        stats.setMostUsedCards(mostUsed.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList()));
        
        return stats;
    }

    /** Map entity -> DTO. */
    private FlashcardDto toDto(Flashcard c) {
        return FlashcardDto.builder()
                .id(c.getId())
                .question(c.getQuestion())
                .answer(c.getAnswer())
                .explanation(c.getExplanation())
                .difficulty(c.getDifficulty())
                .tags(c.getTags() != null ? c.getTags() : new ArrayList<>())
                .setId(c.getSet().getId())
                .groupId(c.getGroup().getId())
                .createdBy(c.getCreatedBy() != null ? c.getCreatedBy().getEmail() : null)
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt() : Instant.now())
                .updatedAt(c.getUpdatedAt() != null ? c.getUpdatedAt() : Instant.now())
                .usageCount(c.getUsageCount())
                .build();
    }

    // DTO for flashcard statistics
    public static class FlashcardStatsDto {
        private int totalCards;
        private double averageDifficulty;
        private java.util.Map<Integer, Long> difficultyCounts;
        private List<String> allTags;
        private List<FlashcardDto> mostUsedCards;

        // Getters and setters
        public int getTotalCards() { return totalCards; }
        public void setTotalCards(int totalCards) { this.totalCards = totalCards; }
        public double getAverageDifficulty() { return averageDifficulty; }
        public void setAverageDifficulty(double averageDifficulty) { this.averageDifficulty = averageDifficulty; }
        public java.util.Map<Integer, Long> getDifficultyCounts() { return difficultyCounts; }
        public void setDifficultyCounts(java.util.Map<Integer, Long> difficultyCounts) { this.difficultyCounts = difficultyCounts; }
        public List<String> getAllTags() { return allTags; }
        public void setAllTags(List<String> allTags) { this.allTags = allTags; }
        public List<FlashcardDto> getMostUsedCards() { return mostUsedCards; }
        public void setMostUsedCards(List<FlashcardDto> mostUsedCards) { this.mostUsedCards = mostUsedCards; }
    }
}
