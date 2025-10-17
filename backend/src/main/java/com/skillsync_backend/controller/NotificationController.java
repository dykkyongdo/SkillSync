package com.skillsync_backend.controller;

import com.skillsync_backend.dto.InvitationDto;
import com.skillsync_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/invitations")
    public ResponseEntity<List<InvitationDto>> getInvitations(Authentication auth) {
        return ResponseEntity.ok(notificationService.getUserInvitations(auth.getName()));
    }

    @PostMapping("/invitations/{membershipId}/accept")
    public ResponseEntity<Map<String, String>> acceptInvitation(@PathVariable UUID membershipId, Authentication auth) {
        notificationService.acceptInvitation(membershipId, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Invitation accepted successfully"));
    }

    @PostMapping("/invitations/{membershipId}/reject")
    public ResponseEntity<Map<String, String>> rejectInvitation(@PathVariable UUID membershipId, Authentication auth) {
        notificationService.rejectInvitation(membershipId, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Invitation rejected successfully"));
    }
}
