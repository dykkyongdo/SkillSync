package com.skillsync_backend.controller;

import com.skillsync_backend.dto.AuthRequest;
import com.skillsync_backend.dto.AuthResponse;
import com.skillsync_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")                              //All endpoints will start with /api/auth
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")                             //Maps POST /register to register() method
    public ResponseEntity<AuthResponse>                     //Returns structured HTTP + JSON responses
    register(@Valid @RequestBody AuthRequest request){      //Reads and validates request body
        AuthResponse response = userService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request){
        AuthResponse response = userService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test-account")
    public ResponseEntity<AuthResponse> createTestAccount(){
        AuthResponse response = userService.createTestAccount();
        return ResponseEntity.ok(response);
    }
}
