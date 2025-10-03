package com.skillsync_backend.security;

import com.skillsync_backend.model.User;
import com.skillsync_backend.model.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;

import java.util.Date;
import java.security.Key;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;            //in milliseconds

    private Key key;

    @PostConstruct
    public void init() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret is not configured. Please set JWT_SECRET environment variable.");
        }
        if (expiration == null || expiration <= 0) {
            throw new IllegalStateException("JWT expiration is not configured. Please set JWT_EXPIRATION environment variable.");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        System.out.println("JWT Token Provider initialized with secret length: " + secret.length());
        System.out.println("JWT expiration: " + expiration + " ms");
    }

    public String generateToken(User user) {                //Generates a signed JWT with email and role
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {            //Checks if token is valid or expired
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        }  catch (JwtException | IllegalArgumentException e) {
            System.out.println("JWT validation failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            return false;
        }
    }

    public String getEmailFromToken(String token) {         //Returns the user’s email (used for authentication)
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        return claims.getSubject();             //email
    }

    public Role getRoleFromToken(String token) {            //Extracts the user’s role (optional for authorization)
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        return Role.valueOf(claims.get("role", String.class));
    }

}
