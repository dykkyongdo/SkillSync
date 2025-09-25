package com.skillsync_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_card_progress", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "flashcard_id"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCardProgress {

    @Id
    @GeneratedValue
    private UUID Id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "flashcard_id")
    private Flashcard flashcard;

    // SM-2-lite state
    @Column(nullable = false)
    private double ease;            // start ~2.5

    @Column(nullable = false)
    private int repetitions;        // streak

    @Column(nullable = false)
    private int intervalDays;       // next gap

    @Column(nullable = false)
    private Instant nextDueAt;      // due time

    private Instant lastReviewedAt;
}
