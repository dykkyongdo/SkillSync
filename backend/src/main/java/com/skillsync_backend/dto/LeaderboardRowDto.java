package com.skillsync_backend.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class LeaderboardRowDto {
    private UUID userId;
    private String email;
    private int xp;
}
