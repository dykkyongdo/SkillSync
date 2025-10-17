package com.skillsync_backend.dto;

import lombok.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardDto {
    private UUID id;
    private String question;
    private String answer;
    private String explanation;
    private int difficulty;
    private List<String> tags;
    private UUID groupId;
    private UUID setId;
    private String createdBy;
    private Instant createdAt;
    private Instant updatedAt;
    private int usageCount;
    
    // Helper methods for frontend
    public String getDifficultyDisplay() {
        return switch (difficulty) {
            case 1 -> "Beginner";
            case 2 -> "Easy";
            case 3 -> "Medium";
            case 4 -> "Hard";
            case 5 -> "Expert";
            default -> "Unknown";
        };
    }
    
    public boolean hasTag(String tag) {
        return tags != null && tags.contains(tag.toLowerCase());
    }
    
    public String getTagsDisplay() {
        return tags != null && !tags.isEmpty() ? String.join(", ", tags) : "No tags";
    }
}
