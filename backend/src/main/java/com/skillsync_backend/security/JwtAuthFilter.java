package com.skillsync_backend.security;

import com.skillsync_backend.service.UserService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * A custom security filter that:
 * - Extracts the JWT from the Authorization header
 * - Validates the token
 * - Loads the user info
 * - Sets authentication in the security context
 */

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @PostConstruct
    public void init() {
        log.info("JwtAuthFilter initialized");
        // Debug logging removed for production
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Debug logging removed for production("Processing JWT authentication for URI: {} {}", request.getMethod(), request.getRequestURI());
        String header = request.getHeader("Authorization");             //Read the "Authorization" header from the incoming HTTP request
        // Debug logging removed for production("Authorization header present: {}", header != null);

        if (header != null && header.startsWith("Bearer ")) {               //Check if it starts with "Bearer", indicating a JWT is present
            String token = header.substring(7);                   //Extract token by removing "Bearer " prefix 7 chars
            // Debug logging removed for production("Token extracted, length: {}", token.length());

            try {
                if (jwtTokenProvider.validateToken(token)) {
                    // Debug logging removed for production("Token validation successful");

                    String email = jwtTokenProvider.getEmailFromToken(token);
                    // Debug logging removed for production("Email extracted from token: {}", email);

                    if (email != null) {
                        UserDetails userDetails = userService.loadUserByUsername(email);
                        // Debug logging removed for production("User loaded successfully: {}", userDetails.getUsername());

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        // Debug logging removed for production("Authentication set in SecurityContext");
                    }
                } else {
                    log.warn("Token validation failed - clearing authentication");
                    SecurityContextHolder.clearContext();
                }
            } catch (Exception e) {
                log.error("Error processing token: {}", e.getMessage(), e);
                SecurityContextHolder.clearContext();
            }
        } else {
            // Debug logging removed for production("No Bearer token found in Authorization header");
        }

        // Debug logging removed for production("JWT authentication filter completed");
        filterChain.doFilter(request, response);
    }
}