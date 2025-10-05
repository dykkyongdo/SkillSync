package com.skillsync_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "review_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) private UUID id;

    @ManyToOne(optional = false) private User user;
    @ManyToOne(optional = false) private Group group;
    @ManyToOne(optional = false) private FlashcardSet set;
    @ManyToOne(optional = false) private Flashcard card;

    // what happened
    @Column(nullable = false) private int grade;            // 0..3
    @Column(nullable = false) private int xpAwarded;        // derived rule
    @Column(nullable = false) private Instant reviewedAt;   // Instant.now()
}