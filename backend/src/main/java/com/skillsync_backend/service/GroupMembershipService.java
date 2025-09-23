package com.skillsync_backend.service;

import com.skillsync_backend.dto.MemberDto;
import com.skillsync_backend.model.*;
import com.skillsync_backend.repository.GroupMembershipRepository;
import com.skillsync_backend.repository.UserRepository;
import com.skillsync_backend.repository.GroupRepository;
import com.skillsync_backend.security.AccessGuard;
import com.skillsync_backend.security.NotFoundException;
import com.skillsync_backend.security.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.Globals;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupMembershipService {
    private final UserRepository userRepo;
    private final GroupRepository groupRepo;
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

    // Invite registered user by email
    @Transactional
    public MemberDto invite(UUID groupId, String targetEmail, String inviterEmail) {
        // Only ADMIN/OWNER can invite
        access.ensureAdminOrOwner(groupId, inviterEmail);

        var group = groupRepo.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));

        var user = userRepo.findByEmail(targetEmail).orElseThrow(() -> new NotFoundException("User not found"));

        if (membershipRepo.existsByGroup_IdAndUser_Email(groupId, targetEmail)) {
            throw new ForbiddenException("User is already invited");
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
        var m = membershipRepo.findByGroup_IdAndUser_Email(groupId, callerEmail).orElseThrow(() -> new NotFoundException("Invite not found"));

        if (m.getStatus() != MembershipStatus.INVITED) {
            throw new ForbiddenException("Invite is not in INVITED state");
        }
        m.setStatus(MembershipStatus.ACTIVE);
        return toDto(m);
    }

    // List all members
    // Regular MEMBER can still list (common UX), if you prefer to restrict, change to ensureAdminOrOwner.
    @Transactional(readOnly = true)
    public List<MemberDto> list(UUID groupId, String callerEmail) {
        access.ensureMemberOfGroup(groupId, callerEmail);
        return membershipRepo.findByGroup_Id(groupId).stream().map(this::toDto).toList();
    }

    // Remove a member (ADMIN/OWNER only). Owner cannot be removed by others; and the last OWNER cannot be removed.
    @Transactional
    public void remove(UUID groupId, UUID membershipId,String callerEmail) {
        access.ensureAdminOrOwner(groupId, callerEmail);

        var m = membershipRepo.findById(membershipId).orElseThrow(() -> new NotFoundException("Membership not found"));
        if (!m.getGroup().getId().equals(groupId)) {
            throw new ForbiddenException("Membership does not belong to this group");
        }

        if (m.getRole() == GroupRole.OWNER) {
            long owners = membershipRepo.countByGroup_IdAndRole(groupId, GroupRole.MEMBER);
            if (owners <= 1) {
                throw new ForbiddenException("Cannot remove last owner");
            }
        }
        membershipRepo.delete(m);
    }

 }
