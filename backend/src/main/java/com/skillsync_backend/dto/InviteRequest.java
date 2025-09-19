package com.skillsync_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InviteRequest {
    @Email
    @NotBlank
    private String email;
}
