package com.skillsync_backend.service;

import com.skillsync_backend.model.User;
import com.skillsync_backend.model.Role;
import com.skillsync_backend.dto.AuthResponse;
import com.skillsync_backend.dto.AuthRequest;
import com.skillsync_backend.exception.InvalidCredentialsException;
import com.skillsync_backend.exception.UserAlreadyExistsException;
import com.skillsync_backend.exception.UserNotFoundException;
import com.skillsync_backend.repository.UserRepository;
import com.skillsync_backend.security.JwtTokenProvider;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtProvider;

    @Transactional
    public AuthResponse register(AuthRequest request) {                         // Creates a new user with hashed password and returns a JWT token
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);
        String token = jwtProvider.generateToken(user);                         // Builds a signed JWT with email + role info

        return new AuthResponse(token);
    }

    public AuthResponse authenticate(AuthRequest request) {                     // Verifies email + password, returns token if correct
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtProvider.generateToken(user);
        return new AuthResponse(token);
    }

    @Transactional
    public AuthResponse createTestAccount() {
        // Generate a unique test email
        String testEmail = "test" + System.currentTimeMillis() + "@skillsync.demo";
        String testPassword = "Test123!";
        
        // Check if this test email already exists (very unlikely due to timestamp)
        if (userRepository.findByEmail(testEmail).isPresent()) {
            // If it exists, generate a new one
            testEmail = "test" + System.currentTimeMillis() + "@skillsync.demo";
        }

        User user = User.builder()
                .email(testEmail)
                .password(passwordEncoder.encode(testPassword))
                .role(Role.USER)
                .xp(0)
                .level(1)
                .streakCount(0)
                .build();

        userRepository.save(user);
        String token = jwtProvider.generateToken(user);

        return new AuthResponse(token, testEmail, testPassword);
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}