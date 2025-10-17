package com.skillsync_backend.service;

import com.skillsync_backend.dto.InvitationDto;
import com.skillsync_backend.exception.ResourceNotFoundException;
import com.skillsync_backend.exception.UserNotFoundException;
import com.skillsync_backend.model.GroupMembership;
import com.skillsync_backend.model.MembershipStatus;
import com.skillsync_backend.repository.GroupMembershipRepository;
import com.skillsync_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final GroupMembershipRepository membershipRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public List<InvitationDto> getUserInvitations(String userEmail) {
        log.info("Fetching invitations for user: {}", userEmail);
        
        var user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        var invitations = membershipRepo.findByUser_IdAndStatus(user.getId(), MembershipStatus.INVITED);
        
        return invitations.stream()
                .map(this::toInvitationDto)
                .toList();
    }

    @Transactional
    public void acceptInvitation(UUID membershipId, String userEmail) {
        log.info("Accepting invitation {} for user: {}", membershipId, userEmail);
        
        var membership = membershipRepo.findById(membershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        // Verify the invitation belongs to the current user
        if (!membership.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("You can only accept your own invitations");
        }

        if (membership.getStatus() != MembershipStatus.INVITED) {
            throw new IllegalArgumentException("This invitation is no longer valid");
        }

        membership.setStatus(MembershipStatus.ACTIVE);
        membershipRepo.save(membership);
        
        log.info("Invitation {} accepted successfully", membershipId);
    }

    @Transactional
    public void rejectInvitation(UUID membershipId, String userEmail) {
        log.info("Rejecting invitation {} for user: {}", membershipId, userEmail);
        
        var membership = membershipRepo.findById(membershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        // Verify the invitation belongs to the current user
        if (!membership.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("You can only reject your own invitations");
        }

        if (membership.getStatus() != MembershipStatus.INVITED) {
            throw new IllegalArgumentException("This invitation is no longer valid");
        }

        membership.setStatus(MembershipStatus.REJECTED);
        membershipRepo.save(membership);
        
        log.info("Invitation {} rejected successfully", membershipId);
    }

    private InvitationDto toInvitationDto(GroupMembership membership) {
        var group = membership.getGroup();
        var inviter = group.getCreatedBy(); // Assuming the group creator is the inviter
        
        return InvitationDto.builder()
                .membershipId(membership.getId())
                .groupId(group.getId())
                .groupName(group.getName())
                .groupDescription(group.getDescription())
                .inviterEmail(inviter.getEmail())
                .inviterName(inviter.getEmail()) // We'll use email as name for now
                .sentAt(membership.getCreatedAt())
                .build();
    }
}
