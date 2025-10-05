package com.skillsync_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "flashcard_sets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FlashcardSet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    private String description;

    private Instant createdAt;

    @ManyToOne
    @JoinColumn(name = "group_id", referencedColumnName = "id")
    @JsonIgnore
    private Group group;

    @Builder.Default
    @OneToMany(mappedBy = "set", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Flashcard> flashcards = new ArrayList<>();
}
