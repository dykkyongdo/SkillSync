package com.skillsync_backend.repository;

import com.skillsync_backend.model.UserCardProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.*;
import java.time.Instant;

public interface UsedCardProgressRepository extends JpaRepository<UserCardProgress, UUID> {

    Optional<UserCardProgress> findByUser_IdAndFlashcard_Id(UUID userId, UUID flashcardId);

    // Find due cards for a user within set
    List<UserCardProgress> findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(UUID userId, UUID setId, Instant dueBefore);

    int countByUser_IdAndMasteredTrue(UUID userId);

    @Query("""
      select count(p)
      from UserCardProgress p
      where p.user.id = :userId and p.nextDueAt <= :now
    """)
    int countDueByUserForToday(UUID userId, Instant now);
}

