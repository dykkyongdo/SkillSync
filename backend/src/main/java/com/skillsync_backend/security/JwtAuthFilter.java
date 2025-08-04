package com.skillsync_backend.security;

import com.skillsync_backend.security.JwtTokenProvider;
import com.skillsync_backend.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.FilterChain;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");             //Read the "Authorization" header from the incoming HTTP request

        if (header != null && header.startsWith("Bearer ")) {               //Check if it starts with "Bearer", indicating a JWT is present
            String token = header.substring(7);                   //Extract token by removing "Bearer " prefix 7 chars
            String email = jwtTokenProvider.validateTokenAndGetEmail(token);
            if (email != null) {                // if token is valid and email is found
                var user = userService.loadUserByUsername(email);           //Load full user details from database
                var auth = new UsernamePasswordAuthenticationToken(email, user, null); //Create a Spring Security authentication token
                SecurityContextHolder.getContext().setAuthentication(auth);  //Set authentication info into the current request context
            }
        }

        filterChain.doFilter(request, response);    //Continue the filter chain (eventually reaching controller)
    }
}
