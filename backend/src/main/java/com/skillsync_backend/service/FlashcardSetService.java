package com.skillsync_backend.service;

import com.skillsync_backend.dto.FlashcardSetRequest;
import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.repository.FlashcardSetRepository;
import com.skillsync_backend.repository.GroupRepository;
import com.skillsync_backend.security.AccessGuard;
import com.skillsync_backend.security.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FlashcardSetService {

    private final FlashcardSetRepository setRepo;
    private final GroupRepository groupRepo;
    private final AccessGuard access;

    /**
     * Create a new flashcard set inside a group.
     * Caller must be a member of the target group.
     */
    @Transactional
    public FlashcardSet createSet(FlashcardSetRequest req, String callerEmail) {
        UUID groupId = UUID.fromString(req.getGroupId());

        // Ensure the caller is a member of the group
        access.ensureMemberOfGroup(groupId, callerEmail);

        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));

        FlashcardSet set = FlashcardSet.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .createdAt(Instant.now())
                .group(group)
                .build();

        return setRepo.save(set);
    }

    /**
     * List all sets in a group.
     * Caller must be a member of the group.
     */
    @Transactional(readOnly = true)
    public List<FlashcardSet> getSetsByGroup(UUID groupId, String callerEmail) {
        access.ensureMemberOfGroup(groupId, callerEmail);

        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));

        return setRepo.findByGroup(group);
    }

    /**
     * Delete a flashcard set.
     * Caller must be a member of the group that owns the set.
     * (You can later tighten this to only allow owner/admins.)
     */
    @Transactional
    public void deleteSet(UUID setId, String callerEmail) {
        // Validates membership and returns the set
        FlashcardSet set = access.ensureMemberOfSet(setId, callerEmail);
        setRepo.delete(set);
    }
}
