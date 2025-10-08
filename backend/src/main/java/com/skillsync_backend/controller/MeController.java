package com.skillsync_backend.controller;

import com.skillsync_backend.dto.MyStatsDto;
import com.skillsync_backend.exception.UserNotFoundException;
import com.skillsync_backend.repository.UsedCardProgressRepository;
import com.skillsync_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {
    private final UserRepository userRepo;
    private final UsedCardProgressRepository progressRepo;

    @GetMapping
    public ResponseEntity<Map<String, Object>> me(Authentication auth) {
        var user = userRepo.findByEmail(auth.getName()).orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getEmail().split("@")[0]); // Use email prefix as name for now
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<MyStatsDto> stats(Authentication auth) {
        var user = userRepo.findByEmail(auth.getName()).orElseThrow(() -> new UserNotFoundException("User not found"));
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

    @GetMapping("/daily-xp")
    public ResponseEntity<List<Map<String, Object>>> dailyXp(Authentication auth) {
        var user = userRepo.findByEmail(auth.getName()).orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // Generate last 7 days of data (mock data for now)
        List<Map<String, Object>> dailyXpData = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("xp", (int)(Math.random() * 50) + 10); // Mock XP data (10-60 XP per day)
            dayData.put("day", date.getDayOfWeek().toString().substring(0, 3)); // Mon, Tue, etc.
            dailyXpData.add(dayData);
        }
        
        return ResponseEntity.ok(dailyXpData);
    }
}
