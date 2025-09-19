package com.skillsync_backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI SkillSyncOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("SkillSync API")
                .description("Groups, Flashcards with JWT auth")
                .version("v1"));
    }
}
