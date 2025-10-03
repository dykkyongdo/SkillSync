package com.skillsync_backend.security;

import com.skillsync_backend.service.UserService;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @PostConstruct
    public void init() {
        System.out.println("JwtAuthFilter bean created");
        System.out.println("JwtTokenProvider injected: " + (jwtTokenProvider != null));
        System.out.println("UserService injected: " + (userService != null));
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {

        System.out.println("=== JwtAuthFilter START ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Request Method: " + request.getMethod());
        String header = request.getHeader("Authorization");             //Read the "Authorization" header from the incoming HTTP request
        System.out.println("Authorization header: " + header);  // Debug log

        if (header != null && header.startsWith("Bearer ")) {               //Check if it starts with "Bearer", indicating a JWT is present
            String token = header.substring(7);                   //Extract token by removing "Bearer " prefix 7 chars
            System.out.println("Token extracted: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));

            try {
                if (jwtTokenProvider.validateToken(token)) {
                    System.out.println("Token is valid");

                    String email = jwtTokenProvider.getEmailFromToken(token);
                    System.out.println("Email from token: " + email);

                    if (email != null) {
                        UserDetails userDetails = userService.loadUserByUsername(email);
                        System.out.println("User loaded: " + userDetails.getUsername());

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        System.out.println("Authentication set in SecurityContext");
                    }
                } else {
                    System.out.println("Token validation failed - clearing authentication");
                    SecurityContextHolder.clearContext();
                }
            } catch (Exception e) {
                System.out.println("Error processing token: " + e.getMessage());
                e.printStackTrace();
                SecurityContextHolder.clearContext();
            }
        } else {
            System.out.println("No Bearer token found in Authorization header");
        }

        System.out.println("=== JwtAuthFilter END ===");
        filterChain.doFilter(request, response);
    }
}