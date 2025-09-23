package com.skillsync_backend.controller;

import com.skillsync_backend.dto.CreateGroupRequest;
import com.skillsync_backend.dto.GroupRequest;
import com.skillsync_backend.dto.GroupResponse;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.repository.GroupMembershipRepository;
import com.skillsync_backend.repository.GroupRepository;
import com.skillsync_backend.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.support.Repositories;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final GroupMembershipRepository membershipRepo;

    @PostMapping("/create")
    public ResponseEntity<GroupResponse> create(@Valid @RequestBody CreateGroupRequest req,
                                                Authentication auth) {
        Group group = groupService.createGroup(req.getName(), req.getDescription(), auth.getName());
        return ResponseEntity.ok(toResponse(group, auth.getName()));
    }

    @PostMapping("/join/{groupId}")
    public ResponseEntity<Void> join(@PathVariable UUID groupId, Authentication auth) {
        groupService.joinGroup(groupId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-groups")
    public ResponseEntity<List<Group>> getMyGroups(Authentication authentication) {
        String email = authentication.getName();
        List<Group> groups = groupService.getGroupsForUser(email);
        return ResponseEntity.ok(groups);
    }

    @DeleteMapping("/leave/{groupId}")
    public ResponseEntity<String> leaveGroup(@PathVariable UUID groupId, Authentication authentication) {
        String email = authentication.getName();
        groupService.leaveGroup(groupId, email);
        return  ResponseEntity.ok("Left group successfully");
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponse> get(@PathVariable UUID groupId, Authentication auth) {
        Group group = groupService.getGroupByDetails(groupId);
        return ResponseEntity.ok(toResponse(group, auth.getName()));
    }

    private GroupResponse toResponse(Group group, String viewerEmail) {
        var membership = membershipRepo.findByGroup_IdAndUser_Email(group.getId(), viewerEmail).orElse(null);

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .createdAt(group.getCreatedAt())
                .createdBy(GroupResponse.CreatedBy.builder()
                        .id(group.getCreatedBy().getId())
                        .email(group.getCreatedBy().getEmail())
                        .appRole(group.getCreatedBy().getRole().name()) // global role (may be USER)
                        .build())
                .currentUserGroupRole(membership != null ? membership.getRole() : null) // expect OWNER for creator
                .build();
    }
}
