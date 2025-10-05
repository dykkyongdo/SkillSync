package com.skillsync_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlashcardRequest {
    @NotBlank(message = "Question is required")
    @Size(max = 1000, message = "Question must not exceed 1000 characters")
    private String question;
    
    @NotBlank(message = "Answer is required")
    @Size(max = 1000, message = "Answer must not exceed 1000 characters")
    private String answer;
    
    @NotNull(message = "Set ID is required")
    private String setId;
}

