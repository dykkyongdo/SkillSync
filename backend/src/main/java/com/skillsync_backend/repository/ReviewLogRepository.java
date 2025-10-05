package com.skillsync_backend.repository;

import com.skillsync_backend.model.ReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ReviewLogRepository extends JpaRepository<ReviewLog, UUID> {
    @Query("""
        select coalesce(sum(r.xpAwarded),0)
        from ReviewLog r
        where r.user.id = :userId and r.reviewedAt >= :from and r.reviewedAt < :to
    """)
    int sumXpForUserBetween(UUID userId, Instant from, Instant to);

    @Query("""
        select r.user.id, coalesce(sum(r.xpAwarded),0)
        from ReviewLog r
        where r.group.id = :groupId and r.reviewedAt >= :from and r.reviewedAt < :to
        group by r.user.id
        order by 2 desc
      """)
    List<Object[]> leaderboardForGroup(UUID groupId, Instant from, Instant to);

}

