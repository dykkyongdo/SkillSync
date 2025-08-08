package com.skillsync_backend.controller;

import com.skillsync_backend.dto.GroupRequest;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.support.Repositories;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
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
}
