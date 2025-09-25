package com.skillsync_backend.dto;

import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class ReviewResultDto {
    private UUID flashcardId;
    private int grade;
    private int newIntervalDays;
    private double newEase;
    private int newRepetitions;
    private Instant nextDueAt;
}
