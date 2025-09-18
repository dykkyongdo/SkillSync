package com.skillsync_backend.repository;

import com.skillsync_backend.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    List<Flashcard> findBySetId(UUID setId);
}


