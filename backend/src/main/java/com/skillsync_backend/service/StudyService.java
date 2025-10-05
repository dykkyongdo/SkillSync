package com.skillsync_backend.service;

import com.skillsync_backend.dto.DueCardDto;
import com.skillsync_backend.dto.ReviewResultDto;
import com.skillsync_backend.model.Flashcard;
import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.model.ReviewLog;
import com.skillsync_backend.model.User;
import com.skillsync_backend.model.UserCardProgress;
import com.skillsync_backend.repository.FlashcardRepository;
import com.skillsync_backend.repository.ReviewLogRepository;
import com.skillsync_backend.repository.UsedCardProgressRepository;
import com.skillsync_backend.repository.UserRepository;
import com.skillsync_backend.security.AccessGuard;
import com.skillsync_backend.security.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudyService {

    private final UserRepository userRepo;
    private final FlashcardRepository cardRepo;
    private final UsedCardProgressRepository progressRepo;
    private final AccessGuard access;

    // Optional dependency: only used if you added ReviewLog + its repository
    private final Optional<ReviewLogRepository> reviewLogRepo;

    /**
     * Returns up to {limit} due cards for the caller and set.
     * If the user has no progress yet, lazily seeds an initial batch so they have something to review.
     */
    @Transactional // not read-only, because we may seed
    public List<DueCardDto> listDue(UUID setId, String email, int limit) {
        // authz: user must be a member of the set's group
        FlashcardSet set = access.ensureMemberOfSet(setId, email);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User with email " + email + " not found"));

        Instant now = Instant.now();

        // existing due progress
        var dueProgress = progressRepo
                .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, now);

        // seed if empty
        if (dueProgress.isEmpty()) {
            int size = Math.max(10, limit);
            var seedPage = cardRepo.findBySetId(setId, PageRequest.of(0, size));
            var seedCards = seedPage.getContent();

            for (Flashcard fc : seedCards) {
                progressRepo.findByUser_IdAndFlashcard_Id(user.getId(), fc.getId())
                        .orElseGet(() -> progressRepo.save(UserCardProgress.builder()
                                .user(user)
                                .flashcard(fc)
                                .ease(2.5)                  // default ease
                                .repetitions(0)
                                .intervalDays(0)
                                .consecutiveCorrect(0)
                                .mastered(false)
                                .nextDueAt(now.minusSeconds(1)) // due immediately
                                .build()));
            }
            progressRepo.flush();

            // re-fetch after seeding
            dueProgress = progressRepo
                    .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, now);
        }

        return dueProgress.stream()
                .limit(limit)
                .map(p -> DueCardDto.builder()
                        .flashcardId(p.getFlashcard().getId())
                        .question(p.getFlashcard().getQuestion())
                        .answer(p.getFlashcard().getAnswer())
                        .build())
                .toList();
    }

    /**
     * Records a review for a single flashcard (grade: 0..3) and returns the updated scheduling summary.
     */
    @Transactional
    public ReviewResultDto review(UUID setId, UUID flashcardId, int grade, String email) {
        if (grade < 0 || grade > 3) throw new IllegalArgumentException("grade must be between 0 and 3");

        FlashcardSet set = access.ensureMemberOfSet(setId, email);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User with email " + email + " not found"));

        var card = cardRepo.findById(flashcardId)
                .orElseThrow(() -> new NotFoundException("Flashcard with id " + flashcardId + " not found"));
        if (!card.getSet().getId().equals(set.getId())) {
            throw new IllegalArgumentException("Flashcard does not belong to the requested set");
        }

        Instant now = Instant.now();

        var progress = progressRepo.findByUser_IdAndFlashcard_Id(user.getId(), card.getId())
                .orElseGet(() -> progressRepo.save(UserCardProgress.builder()
                        .user(user)
                        .flashcard(card)
                        .ease(2.5)
                        .repetitions(0)
                        .intervalDays(0)
                        .consecutiveCorrect(0)
                        .mastered(false)
                        .nextDueAt(now)
                        .build()));

        // ---- scheduling: SM-2-lite --------------------------------------------------
        double ease = progress.getEase();
        int reps = progress.getRepetitions();
        int interval = progress.getIntervalDays();

        if (grade == 0) {
            // "Again" → reset reps, shrink ease a bit, schedule for soon
            reps = 0;
            ease = Math.max(1.3, ease - 0.2);
            interval = 0;
            progress.setConsecutiveCorrect(0);
        } else {
            // correct → adjust ease depending on grade
            double delta = switch (grade) {
                case 1 -> -0.5;  // hard
                case 2 -> 0.0;   // good
                case 3 -> 0.15;  // easy
                default -> 0.0;
            };
            ease = Math.max(1.0, ease + delta);

            reps += 1;
            if (reps == 1) interval = 1;
            else if (reps == 2) interval = 3;
            else interval = Math.max(1, (int) Math.round(interval * ease));

            // mastery tracking
            progress.setConsecutiveCorrect(progress.getConsecutiveCorrect() + 1);
            if (!progress.isMastered() && progress.getConsecutiveCorrect() >= 3) {
                progress.setMastered(true);
            }
        }

        progress.setEase(ease);
        progress.setRepetitions(reps);
        progress.setIntervalDays(interval);
        progress.setLastReviewedAt(now);
        progress.setNextDueAt(now.plus(interval, ChronoUnit.DAYS));

        // ---- XP + streaks + optional logging ----------------------------------------
        int gained = xpForGrade(grade);
        user.setXp(user.getXp() + gained);
        applyDailyStreak(user, now);
        maybeLevelUp(user);

        reviewLogRepo.ifPresent(repo ->
                repo.save(ReviewLog.builder()
                        .user(user)
                        .group(set.getGroup())
                        .set(set)
                        .card(card)
                        .grade(grade)
                        .xpAwarded(gained)
                        .reviewedAt(now)
                        .build())
        );

        // Response
        return ReviewResultDto.builder()
                .flashcardId(card.getId())
                .grade(grade)
                .newIntervalDays(interval)
                .newEase(ease)
                .newRepetitions(reps)
                .nextDueAt(progress.getNextDueAt())
                .build();
    }

    // ---------------------- helpers ----------------------

    private int xpForGrade(int grade) {
        return switch (grade) {
            case 0 -> 0;  // again
            case 1 -> 3;  // hard
            case 2 -> 5;  // good
            case 3 -> 7;  // easy
            default -> 0;
        };
    }

    private void applyDailyStreak(User user, Instant now) {
        // Streak tracked at UTC day granularity. Adjust if you later store per-user timezone.
        LocalDate today = LocalDate.ofInstant(now, ZoneOffset.UTC);
        LocalDate last = (user.getLastStudyDate() == null)
                ? null
                : LocalDate.ofInstant(user.getLastStudyDate(), ZoneOffset.UTC);

        if (last == null || last.isBefore(today.minusDays(1))) {
            // New or broken streak → start at 1
            user.setStreakCount(1);
        } else if (last.isEqual(today.minusDays(1))) {
            // Continued streak
            user.setStreakCount(user.getStreakCount() + 1);
        }
        // If last == today → already counted; leave as-is

        user.setLastStudyDate(now);
    }

    private void maybeLevelUp(User user) {
        // Simple rule: 500 XP per level
        int needed = user.getLevel() * 500;
        while (user.getXp() >= needed) {
            user.setLevel(user.getLevel() + 1);
            needed = user.getLevel() * 500;
        }
    }
}
