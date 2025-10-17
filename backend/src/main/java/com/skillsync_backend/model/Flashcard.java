package com.skillsync_backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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

    @Size(max = 2000, message = "Explanation must not exceed 2000 characters")
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String explanation = null;

    @Min(value = 1, message = "Difficulty must be at least 1")
    @Max(value = 5, message = "Difficulty must be at most 5")
    @Column(nullable = false)
    @Builder.Default
    private int difficulty = 1;

    @ElementCollection
    @CollectionTable(name = "flashcard_tags", joinColumns = @JoinColumn(name = "flashcard_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", referencedColumnName = "id")
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id", referencedColumnName = "id")
    private FlashcardSet set;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", referencedColumnName = "id")
    @Builder.Default
    private User createdBy = null;

    @CreationTimestamp
    @Column(updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @UpdateTimestamp
    @Column
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Builder.Default
    @Column(nullable = false)
    private int usageCount = 0;

    // Multiple choice support
    @ElementCollection
    @CollectionTable(name = "flashcard_options", joinColumns = @JoinColumn(name = "flashcard_id"))
    @Column(name = "option_text")
    @Builder.Default
    private List<String> options = new ArrayList<>();

    @Column(name = "correct_option_index")
    @Builder.Default
    private Integer correctOptionIndex = null;

    @Column(name = "question_type")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private QuestionType questionType = QuestionType.FREE_TEXT;

    public enum QuestionType {
        FREE_TEXT,      // Traditional question-answer format
        MULTIPLE_CHOICE // Multiple choice format
    }

    // Helper methods
    public String getDifficultyDisplay() {
        return switch (difficulty) {
            case 1 -> "Beginner";
            case 2 -> "Easy";
            case 3 -> "Medium";
            case 4 -> "Hard";
            case 5 -> "Expert";
            default -> "Unknown";
        };
    }

    public void incrementUsage() {
        this.usageCount++;
    }

    public boolean hasTag(String tag) {
        return tags != null && tags.contains(tag.toLowerCase());
    }

    public void addTag(String tag) {
        if (tags == null) {
            tags = new ArrayList<>();
        }
        if (!tags.contains(tag.toLowerCase())) {
            tags.add(tag.toLowerCase());
        }
    }

    public void removeTag(String tag) {
        if (tags != null) {
            tags.remove(tag.toLowerCase());
        }
    }

    // Multiple choice helper methods
    public boolean isMultipleChoice() {
        return questionType == QuestionType.MULTIPLE_CHOICE;
    }

    public boolean isCorrectAnswer(int selectedOptionIndex) {
        if (!isMultipleChoice() || correctOptionIndex == null) {
            return false;
        }
        return selectedOptionIndex == correctOptionIndex;
    }

    public String getCorrectAnswerText() {
        if (!isMultipleChoice() || correctOptionIndex == null || options == null) {
            return answer; // Fallback to traditional answer
        }
        if (correctOptionIndex >= 0 && correctOptionIndex < options.size()) {
            return options.get(correctOptionIndex);
        }
        return answer;
    }

    public void setMultipleChoiceOptions(List<String> options, int correctIndex) {
        this.questionType = QuestionType.MULTIPLE_CHOICE;
        this.options = options != null ? new ArrayList<>(options) : new ArrayList<>();
        this.correctOptionIndex = correctIndex;
        // Set the answer field to the correct option text for backward compatibility
        if (correctIndex >= 0 && correctIndex < this.options.size()) {
            this.answer = this.options.get(correctIndex);
        }
    }
}
