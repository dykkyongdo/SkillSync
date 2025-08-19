package com.skillsync_backend.service;

import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.model.Group;
import com.skillsync_backend.dto.FlashcardSetRequest;
import com.skillsync_backend.dto.FlashcardSetResponse;
import com.skillsync_backend.repository.FlashcardSetRepository;
import com.skillsync_backend.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.time.Instant;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashcardSetService {

    private final FlashcardSetRepository setRepo;
    private final GroupRepository groupRepo;

    public FlashcardSetResponse createSet(FlashcardSetRequest req) {
        Group group = groupRepo.findById(UUID.fromString(req.getGroupId()))
                .orElseThrow(() -> new RuntimeException("Group not found"));

        FlashcardSet set = FlashcardSet.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .createdAt(Instant.now())
                .group(group)
                .build();

        FlashcardSet savedSet = setRepo.save(set);

        // Convert to DTO
        return FlashcardSetResponse.builder()
                .id(savedSet.getId())
                .title(savedSet.getTitle())
                .description(savedSet.getDescription())
                .createdAt(savedSet.getCreatedAt())
                .group(FlashcardSetResponse.GroupInfo.builder()
                        .id(group.getId())
                        .name(group.getName())
                        .description(group.getDescription())
                        .build())
                .build();
    }

    public List<FlashcardSetResponse> getSetsByGroup(UUID groupId) {
        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        return setRepo.findByGroup(group).stream()
                .map(set -> FlashcardSetResponse.builder()
                        .id(set.getId())
                        .title(set.getTitle())
                        .description(set.getDescription())
                        .createdAt(set.getCreatedAt())
                        .group(FlashcardSetResponse.GroupInfo.builder()
                                .id(group.getId())
                                .name(group.getName())
                                .description(group.getDescription())
                                .build())
                        .build())
                .collect(Collectors.toList());
    }

    public void deleteSet(UUID id) {
        setRepo.deleteById(id);
    }
}