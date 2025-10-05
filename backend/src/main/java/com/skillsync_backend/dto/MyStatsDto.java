package com.skillsync_backend.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MyStatsDto {
    private int xp;
    private int level;
    private int streakCount;
    private int masteredCards;
    private int dueToday;
}
