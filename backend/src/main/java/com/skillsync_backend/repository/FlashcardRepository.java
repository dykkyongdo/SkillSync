package com.skillsync_backend.repository;

import com.skillsync_backend.model.Flashcard;
import com.skillsync_backend.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    List<Flashcard> findByGroup(Group group);
}


