package com.skillsync_backend.controller;

import com.skillsync_backend.dto.LeaderboardRowDto;
import com.skillsync_backend.model.User;
import com.skillsync_backend.repository.ReviewLogRepository;
import com.skillsync_backend.repository.UserRepository;
import com.skillsync_backend.security.AccessGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {
    private final AccessGuard access;
    private final ReviewLogRepository logRepo;
    private final UserRepository userRepo;

    @GetMapping("/weekly")
    public ResponseEntity<List<LeaderboardRowDto>> weekly(@PathVariable UUID groupId, Authentication auth) {
        access.ensureMemberOfGroup(groupId, auth.getName());

        var now = Instant.now();
        var from = now.minus(7, ChronoUnit.DAYS);
        var rows = logRepo.leaderboardForGroup(groupId, from, now);

        var result = new ArrayList<LeaderboardRowDto>();
        for (Object[] r : rows) {
            UUID userId = (UUID) r[0];
            int xp = ((Number) r[1]).intValue();
            var email = userRepo.findById(userId).map(User::getEmail).orElse("unknown");
            result.add(LeaderboardRowDto.builder().userId(userId).email(email).xp(xp).build());
        }
        return ResponseEntity.ok(result);
    }
}
