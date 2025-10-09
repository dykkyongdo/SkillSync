package com.skillsync_backend.service;

import com.skillsync_backend.dto.GroupResponse;
import com.skillsync_backend.exception.ResourceNotFoundException;
import com.skillsync_backend.exception.UserNotFoundException;
import com.skillsync_backend.model.User;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.repository.GroupMembershipRepository;
import com.skillsync_backend.repository.GroupRepository;
import com.skillsync_backend.repository.ReviewLogRepository;
import com.skillsync_backend.repository.UsedCardProgressRepository;
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
    @Autowired
    private ReviewLogRepository reviewLogRepo;
    @Autowired
    private UsedCardProgressRepository progressRepo;

    public Group createGroup(String name, String description, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail).orElseThrow(() -> new UserNotFoundException("User not found"));

        Group group = Group.builder()
                .name(name)
                .description(description)
                .createdAt(Instant.now())
                .createdBy(creator)
                .build();

        group = groupRepository.save(group);
        groupRepository.flush();

        membershipService.createOwnerMembership(group, creator);

        return group;
    }

    @Transactional
    public void joinGroup(UUID groupId, String userEmail) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new UserNotFoundException("User not found"));

        group.getMembers().add(user);
        groupRepository.save(group);
    }

    public List<Group> getGroupsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new UserNotFoundException("User not found"));

        return groupRepository.findAllByMembersContaining(user);
    }

    @Transactional
    public void leaveGroup(UUID groupId, String userEmail) {

        Group group = groupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new UserNotFoundException("User not found"));

        group.getMembers().remove(user);
        groupRepository.save(group);
    }

    public Group getGroupByDetails(UUID groupId) {
        return groupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    }

    @Transactional
    public void deleteGroup(UUID groupId, String callerEmail) {
        try {
            Group group = groupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found"));
            
            // Check if the caller is the creator/owner of the group
            if (!group.getCreatedBy().getEmail().equals(callerEmail)) {
                throw new RuntimeException("Only the group creator can delete the group");
            }
            
            // Clear the members collection first to avoid constraint issues
            group.getMembers().clear();
            groupRepository.save(group);
            
            // Delete all group memberships
            membershipRepo.deleteAllByGroup_Id(groupId);
            
            // Delete all review logs for this group
            reviewLogRepo.deleteAllByGroup_Id(groupId);
            
            // Delete all user card progress records for this group
            progressRepo.deleteAllByFlashcard_Group_Id(groupId);
            
            // Let JPA handle the cascade deletion of flashcard sets and flashcards
            // The Group entity has proper cascade settings (CascadeType.ALL, orphanRemoval = true)
            // for both sets and flashcards, so we can simply delete the group
            groupRepository.delete(group);
            
        } catch (Exception e) {
            // Log the actual error for debugging
            System.err.println("Error deleting group: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete group: " + e.getMessage(), e);
        }
    }

    private GroupResponse toResponse(Group group, String viewerEmail) {
        var membership = membershipRepo.findByGroup_IdAndUser_Email(group.getId(), viewerEmail).orElse(null);

        return GroupResponse.builder()
                .groupId(group.getId())
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


