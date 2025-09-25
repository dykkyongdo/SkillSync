package com.skillsync_backend.service;

import  com.skillsync_backend.dto.DueCardDto;
import  com.skillsync_backend.dto.ReviewResultDto;
import com.skillsync_backend.model.*;
import com.skillsync_backend.repository.*;
import com.skillsync_backend.security.AccessGuard;
import com.skillsync_backend.security.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyService {

    private final UserRepository userRepo;
    private final FlashcardRepository cardRepo;
    private final UsedCardProgressRepository progressRepo;
    private final AccessGuard access;

    @Transactional
    public List<DueCardDto> listDue(UUID setId, String email, int limit) {
        // authz: must be a member of the set's group
        var set = access.ensureMemberOfSet(setId, email);

        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User with email " + email + " not found"));

        // fetch due progress
        var now = Instant.now();
        var dueProgress = progressRepo
                .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, now);

        // if user has no progress yet (new learner or new cards), lazily seed some
        if (dueProgress.isEmpty()) {
            // get a small batch of cards to start with
            int size = Math.max(10, limit);
            var seedPage = cardRepo.findBySetId(setId, PageRequest.of(0, size));
            var seed = seedPage.getContent();

            for (Flashcard fc : seed) {
                progressRepo.findByUser_IdAndFlashcard_Id(user.getId(), fc.getId())
                        .orElseGet(() -> progressRepo.save(UserCardProgress.builder()
                                .user(user)
                                .flashcard(fc)
                                .ease(2.5)                // default ease
                                .repetitions(0)
                                .intervalDays(0)
                                .nextDueAt(now.minusSeconds(1))           // due immediately
                                .build()));
            }
            progressRepo.flush();

            // re-fetch after seeding
            dueProgress = progressRepo
                    .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, now);
        }

        // map to DueCardDto
        return dueProgress.stream()
                .limit(limit)
                .map(p -> {
                    var fc = p.getFlashcard();
                    return  DueCardDto.builder()
                            .flashcardId(fc.getId())
                            .question(fc.getQuestion())
                            .answer(fc.getAnswer())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResultDto review(UUID setId, UUID flashcardId, int grade, String email) {
        if (grade < 0 || grade > 3) throw new IllegalArgumentException("grade must be between 0 and 3");

        var set = access.ensureMemberOfSet(setId, email);

        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User with email " + email + " not found"));

        var card = cardRepo.findById(flashcardId)
                .orElseThrow(() -> new NotFoundException("Flashcard with id " + flashcardId + " not found"));
        if (!card.getSet().getId().equals(set.getId())) {
            throw new IllegalArgumentException("Flashcard does not belong to set");
        }

        var now = Instant.now();

        var progress = progressRepo.findByUser_IdAndFlashcard_Id(user.getId(), card.getId())
                .orElseGet(() -> progressRepo.save(UserCardProgress.builder()
                        .user(user)
                        .flashcard(card)
                        .ease(2.5)
                        .repetitions(0)
                        .intervalDays(0)
                        .nextDueAt(now)
                        .build()));

        // SM-2 lite update
        double ease = progress.getEase();
        int reps =  progress.getRepetitions();
        int interval =  progress.getIntervalDays();

        if (grade == 0) {
            // "Again" - reset reps, shrink ease slightly, schedule soon
            reps = 0;
            ease = Math.max(1.3, ease - 0.2);
            interval = 0;
        } else {
            // correct: adjust ease upwards depending on grade
            double delta = switch (grade) {
                case 1 -> -0.5;     // hard
                case 2 -> 0.0;      // good
                case 3 -> 0.15;     // easy
                default -> 0;
            };
            ease = Math.max(1.0, ease + delta);
            reps += 1;
            if (reps == 1) interval = 1;
            else if (reps == 2) interval = 3;
            else interval = Math.max(1, (int)Math.round(interval * ease));
        }

        progress.setEase(ease);
        progress.setRepetitions(reps);
        progress.setIntervalDays(interval);
        progress.setLastReviewedAt(now);
        progress.setNextDueAt(now.plus(interval, ChronoUnit.DAYS));

        // JPA dirty tracking will persist

        return ReviewResultDto.builder()
                .flashcardId(card.getId())
                .grade(grade)
                .newIntervalDays(interval)
                .newEase(ease)
                .newRepetitions(reps)
                .nextDueAt(progress.getNextDueAt())
                .build();
    }
}
