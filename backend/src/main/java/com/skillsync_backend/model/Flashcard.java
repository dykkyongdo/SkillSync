package com.skillsync_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "flashcards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Question is required")
    @Size(max = 1000, message = "Question must not exceed 1000 characters")
    @Column(nullable = false)
    private String question;

    @NotBlank(message = "Answer is required")
    @Size(max = 1000, message = "Answer must not exceed 1000 characters")
    @Column(nullable = false)
    private String answer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", referencedColumnName = "id")
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id", referencedColumnName = "id")
    private FlashcardSet set;
}
