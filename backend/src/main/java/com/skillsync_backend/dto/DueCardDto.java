package com.skillsync_backend.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class DueCardDto {
    private UUID flashcardId;
    private String question;
    private String answer;
}