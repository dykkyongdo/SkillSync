package com.skillsync_backend.controller;

import com.skillsync_backend.dto.MyStatsDto;
import com.skillsync_backend.repository.UsedCardProgressRepository;
import com.skillsync_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {
    private final UserRepository userRepo;
    private final UsedCardProgressRepository progressRepo;

    @GetMapping("/stats")
    public ResponseEntity<MyStatsDto> stats(Authentication auth) {
        var user = userRepo.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        int mastered = progressRepo.countByUser_IdAndMasteredTrue(user.getId());
        int dueToday = progressRepo.countDueByUserForToday(user.getId(), Instant.now());

        return ResponseEntity.ok(MyStatsDto.builder()
                .xp(user.getXp())
                .level(user.getLevel())
                .streakCount(user.getStreakCount())
                .masteredCards(mastered)
                .dueToday(dueToday)
                .build());
    }
}
