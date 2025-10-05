package com.skillsync_backend.repository;

import com.skillsync_backend.model.FlashcardSet;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FlashcardSetRepository extends JpaRepository<FlashcardSet, UUID> {
    Page<FlashcardSet> findByGroupId(UUID groupId, Pageable pageable);
    List<FlashcardSet> findByTitleAndGroupId(String title, UUID groupId);
}
