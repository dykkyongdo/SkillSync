package com.skillsync_backend.security;

import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.model.GroupRole;
import com.skillsync_backend.model.MembershipStatus;
import com.skillsync_backend.repository.FlashcardSetRepository;
import com.skillsync_backend.repository.GroupMembershipRepository;
import com.skillsync_backend.repository.GroupRepository;
import com.skillsync_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AccessGuard {

    private final FlashcardSetRepository setRepo;
    private final GroupRepository groupRepo;
    private final GroupMembershipRepository membershipRepo;

    // Check user is member of a group
    public void ensureMemberOfGroup(UUID groupId, String email) {
        boolean ok = groupRepo.existsByIdAndMembers_Email(groupId, email);
        if (!ok) throw new ForbiddenException("You are not member of this group.");
    }

    public void ensureAdminOrOwner(UUID groupId, String email) {
        var m = membershipRepo.findByGroup_IdAndUser_Email(groupId, email)
                .orElseThrow(() -> new ForbiddenException("You are not member of this group."));
        if (!(m.getRole() == GroupRole.OWNER || m.getRole() == GroupRole.ADMIN)) {
            throw new ForbiddenException("Admin or Owner role required of this action.");
        }
    }

    // Check user is member of a group that owns the set
    public FlashcardSet ensureMemberOfSet(UUID setId, String email) {
        var set = setRepo.findById(setId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));

        ensureMemberOfGroup(set.getGroup().getId(), email);
        return set;
    }
}
