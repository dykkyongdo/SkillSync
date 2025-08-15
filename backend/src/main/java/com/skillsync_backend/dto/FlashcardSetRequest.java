package com.skillsync_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlashcardSetRequest {
    private String title;
    private String description;
    private String groupId;     // UUID as String from the client
}