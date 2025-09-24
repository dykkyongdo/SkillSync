package com.skillsync_backend.controller;

import com.skillsync_backend.dto.InviteRequest;
import com.skillsync_backend.dto.MemberDto;
import com.skillsync_backend.dto.RoleUpdateRequest;
import com.skillsync_backend.service.GroupMembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/groups/{groupId}/members")
@RequiredArgsConstructor
public class GroupMembershipController {

    private final GroupMembershipService service;

    @PostMapping("/invite")
    public ResponseEntity<MemberDto> invite(@PathVariable UUID groupId,
                                            @Valid @RequestBody InviteRequest req,
                                            Authentication auth) {
        return ResponseEntity.ok(service.invite(groupId, req.getEmail(), auth.getName()));
    }

    @PostMapping("/accept")
    public ResponseEntity<MemberDto> accept(@PathVariable UUID groupId, Authentication auth) {
        return ResponseEntity.ok(service.accept(groupId, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<MemberDto>> list(@PathVariable UUID groupId, Authentication auth) {
        return ResponseEntity.ok(service.list(groupId, auth.getName()));
    }

    @DeleteMapping("/{membershipId}")
    public ResponseEntity<Map<String, String>> remove(@PathVariable UUID groupId,
                                       @PathVariable UUID membershipId,
                                       Authentication auth) {
        service.remove(groupId, membershipId, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
    }

    @PatchMapping("/{membershipId}/role")
    public ResponseEntity<MemberDto> updateRole(@PathVariable UUID groupId,
                                                @PathVariable UUID membershipId,
                                                @Valid @RequestBody RoleUpdateRequest req,
                                                Authentication auth) {
        return ResponseEntity.ok(service.updateRole(groupId, membershipId, req.getRole(), auth.getName()));
    }
}
