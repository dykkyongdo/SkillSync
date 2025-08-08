package com.skillsync_backend.service;

import com.skillsync_backend.model.User;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.repository.GroupRepository;
import com.skillsync_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
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

    @Transactional
    public void joinGroup(UUID groupId, String userEmail) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));

        group.getMembers().add(user);
        groupRepository.save(group);
    }

    public List<Group> getGroupsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));

        return groupRepository.findAllByMembersContaining(user);
    }

    @Transactional
    public void leaveGroup(UUID groupId, String userEmail) {

        Group group = groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));

        group.getMembers().remove(user);
        groupRepository.save(group);
    }

    public Group getGroupByDetails(UUID groupId) {
        return groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
    }
}


