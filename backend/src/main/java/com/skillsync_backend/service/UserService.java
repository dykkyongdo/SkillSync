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

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}