package com.skillsync_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String password;
    
    // Constructor for regular login/register (backward compatibility)
    public AuthResponse(String token) {
        this.token = token;
    }
}
