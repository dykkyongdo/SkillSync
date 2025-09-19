package com.skillsync_backend.service;

import com.skillsync_backend.dto.FlashcardSetDto;
import com.skillsync_backend.dto.FlashcardSetRequest;
import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.repository.FlashcardSetRepository;
import com.skillsync_backend.repository.GroupRepository;
import com.skillsync_backend.security.AccessGuard;
import com.skillsync_backend.security.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /** Create a new flashcard set inside a group. Caller must be a member. */
    @Transactional
    public FlashcardSetDto createSet(FlashcardSetRequest req, String callerEmail) {
        UUID groupId = UUID.fromString(req.getGroupId());
        access.ensureMemberOfGroup(groupId, callerEmail);

        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Group not found"));

        FlashcardSet set = FlashcardSet.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .createdAt(Instant.now())
                .group(group)
                .build();

        FlashcardSet saved = setRepo.save(set);
        return toDto(saved);
    }

    /** List sets for a group. Caller must be a member. */
    @Transactional(readOnly = true)
    public Page<FlashcardSetDto> getSetsByGroup(UUID groupId, String callerEmail, Pageable pageable) {
        access.ensureMemberOfGroup(groupId, callerEmail);

        return setRepo.findByGroupId(groupId, pageable).map(this::toDto);
    }

    /** Delete a set. Caller must be a member of the owning group. */
    @Transactional
    public void deleteSet(UUID setId, String callerEmail) {
        FlashcardSet set = access.ensureMemberOfSet(setId, callerEmail);
        setRepo.delete(set);
    }

    /** Map entity -> DTO (keeps API stable and avoids JPA internals). */
    private FlashcardSetDto toDto(FlashcardSet s) {
        return FlashcardSetDto.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .createdAt(s.getCreatedAt())
                .groupId(s.getGroup().getId())
                .build();
    }
}
