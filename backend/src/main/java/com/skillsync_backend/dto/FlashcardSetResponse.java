package com.skillsync_backend.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FlashcardSetResponse {
    private UUID id;
    private String title;
    private String description;
    private Instant createdAt;
    private GroupInfo group;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupInfo {
        private UUID id;
        private String name;
        private String description;
    }
}
