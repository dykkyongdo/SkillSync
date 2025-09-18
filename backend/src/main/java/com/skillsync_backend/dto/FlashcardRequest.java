package com.skillsync_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class FlashcardRequest {
    @NotBlank
    private String question;
    @NotBlank
    private String answer;
    @NotNull String setId;  // UUID as a string
}

