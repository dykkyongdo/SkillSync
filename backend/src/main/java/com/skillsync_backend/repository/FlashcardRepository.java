package com.skillsync_backend.repository;

import com.skillsync_backend.model.Flashcard;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.UUID;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    Page<Flashcard> findBySetId(UUID setId, Pageable pageable);
    long countBySetId(UUID setId);
}


