package com.skillsync_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Configuration
public class RateLimitingConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitingInterceptor())
                .addPathPatterns("/api/auth/**");
    }

    @Bean
    public HandlerInterceptor rateLimitingInterceptor() {
        return new RateLimitingInterceptor();
    }

    public static class RateLimitingInterceptor implements HandlerInterceptor {
        private final ConcurrentHashMap<String, RateLimitInfo> rateLimitMap = new ConcurrentHashMap<>();
        private static final int MAX_REQUESTS = 5; // 5 requests per minute
        private static final int TIME_WINDOW_MINUTES = 1;

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            String clientIp = getClientIpAddress(request);
            String key = clientIp + ":" + request.getRequestURI();
            
            RateLimitInfo rateLimitInfo = rateLimitMap.computeIfAbsent(key, k -> new RateLimitInfo());
            
            LocalDateTime now = LocalDateTime.now();
            
            // Reset counter if time window has passed
            if (rateLimitInfo.lastReset.isBefore(now.minus(TIME_WINDOW_MINUTES, ChronoUnit.MINUTES))) {
                rateLimitInfo.count.set(0);
                rateLimitInfo.lastReset = now;
            }
            
            // Check if limit exceeded
            if (rateLimitInfo.count.get() >= MAX_REQUESTS) {
                response.setStatus(429); // Too Many Requests
                response.setHeader("Retry-After", String.valueOf(TIME_WINDOW_MINUTES * 60));
                return false;
            }
            
            // Increment counter
            rateLimitInfo.count.incrementAndGet();
            return true;
        }
        
        private String getClientIpAddress(HttpServletRequest request) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp;
            }
            return request.getRemoteAddr();
        }
        
        private static class RateLimitInfo {
            AtomicInteger count = new AtomicInteger(0);
            LocalDateTime lastReset = LocalDateTime.now();
        }
    }
}
