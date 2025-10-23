package com.skillsync_backend.config;

import com.skillsync_backend.security.JwtAuthFilter;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @PostConstruct
    public void init() {
        log.info("SecurityConfig initialized");
        // Debug logging removed for production
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {  // FIXED: lowercase 's'
        return http
                // CORS + CSRF
                .cors(cors -> {})                       // Enable CORS using the bean below
                .csrf(csrf -> csrf.disable())           //Disable CSRF since we're using JWT for auth

                .sessionManagement(session -> session       // Stateless session management (JWT = no session)
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // Headers configuration
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions
                                .deny()  // Deny frames for security
                        )
                        .contentTypeOptions(contentTypeOptions -> contentTypeOptions
                                .disable()  // Prevent MIME type sniffing
                        )
                        .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                                .maxAgeInSeconds(31536000)  // 1 year
                        )
                        .referrerPolicy(referrerPolicy -> referrerPolicy
                                .policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        // Swagger / OpenAPI - DISABLED IN PRODUCTION
                        // .requestMatchers("/v3/api-docs").permitAll()      // <-- root JSON (this is the one you're missing)
                        // .requestMatchers("/v3/api-docs/**").permitAll()   // swagger-config & groups
                        // .requestMatchers("/swagger-ui.html", "/swagger-ui/**").permitAll()
                        // H2 Console - DISABLED IN PRODUCTION
                        // .requestMatchers("/h2-console/**").permitAll()

                        // Everything else
                        .anyRequest().authenticated()
                )


                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)         // Add custom JWT filter
                .build();
    }

    // Required for authentication in login process
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // CORS config used by Spring Security
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        cfg.setAllowedOriginPatterns(List.of("http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization","Content-Type"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

}