package com.skillsync_backend.service;

import com.skillsync_backend.dto.GroupResponse;
import com.skillsync_backend.model.User;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.repository.GroupMembershipRepository;
import com.skillsync_backend.repository.GroupRepository;
import com.skillsync_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMembershipService membershipService;
    @Autowired
    private GroupMembershipRepository membershipRepo;

    public Group createGroup(String name, String description, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail).orElseThrow(() -> new RuntimeException("User not found"));

        Group group = Group.builder()
                .name(name)
                .description(description)
                .createdAt(Instant.now())
                .createdBy(creator)
                .build();

        var saved = groupRepository.save(group);

        membershipService.createOwnerMembership(saved, creator);

        return saved;
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
                        .appRole(group.getCreatedBy().getRole().name()) // global role stays USER (that’s fine)
                        .build())
                .currentUserGroupRole(membership != null ? membership.getRole() : null)
                .build();
    }
}


