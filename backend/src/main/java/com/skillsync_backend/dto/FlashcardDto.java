package com.skillsync_backend.dto;

import lombok.*;
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
    private UUID groupId;
    private UUID setId;
}
