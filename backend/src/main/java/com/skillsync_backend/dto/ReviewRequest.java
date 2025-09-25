package com.skillsync_backend.dto;

import lombok.*;

@Getter
@Setter @AllArgsConstructor @NoArgsConstructor
public class ReviewRequest {
    /**
     * grade: 0 (again), 1 (hard), 2 (good), 3 (easy)
     */
    private int grade;
}