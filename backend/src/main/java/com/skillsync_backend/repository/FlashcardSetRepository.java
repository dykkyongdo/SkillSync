package com.skillsync_backend.repository;

import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.UUID;

public interface FlashcardSetRepository extends JpaRepository<FlashcardSet, UUID> {
    List<FlashcardSet> findByGroup(Group group);
}
