package com.skillsync_backend.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class DueCardDto {
    private UUID flashcardId;
    private String question;
    private String answer;
    private String explanation;
    private int difficulty;
    private List<String> tags;
    
    // Multiple choice support
    private String questionType; // "FREE_TEXT" or "MULTIPLE_CHOICE"
    private List<String> options; // For multiple choice questions
    private Integer correctOptionIndex; // Index of correct answer (0-based)
}