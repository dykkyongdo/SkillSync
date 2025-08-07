package com.skillsync_backend.service;

import com.skillsync_backend.model.User;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.repository.GroupRepository;
import com.skillsync_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public Group createGroup(String name, String description, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail).orElseThrow(() -> new RuntimeException("User not found"));

        Group group = Group.builder()
                .name(name)
                .description(description)
                .createdAt(Instant.now())
                .createdBy(creator)
                .build();
        return groupRepository.save(group);
    }
}
