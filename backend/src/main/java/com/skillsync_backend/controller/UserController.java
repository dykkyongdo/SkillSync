package com.skillsync_backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/me")
    public String getCurrentUser(Authentication authentication) {
        return "You are logged in as " + authentication.getName();
    }
}
