package com.skillsync_backend.controller;

import com.skillsync_backend.dto.GroupRequest;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping("/create")
    public Group createGroup(@RequestBody GroupRequest request, Authentication authentication) {
        String username = authentication.getName();
        return groupService.createGroup(request.getName(), request.getDescription(), userEmail);
    }
}
