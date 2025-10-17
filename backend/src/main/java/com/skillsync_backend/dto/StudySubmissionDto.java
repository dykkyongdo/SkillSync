package com.skillsync_backend.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class StudySubmissionDto {
    private UUID flashcardId;
    private Integer selectedOptionIndex; // For multiple choice (0-based)
    private String userAnswer; // For free text answers
    private long responseTimeMs; // Time taken to answer in milliseconds
}
