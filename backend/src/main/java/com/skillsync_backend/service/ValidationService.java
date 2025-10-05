package com.skillsync_backend.service;

import com.skillsync_backend.exception.ResourceNotFoundException;
import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.repository.FlashcardRepository;
import com.skillsync_backend.repository.FlashcardSetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ValidationService {

    private final FlashcardSetRepository setRepository;
    private final FlashcardRepository flashcardRepository;

    /**
     * Validates that a flashcard set title is unique within a group
     */
    public void validateUniqueSetTitle(String title, UUID groupId, UUID excludeSetId) {
        boolean exists = setRepository.findByTitleAndGroupId(title, groupId)
                .stream()
                .anyMatch(set -> !set.getId().equals(excludeSetId));
        
        if (exists) {
            log.warn("Attempted to create duplicate set title '{}' in group {}", title, groupId);
            throw new IllegalArgumentException("A flashcard set with this title already exists in this group");
        }
    }

    /**
     * Validates that a flashcard set has reasonable limits
     */
    public void validateSetLimits(UUID setId) {
        setRepository.findById(setId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard set not found"));
        
        long cardCount = flashcardRepository.countBySetId(setId);
        
        if (cardCount > 1000) {
            log.warn("Flashcard set {} has {} cards, which exceeds recommended limit", setId, cardCount);
            throw new IllegalArgumentException("Flashcard set cannot have more than 1000 cards");
        }
    }

    /**
     * Validates flashcard content quality
     */
    public void validateFlashcardContent(String question, String answer) {
        if (question.trim().length() < 3) {
            throw new IllegalArgumentException("Question must be at least 3 characters long");
        }
        
        if (answer.trim().length() < 1) {
            throw new IllegalArgumentException("Answer cannot be empty");
        }
        
        // Check for potential spam/inappropriate content (basic check)
        if (question.toLowerCase().matches(".*(spam|test|asdf|qwerty).*") && 
            answer.toLowerCase().matches(".*(spam|test|asdf|qwerty).*")) {
            log.warn("Potential spam content detected in flashcard");
            throw new IllegalArgumentException("Content appears to be invalid or spam");
        }
    }

    /**
     * Validates study session parameters
     */
    public void validateStudyParameters(int limit) {
        if (limit <= 0 || limit > 100) {
            throw new IllegalArgumentException("Study limit must be between 1 and 100 cards");
        }
    }

    /**
     * Validates review grade
     */
    public void validateReviewGrade(int grade) {
        if (grade < 0 || grade > 3) {
            throw new IllegalArgumentException("Review grade must be between 0 and 3");
        }
    }
}
