package com.skillsync_backend.service;

import com.skillsync_backend.model.User;
import com.skillsync_backend.model.Role;
import com.skillsync_backend.dto.AuthResponse;
import com.skillsync_backend.dto.AuthRequest;
import com.skillsync_backend.repository.UserRepository;
import com.skillsync_backend.security.JwtTokenProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtProvider;

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEamil())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);
        String token = jwtProvider.generateToken(user);

        return new AuthResponse(token);
    }

    public AuthResponse authenticate(AuthRequest request) {
        User user  = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }

        String token = jwtProvider.generateToken(user);
        return new AuthResponse(token);
    }
}
