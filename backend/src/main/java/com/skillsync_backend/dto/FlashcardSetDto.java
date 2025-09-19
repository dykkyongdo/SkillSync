package com.skillsync_backend.dto;

import lombok.*;
import java.util.UUID;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardSetDto {
    private UUID id;
    private String title;
    private String description;
    private Instant createdAt;
    private UUID groupId;
}
