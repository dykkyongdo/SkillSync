package com.skillsync_backend.service;

import com.skillsync_backend.dto.MemberDto;
import com.skillsync_backend.model.*;
import com.skillsync_backend.repository.GroupMembershipRepository;
import com.skillsync_backend.repository.GroupRepository;
import com.skillsync_backend.repository.UserRepository;
import com.skillsync_backend.security.AccessGuard;
import com.skillsync_backend.security.NotFoundException;
import com.skillsync_backend.security.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupMembershipService {

    private final GroupRepository groupRepo;
    private final UserRepository userRepo;
    private final GroupMembershipRepository membershipRepo;
    private final AccessGuard access;

    private MemberDto toDto(GroupMembership m) {
        return MemberDto.builder()
                .membershipId(m.getId())
                .userId(m.getUser().getId())
                .email(m.getUser().getEmail())
                .role(m.getRole())
                .status(m.getStatus())
                .createdAt(m.getCreatedAt())
                .build();
    }

    // Invite a registered user by email. Admin/Owner only.
    @Transactional
    public MemberDto invite(UUID groupId, String targetEmail, String inviterEmail) {
        // Only ADMIN/OWNER can invite
        access.ensureAdminOrOwner(groupId, inviterEmail);

        var group = groupRepo.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));

        var user = userRepo.findByEmail(targetEmail)
                .orElseThrow(() -> new NotFoundException("Target user not found"));

        if (membershipRepo.existsByGroup_IdAndUser_Email(groupId, targetEmail)) {
            throw new ForbiddenException("User is already invited or a member.");
        }

        var membership = GroupMembership.builder()
                .group(group)
                .user(user)
                .role(GroupRole.MEMBER)
                .status(MembershipStatus.INVITED)
                .build();

        return toDto(membershipRepo.save(membership));
    }

    // Accept your own invite into group. Caller is the invitee.
    @Transactional
    public MemberDto accept(UUID groupId, String callerEmail) {
        var m = membershipRepo.findByGroup_IdAndUser_Email(groupId, callerEmail)
                .orElseThrow(() -> new NotFoundException("Invite not found."));
        if (m.getStatus() != MembershipStatus.INVITED) {
            throw new ForbiddenException("Invite is not in INVITED state.");
        }
        m.setStatus(MembershipStatus.ACTIVE);
        return toDto(m);
    }

    // List all members (ADMIN/OWNER can see invites too).
    // Regular MEMBER can still list (common UX), if you prefer to restrict, change to ensureAdminOrOwner.
    @Transactional(readOnly = true)
    public List<MemberDto> list(UUID groupId, String callerEmail) {
        access.ensureMemberOfGroup(groupId, callerEmail);
        return membershipRepo.findByGroup_Id(groupId).stream().map(this::toDto).toList();
    }

    // Remove a member (ADMIN/OWNER only). Owner cannot be removed by others; and the last OWNER cannot be removed.
    @Transactional
    public void remove(UUID groupId, UUID membershipId, String callerEmail) {
        access.ensureAdminOrOwner(groupId, callerEmail);

        var m = membershipRepo.findById(membershipId)
                .orElseThrow(() -> new NotFoundException("Membership not found."));
        if (!m.getGroup().getId().equals(groupId)) {
            throw new ForbiddenException("Membership does not belong to this group.");
        }

        if (m.getRole() == GroupRole.OWNER) {
            long owners = membershipRepo.countByGroup_IdAndRole(groupId, GroupRole.OWNER);
            if (owners <= 1) throw new ForbiddenException("Cannot remove the last owner.");
        }

        membershipRepo.delete(m);
    }

    // Change a member role (ADMIN/OWNER only). Cannot demote the last OWNER.
    @Transactional
    public MemberDto updateRole(UUID groupId, UUID membershipId, GroupRole newRole, String callerEmail) {
        access.ensureAdminOrOwner(groupId, callerEmail);

        var m = membershipRepo.findById(membershipId)
                .orElseThrow(() -> new NotFoundException("Membership not found."));
        if (!m.getGroup().getId().equals(groupId)) {
            throw new ForbiddenException("Membership does not belong to this group.");
        }
        if (m.getRole() == GroupRole.OWNER && newRole != GroupRole.OWNER) {
            long owners = membershipRepo.countByGroup_IdAndRole(groupId, GroupRole.OWNER);
            if (owners <= 1) throw new ForbiddenException("Cannot demote the last owner.");
        }
        m.setRole(newRole);
        return toDto(m);
    }

    // Utility to create the initial OWNER membership when creating a group.
    @Transactional
    public void createOwnerMembership(Group group, User creator) {
        if (group.getId() == null) {
            throw new IllegalStateException("Group must be persisted before creating membership");
        }
        if (membershipRepo.existsByGroup_IdAndUser_Email(group.getId(), creator.getEmail())) return;
        
        // Add user to the group's members collection
        group.getMembers().add(creator);
        groupRepo.save(group);
        
        // Create the membership record
        var m = GroupMembership.builder()
                .group(group)
                .user(creator)
                .role(GroupRole.OWNER)
                .status(MembershipStatus.ACTIVE)
                .build();
        membershipRepo.save(m);
    }

    // Utility to create a general membership
    @Transactional
    public void createMembership(Group group, User user, GroupRole role, MembershipStatus status) {
        if (group.getId() == null) {
            throw new IllegalStateException("Group must be persisted before creating membership");
        }
        if (membershipRepo.existsByGroup_IdAndUser_Email(group.getId(), user.getEmail())) {
            throw new ForbiddenException("User is already a member of this group");
        }
        
        // Add user to the group's members collection
        group.getMembers().add(user);
        groupRepo.save(group);
        
        // Create the membership record
        var m = GroupMembership.builder()
                .group(group)
                .user(user)
                .role(role)
                .status(status)
                .build();
        membershipRepo.save(m);
    }
}
