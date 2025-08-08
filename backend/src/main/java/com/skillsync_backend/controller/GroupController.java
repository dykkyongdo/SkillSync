package com.skillsync_backend.controller;

import com.skillsync_backend.dto.GroupRequest;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.service.GroupService;
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

    @PostMapping("/create")
    public Group createGroup(@RequestBody GroupRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        return groupService.createGroup(request.getName(), request.getDescription(), userEmail);
    }

    @PostMapping("/join/{groupID}")
    public ResponseEntity<String> joinGroup(@PathVariable UUID groupID, Authentication authentication) {
        String email = authentication.getName();
        groupService.joinGroup(groupID, email);
        return ResponseEntity.ok("Joined group successfully");
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
}
