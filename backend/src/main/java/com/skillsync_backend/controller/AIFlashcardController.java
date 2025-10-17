package com.skillsync_backend.controller;

import com.skillsync_backend.dto.FlashcardRequest;
import com.skillsync_backend.service.AIFlashcardGenerationService;
import com.skillsync_backend.security.AccessGuard;
import com.skillsync_backend.service.ValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai/flashcards")
@RequiredArgsConstructor
@Slf4j
public class AIFlashcardController {

    private final AIFlashcardGenerationService aiService;
    private final AccessGuard accessGuard;
    private final ValidationService validationService;

    /**
     * Generate flashcards for a specific topic
     */
    @PostMapping("/generate")
    public ResponseEntity<List<FlashcardRequest>> generateFlashcards(
            @Valid @RequestBody GenerateFlashcardsRequest request,
            Authentication auth
    ) {
        log.info("AI flashcard generation request from user: {} for topic: {}", auth.getName(), request.getTopic());

        try {
            // Validate the request
            List<String> errors = validateGenerationRequest(request);
            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Ensure user has access to the set
            UUID setId = UUID.fromString(request.getSetId());
            accessGuard.ensureMemberOfSet(setId, auth.getName());

            // Generate flashcards
            List<FlashcardRequest> flashcards = aiService.generateFlashcards(
                    request.getTopic(),
                    request.getCount(),
                    request.getDifficulty(),
                    request.getSetId()
            );

            log.info("Generated {} flashcards for topic: {}", flashcards.size(), request.getTopic());
            return ResponseEntity.ok(flashcards);

        } catch (Exception e) {
            log.error("Error generating flashcards for topic: {}", request.getTopic(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Generate flashcards with advanced parameters
     */
    @PostMapping("/generate/advanced")
    public ResponseEntity<List<FlashcardRequest>> generateFlashcardsAdvanced(
            @Valid @RequestBody AdvancedGenerateFlashcardsRequest request,
            Authentication auth
    ) {
        log.info("Advanced AI flashcard generation request from user: {} for topic: {}", 
                auth.getName(), request.getTopic());

        try {
            // Validate the request
            List<String> errors = validateAdvancedGenerationRequest(request);
            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Ensure user has access to the set
            UUID setId = UUID.fromString(request.getSetId());
            accessGuard.ensureMemberOfSet(setId, auth.getName());

            // Generate flashcards with advanced parameters
            List<FlashcardRequest> flashcards = aiService.generateFlashcardsAdvanced(
                    request.getTopic(),
                    request.getCount(),
                    request.getDifficulty(),
                    request.getSetId(),
                    request.getSpecificAspects(),
                    request.getQuestionType()
            );

            log.info("Generated {} advanced flashcards for topic: {}", flashcards.size(), request.getTopic());
            return ResponseEntity.ok(flashcards);

        } catch (Exception e) {
            log.error("Error generating advanced flashcards for topic: {}", request.getTopic(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get AI generation suggestions for a topic
     */
    @GetMapping("/suggestions/{topic}")
    public ResponseEntity<Map<String, Object>> getTopicSuggestions(
            @PathVariable String topic,
            Authentication auth
    ) {
        log.info("AI suggestions request from user: {} for topic: {}", auth.getName(), topic);

        try {
            Map<String, Object> suggestions = Map.of(
                    "topic", topic,
                    "suggestedAspects", getSuggestedAspects(topic),
                    "suggestedDifficulty", getSuggestedDifficulty(topic),
                    "suggestedCount", 5,
                    "questionTypes", List.of("definition", "application", "comparison", "analysis", "synthesis")
            );

            return ResponseEntity.ok(suggestions);

        } catch (Exception e) {
            log.error("Error getting suggestions for topic: {}", topic, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validate basic generation request
     */
    private List<String> validateGenerationRequest(GenerateFlashcardsRequest request) {
        List<String> errors = new java.util.ArrayList<>();

        if (request.getTopic() == null || request.getTopic().trim().isEmpty()) {
            errors.add("Topic is required");
        } else if (request.getTopic().length() > 200) {
            errors.add("Topic must not exceed 200 characters");
        }

        if (request.getCount() < 1 || request.getCount() > 20) {
            errors.add("Count must be between 1 and 20");
        }

        if (request.getDifficulty() == null || request.getDifficulty().trim().isEmpty()) {
            errors.add("Difficulty is required");
        }

        if (request.getSetId() == null || request.getSetId().trim().isEmpty()) {
            errors.add("Set ID is required");
        }

        return errors;
    }

    /**
     * Validate advanced generation request
     */
    private List<String> validateAdvancedGenerationRequest(AdvancedGenerateFlashcardsRequest request) {
        List<String> errors = validateGenerationRequest(request);

        if (request.getSpecificAspects() != null) {
            for (String aspect : request.getSpecificAspects()) {
                if (aspect.length() > 100) {
                    errors.add("Each aspect must not exceed 100 characters");
                    break;
                }
            }
            if (request.getSpecificAspects().size() > 10) {
                errors.add("Cannot specify more than 10 aspects");
            }
        }

        if (request.getQuestionType() != null && request.getQuestionType().length() > 50) {
            errors.add("Question type must not exceed 50 characters");
        }

        return errors;
    }

    /**
     * Get suggested aspects for a topic
     */
    private List<String> getSuggestedAspects(String topic) {
        // Simple keyword-based suggestions
        String lowerTopic = topic.toLowerCase();
        
        if (lowerTopic.contains("programming") || lowerTopic.contains("coding")) {
            return List.of("syntax", "algorithms", "data structures", "best practices", "debugging");
        } else if (lowerTopic.contains("science") || lowerTopic.contains("biology")) {
            return List.of("concepts", "processes", "classification", "experiments", "applications");
        } else if (lowerTopic.contains("history")) {
            return List.of("events", "people", "timeline", "causes", "effects");
        } else if (lowerTopic.contains("language") || lowerTopic.contains("grammar")) {
            return List.of("vocabulary", "grammar", "pronunciation", "usage", "culture");
        } else {
            return List.of("basics", "concepts", "applications", "examples", "advanced topics");
        }
    }

    /**
     * Get suggested difficulty for a topic
     */
    private String getSuggestedDifficulty(String topic) {
        String lowerTopic = topic.toLowerCase();
        
        if (lowerTopic.contains("introduction") || lowerTopic.contains("basics") || lowerTopic.contains("beginner")) {
            return "Beginner";
        } else if (lowerTopic.contains("advanced") || lowerTopic.contains("expert") || lowerTopic.contains("master")) {
            return "Expert";
        } else if (lowerTopic.contains("intermediate")) {
            return "Medium";
        } else {
            return "Medium"; // Default to medium difficulty
        }
    }

    // Request DTOs
    public static class GenerateFlashcardsRequest {
        private String topic;
        private int count = 5;
        private String difficulty = "Medium";
        private String setId;

        // Getters and setters
        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        public String getSetId() { return setId; }
        public void setSetId(String setId) { this.setId = setId; }
    }

    public static class AdvancedGenerateFlashcardsRequest extends GenerateFlashcardsRequest {
        private List<String> specificAspects;
        private String questionType;

        // Getters and setters
        public List<String> getSpecificAspects() { return specificAspects; }
        public void setSpecificAspects(List<String> specificAspects) { this.specificAspects = specificAspects; }
        public String getQuestionType() { return questionType; }
        public void setQuestionType(String questionType) { this.questionType = questionType; }
    }
}
