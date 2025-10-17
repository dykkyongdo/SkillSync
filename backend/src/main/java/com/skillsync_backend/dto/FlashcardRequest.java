package com.skillsync_backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class FlashcardRequest {
    @NotBlank(message = "Question is required")
    @Size(max = 1000, message = "Question must not exceed 1000 characters")
    private String question;
    
    @NotBlank(message = "Answer is required")
    @Size(max = 1000, message = "Answer must not exceed 1000 characters")
    private String answer;
    
    @Size(max = 2000, message = "Explanation must not exceed 2000 characters")
    private String explanation;
    
    @Min(value = 1, message = "Difficulty must be at least 1")
    @Max(value = 5, message = "Difficulty must be at most 5")
    private int difficulty = 1;
    
    private List<String> tags = new ArrayList<>();
    
    @NotNull(message = "Set ID is required")
    private String setId;
    
    // Multiple choice support
    private String questionType = "FREE_TEXT"; // "FREE_TEXT" or "MULTIPLE_CHOICE"
    private List<String> options; // For multiple choice questions
    private Integer correctOptionIndex; // Index of correct answer (0-based)
    
    // Validation helper methods
    public boolean isValid() {
        boolean basicValid = question != null && !question.trim().isEmpty() &&
                            answer != null && !answer.trim().isEmpty() &&
                            difficulty >= 1 && difficulty <= 5 &&
                            setId != null && !setId.trim().isEmpty();
        
        // Additional validation for multiple choice questions
        if ("MULTIPLE_CHOICE".equals(questionType)) {
            return basicValid && 
                   options != null && !options.isEmpty() && 
                   correctOptionIndex != null && 
                   correctOptionIndex >= 0 && 
                   correctOptionIndex < options.size();
        }
        
        return basicValid;
    }
    
    public List<String> getValidationErrors() {
        List<String> errors = new ArrayList<>();
        
        if (question == null || question.trim().isEmpty()) {
            errors.add("Question is required");
        } else if (question.length() > 1000) {
            errors.add("Question must not exceed 1000 characters");
        }
        
        if (answer == null || answer.trim().isEmpty()) {
            errors.add("Answer is required");
        } else if (answer.length() > 1000) {
            errors.add("Answer must not exceed 1000 characters");
        }
        
        if (explanation != null && explanation.length() > 2000) {
            errors.add("Explanation must not exceed 2000 characters");
        }
        
        if (difficulty < 1 || difficulty > 5) {
            errors.add("Difficulty must be between 1 and 5");
        }
        
        if (setId == null || setId.trim().isEmpty()) {
            errors.add("Set ID is required");
        }
        
        // Multiple choice validation
        if ("MULTIPLE_CHOICE".equals(questionType)) {
            if (options == null || options.isEmpty()) {
                errors.add("Options are required for multiple choice questions");
            } else if (options.size() < 2) {
                errors.add("Multiple choice questions must have at least 2 options");
            } else if (options.size() > 4) {
                errors.add("Multiple choice questions cannot have more than 4 options");
            } else {
                for (int i = 0; i < options.size(); i++) {
                    String option = options.get(i);
                    if (option == null || option.trim().isEmpty()) {
                        errors.add("Option " + (i + 1) + " cannot be empty");
                    } else if (option.length() > 500) {
                        errors.add("Option " + (i + 1) + " must not exceed 500 characters");
                    }
                }
            }
            
            if (correctOptionIndex == null) {
                errors.add("Correct option index is required for multiple choice questions");
            } else if (correctOptionIndex < 0 || correctOptionIndex >= (options != null ? options.size() : 0)) {
                errors.add("Correct option index must be between 0 and " + ((options != null ? options.size() : 1) - 1));
            }
        }
        
        if (tags != null) {
            for (int i = 0; i < tags.size(); i++) {
                String tag = tags.get(i);
                if (tag == null || tag.trim().isEmpty()) {
                    errors.add("Tag " + (i + 1) + " cannot be empty");
                } else if (tag.length() > 50) {
                    errors.add("Tag " + (i + 1) + " must not exceed 50 characters");
                }
            }
            
            if (tags.size() > 10) {
                errors.add("Cannot have more than 10 tags");
            }
        }
        
        return errors;
    }
}

