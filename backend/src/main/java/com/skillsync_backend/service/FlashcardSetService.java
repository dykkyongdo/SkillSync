package com.skillsync_backend.service;

import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.dto.FlashcardSetRequest;
import com.skillsync_backend.repository.FlashcardSetRepository;
import com.skillsync_backend.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.time.Instant;


@Service
@RequiredArgsConstructor
public class FlashcardSetService {

    private final FlashcardSetRepository setRepo;
    private final GroupRepository groupRepo;

    public FlashcardSet createSet(FlashcardSetRequest req) {
        Group group = groupRepo.findById(UUID.fromString(req.getGroupId())).orElseThrow(() -> new RuntimeException("Group not found"));

        FlashcardSet set = FlashcardSet.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .createdAt(Instant.now())
                .group(group)
                .build();

        return setRepo.save(set);
    }

    public List<FlashcardSet> getSetsByGroup(UUID groupId) {
        Group group = groupRepo.findById(groupId).orElseThrow(() -> new RuntimeException("Group not found"));
        return setRepo.findByGroup(group);
    }

    public void deleteSet(UUID id) {
        setRepo.deleteById(id);
    }
}
