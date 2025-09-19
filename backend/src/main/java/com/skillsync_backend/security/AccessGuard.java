package com.skillsync_backend.security;

import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.repository.FlashcardSetRepository;
import com.skillsync_backend.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AccessGuard {

    private final FlashcardSetRepository setRepo;
    private final GroupRepository groupRepo;

    // Check user is member of a group
    public void ensureMemberOfGroup(UUID groupId, String email) {
        boolean ok = groupRepo.existsByIdAndMembers_Email(groupId, email);
        if (!ok) throw new ForbiddenException("You are not member of this group.");
    }

    // Check user is member of a group that owns the set
    public FlashcardSet ensureMemberOfSet(UUID setId, String email) {
        var set = setRepo.findById(setId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));

        ensureMemberOfGroup(set.getGroup().getId(), email);
        return set;
    }
}
