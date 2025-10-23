package com.skillsync_backend.service;

import com.skillsync_backend.dto.DueCardDto;
import com.skillsync_backend.dto.ReviewResultDto;
import com.skillsync_backend.dto.StudySubmissionDto;
import com.skillsync_backend.dto.StudyResponseDto;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudyService {

    private final UserRepository userRepo;
    private final FlashcardRepository cardRepo;
    private final UsedCardProgressRepository progressRepo;
    private final AccessGuard access;
    private final ValidationService validationService;
    private final AIFlashcardGenerationService aiService;

    // Optional dependency: only used if you added ReviewLog + its repository
    private final Optional<ReviewLogRepository> reviewLogRepo;

    /**
     * Returns up to {limit} due cards for the caller and set.
     * If the user has no progress yet, lazily seeds an initial batch so they have something to review.
     */
    @Transactional // not read-only, because we may seed
    public List<DueCardDto> listDue(UUID setId, String email, int limit) {
        validationService.validateStudyParameters(limit);
        // authz: user must be a member of the set's group
        access.ensureMemberOfSet(setId, email);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User with email " + email + " not found"));

        Instant now = Instant.now();

        // existing due progress
        var dueProgress = progressRepo
                .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, now);

        // Debug logging removed for production

        // Always ensure we have progress records for all cards in the set
        var allCards = cardRepo.findBySetId(setId, PageRequest.of(0, 100));
        // Debug logging removed for production("Total cards in set: " + allCards.getTotalElements());
        
        // Create progress records for any missing cards
        for (var card : allCards.getContent()) {
            var existingProgress = progressRepo.findByUser_IdAndFlashcard_Id(user.getId(), card.getId());
            if (existingProgress.isEmpty()) {
                try {
                    progressRepo.save(UserCardProgress.builder()
                            .user(user)
                            .flashcard(card)
                            .ease(2.5)
                            .repetitions(0)
                            .intervalDays(0)
                            .consecutiveCorrect(0)
                            .mastered(false)
                            .nextDueAt(now.minusSeconds(1)) // due immediately
                            .build());
                    // Debug logging removed for production("Created progress for card " + card.getId());
                } catch (Exception e) {
                    System.err.println("Failed to create progress for card " + card.getId() + ": " + e.getMessage());
                    // If it's a unique constraint violation, the progress already exists
                    if (e.getMessage().contains("Unique index or primary key violation")) {
                        // Debug logging removed for production("Progress already exists for card " + card.getId() + " (constraint violation)");
                    }
                }
            }
        }
        progressRepo.flush();
        
        // Re-fetch due progress after ensuring all cards have progress records
        dueProgress = progressRepo
                .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, now);
        // Debug logging removed for production("After ensuring progress records, found " + dueProgress.size() + " due cards");
        
        // Debug: Check all progress records for this set
        var allUserProgress = progressRepo.findByUser_IdAndFlashcard_Set_Id(user.getId(), setId);
        // Debug logging removed for production("User has " + allUserProgress.size() + " total progress records for this set");
        
        // Debug: Check next due dates
        for (var progress : allUserProgress) {
            // Debug logging removed for production("Card " + progress.getFlashcard().getId() + " next due: " + progress.getNextDueAt() + " (now: " + now + ")");
        }
        
        // If we have very few due cards, expand the search to include cards due soon
        if (dueProgress.size() < Math.min(5, limit)) {
            Instant soonDue = now.plus(1, ChronoUnit.HOURS); // Include cards due within 1 hour
            var soonDueProgress = progressRepo
                    .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, soonDue);
            
            // Debug logging removed for production("Expanded search found " + soonDueProgress.size() + " cards due within 1 hour");
            
            // Use the expanded list if it has more cards
            if (soonDueProgress.size() > dueProgress.size()) {
                dueProgress = soonDueProgress;
                // Debug logging removed for production("Using expanded due cards list");
            }
        }
        
        // seed if empty
        if (dueProgress.isEmpty()) {
            int size = Math.max(10, limit);
            var seedPage = cardRepo.findBySetId(setId, PageRequest.of(0, size));
            var seedCards = seedPage.getContent();

            // Debug logging removed for production("Found " + seedCards.size() + " cards in set " + setId + " for user " + user.getId());
            // Debug logging removed for production("Total cards in set: " + seedPage.getTotalElements());
            
            // Log each card for debugging
            for (int i = 0; i < seedCards.size(); i++) {
                var card = seedCards.get(i);
                // Debug logging removed for production("Card " + (i + 1) + ": " + card.getId() + " - " + card.getQuestion().substring(0, Math.min(50, card.getQuestion().length())) + "...");
            }

            int createdCount = 0;
            int existingCount = 0;
            for (Flashcard fc : seedCards) {
                var existingProgress = progressRepo.findByUser_IdAndFlashcard_Id(user.getId(), fc.getId());
                if (existingProgress.isEmpty()) {
                    try {
                        var newProgress = progressRepo.save(UserCardProgress.builder()
                                .user(user)
                                .flashcard(fc)
                                .ease(2.5)                  // default ease
                                .repetitions(0)
                                .intervalDays(0)
                                .consecutiveCorrect(0)
                                .mastered(false)
                                .nextDueAt(now.minusSeconds(1)) // due immediately
                                .build());
                        // Debug logging removed for production("Created progress for card " + fc.getId() + " with nextDueAt " + newProgress.getNextDueAt());
                        createdCount++;
                    } catch (Exception e) {
                        System.err.println("Failed to create progress for card " + fc.getId() + ": " + e.getMessage());
                        // If it's a unique constraint violation, the progress already exists
                        if (e.getMessage().contains("Unique index or primary key violation")) {
                            // Debug logging removed for production("Progress already exists for card " + fc.getId() + " (constraint violation)");
                            existingCount++;
                        } else {
                            e.printStackTrace();
                        }
                    }
                } else {
                    // Debug logging removed for production("Progress already exists for card " + fc.getId());
                    existingCount++;
                }
            }
            // Debug logging removed for production("Seeding complete: " + createdCount + " created, " + existingCount + " already existed");
            progressRepo.flush();

            // re-fetch after seeding
            dueProgress = progressRepo
                    .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, now);
            
            // Debug logging removed for production("After seeding, found " + dueProgress.size() + " due cards");
            
            // If we still don't have enough due cards, force create them
            if (dueProgress.size() < Math.min(seedCards.size(), limit)) {
                // Debug logging removed for production("Not enough due cards after seeding, force creating progress for all cards...");
                for (Flashcard fc : seedCards) {
                    try {
                        // Delete existing progress if any and flush immediately
                        progressRepo.findByUser_IdAndFlashcard_Id(user.getId(), fc.getId())
                                .ifPresent(existingProgress -> {
                                    progressRepo.delete(existingProgress);
                                    progressRepo.flush(); // Flush delete before insert
                                });
                        
                        // Create new progress
                        progressRepo.save(UserCardProgress.builder()
                                .user(user)
                                .flashcard(fc)
                                .ease(2.5)
                                .repetitions(0)
                                .intervalDays(0)
                                .consecutiveCorrect(0)
                                .mastered(false)
                                .nextDueAt(now.minusSeconds(1))
                                .build());
                        // Debug logging removed for production("Force created progress for card " + fc.getId());
                    } catch (Exception e) {
                        System.err.println("Failed to force create progress for card " + fc.getId() + ": " + e.getMessage());
                    }
                }
                progressRepo.flush();
                
                // Re-fetch one more time
                dueProgress = progressRepo
                        .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, now);
                // Debug logging removed for production("After force seeding, found " + dueProgress.size() + " due cards");
            }
        } else {
            // Check if there are any progress records at all for this user and set
            var existingProgress = progressRepo.findByUser_IdAndFlashcard_Set_Id(user.getId(), setId);
            // Debug logging removed for production("User has " + existingProgress.size() + " total progress records for this set");
            
            // If we have progress records but none are due, let's make some due
            if (existingProgress.size() > 0 && dueProgress.isEmpty()) {
                // Debug logging removed for production("Making some cards due for immediate study...");
                var cardsToMakeDue = existingProgress.stream()
                        .limit(limit)
                        .toList();
                
                for (var progress : cardsToMakeDue) {
                    progress.setNextDueAt(now.minusSeconds(1));
                    progressRepo.save(progress);
                    // Debug logging removed for production("Made card " + progress.getFlashcard().getId() + " due for immediate study");
                }
                
                // Re-fetch due progress
                dueProgress = progressRepo
                        .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, now);
                // Debug logging removed for production("After making cards due, found " + dueProgress.size() + " due cards");
            }
        }

        var result = dueProgress.stream()
                .limit(limit)
                .map(p -> {
                    // Increment usage count when card is shown for study
                    p.getFlashcard().incrementUsage();
                    cardRepo.save(p.getFlashcard());
                    
                    var card = p.getFlashcard();
                    // Ensure all cards have multiple choice options
                    List<String> options = card.getOptions();
                    Integer correctIndex = card.getCorrectOptionIndex();
                    
                    // If no options exist, generate them using AI
                    if (options == null || options.isEmpty()) {
                        try {
                            // Try to determine topic from set title or tags
                            String topic = card.getSet().getTitle();
                            if (card.getTags() != null && !card.getTags().isEmpty()) {
                                topic = String.join(", ", card.getTags());
                            }
                            
                            options = aiService.generateMultipleChoiceOptions(
                                card.getQuestion(), 
                                card.getAnswer(), 
                                topic
                            );
                            
                            // Ensure the correct answer is in the options and find its index
                            correctIndex = ensureCorrectAnswerInOptions(options, card.getAnswer());
                            
                            // Save the generated options back to the card
                            card.setOptions(options);
                            card.setCorrectOptionIndex(correctIndex);
                            card.setQuestionType(Flashcard.QuestionType.MULTIPLE_CHOICE);
                            cardRepo.save(card);
                            
                            log.info("Generated AI options for card: {} with correct index: {}", card.getId(), correctIndex);
                            log.info("Options: {}", options);
                            log.info("Correct answer: '{}'", card.getAnswer());
                        } catch (Exception e) {
                            log.error("Failed to generate AI options for card: {}", card.getId(), e);
                            // Fallback to simple options
                            options = Arrays.asList(
                                card.getAnswer(),
                                "Incorrect option 1",
                                "Incorrect option 2", 
                                "Incorrect option 3"
                            );
                            correctIndex = 0;
                            
                            // Save the fallback options back to the card
                            card.setOptions(options);
                            card.setCorrectOptionIndex(correctIndex);
                            card.setQuestionType(Flashcard.QuestionType.MULTIPLE_CHOICE);
                            cardRepo.save(card);
                        }
                    }
                    
                    var dto = DueCardDto.builder()
                            .flashcardId(card.getId())
                            .question(card.getQuestion())
                            .answer(card.getAnswer())
                            .explanation(card.getExplanation())
                            .difficulty(card.getDifficulty())
                            .tags(card.getTags() != null ? card.getTags() : new ArrayList<>())
                            .questionType("MULTIPLE_CHOICE")
                            .options(options)
                            .correctOptionIndex(correctIndex)
                            .build();
                    
                    return dto;
                })
                .toList();
        
        // Debug logging removed for production("Returning " + result.size() + " due cards (limit: " + limit + ")");
        // Debug logging removed for production
        return result;
    }

    /**
     * Handles study submission with automatic difficulty calculation based on performance
     */
    @Transactional
    public StudyResponseDto submitStudy(UUID setId, UUID flashcardId, StudySubmissionDto submission, String email) {
        validationService.validateStudyParameters(1); // Basic validation

        FlashcardSet set = access.ensureMemberOfSet(setId, email);

        var card = cardRepo.findById(flashcardId)
                .orElseThrow(() -> new NotFoundException("Flashcard with id " + flashcardId + " not found"));
        if (!card.getSet().getId().equals(set.getId())) {
            throw new IllegalArgumentException("Flashcard does not belong to the requested set");
        }

        // Ensure the card is properly configured for multiple choice
        if (card.getQuestionType() != Flashcard.QuestionType.MULTIPLE_CHOICE) {
            log.warn("Card {} has questionType {} but should be MULTIPLE_CHOICE, fixing...", 
                    card.getId(), card.getQuestionType());
            card.setQuestionType(Flashcard.QuestionType.MULTIPLE_CHOICE);
        }
        
        // Ensure the card has options and correct index
        if (card.getOptions() == null || card.getOptions().isEmpty() || card.getCorrectOptionIndex() == null) {
            log.warn("Card {} missing options or correct index, generating...", card.getId());
            try {
                String topic = card.getSet().getTitle();
                if (card.getTags() != null && !card.getTags().isEmpty()) {
                    topic = String.join(", ", card.getTags());
                }
                
                List<String> options = aiService.generateMultipleChoiceOptions(
                    card.getQuestion(), 
                    card.getAnswer(), 
                    topic
                );
                
                int correctIndex = ensureCorrectAnswerInOptions(options, card.getAnswer());
                
                card.setOptions(options);
                card.setCorrectOptionIndex(correctIndex);
                card.setQuestionType(Flashcard.QuestionType.MULTIPLE_CHOICE);
                cardRepo.save(card);
                
                log.info("Fixed card {} with options: {} and correct index: {}", 
                        card.getId(), options, correctIndex);
            } catch (Exception e) {
                log.error("Failed to generate options for card: {}", card.getId(), e);
                // Fallback
                List<String> fallbackOptions = Arrays.asList(
                    card.getAnswer(),
                    "Incorrect option 1",
                    "Incorrect option 2", 
                    "Incorrect option 3"
                );
                card.setOptions(fallbackOptions);
                card.setCorrectOptionIndex(0);
                card.setQuestionType(Flashcard.QuestionType.MULTIPLE_CHOICE);
                cardRepo.save(card);
            }
        }

        // All questions are now multiple choice
        boolean isCorrect = card.isCorrectAnswer(submission.getSelectedOptionIndex());
        
        log.info("Study submission - Card: {}, Selected index: {}, Correct index: {}, Is correct: {}", 
                card.getId(), submission.getSelectedOptionIndex(), card.getCorrectOptionIndex(), isCorrect);
        log.info("Card options: {}", card.getOptions());
        log.info("Card answer: '{}'", card.getAnswer());
        log.info("Card questionType: {}", card.getQuestionType());
        log.info("Card isMultipleChoice(): {}", card.isMultipleChoice());
        
        String feedback;
        if (isCorrect) {
            feedback = "Correct! 🎉";
        } else {
            feedback = "Incorrect. The correct answer is: " + card.getCorrectAnswerText();
        }

        // Calculate grade based on correctness and response time
        int grade = calculateGrade(isCorrect, submission.getResponseTimeMs(), card.getDifficulty());
        
        // Update difficulty based on performance
        updateCardDifficulty(card, isCorrect, submission.getResponseTimeMs());
        
        // Process the review with calculated grade
        review(setId, flashcardId, grade, email);

        // Build response - all questions are now multiple choice
        return StudyResponseDto.builder()
                .flashcardId(card.getId())
                .question(card.getQuestion())
                .answer(card.getAnswer())
                .explanation(card.getExplanation())
                .difficulty(card.getDifficulty())
                .tags(card.getTags() != null ? card.getTags() : new ArrayList<>())
                .questionType(card.getQuestionType().toString())
                .options(card.getOptions())
                .correctOptionIndex(card.getCorrectOptionIndex())
                .selectedOptionIndex(submission.getSelectedOptionIndex())
                .isCorrect(isCorrect)
                .feedback(feedback)
                .build();
    }

    /**
     * Records a review for a single flashcard (grade: 0..3) and returns the updated scheduling summary.
     */
    @Transactional
    public ReviewResultDto review(UUID setId, UUID flashcardId, int grade, String email) {
        validationService.validateReviewGrade(grade);

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
        int gained = xpForGrade(grade, card.getDifficulty());
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

    private int xpForGrade(int grade, int difficulty) {
        int baseXp = switch (grade) {
            case 0 -> 0;  // again
            case 1 -> 5;  // hard
            case 2 -> 6;  // good
            case 3 -> 7;  // easy
            default -> 0;
        };
        
        // Apply difficulty multiplier
        double multiplier = switch (difficulty) {
            case 1, 2 -> 1.0;      // Beginner/Easy: 5-7 XP
            case 3 -> 1.5;         // Medium: 7.5-10.5 XP
            case 4, 5 -> 2.0;      // Hard/Expert: 10-14 XP
            default -> 1.0;
        };
        
        return (int) Math.round(baseXp * multiplier);
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
        // Level 1 needs 500 XP to reach Level 2
        // Level 2 needs 1000 XP to reach Level 3
        int currentLevel = user.getLevel();
        int xpForNextLevel = (currentLevel + 1) * 500;
        
        while (user.getXp() >= xpForNextLevel) {
            user.setLevel(user.getLevel() + 1);
            currentLevel = user.getLevel();
            xpForNextLevel = (currentLevel + 1) * 500;
        }
    }
    
    private void correctUserLevel(User user) {
        // Force-correct user's level based on their XP
        // Level 1: 0-499 XP
        // Level 2: 500-999 XP
        // Level 3: 1000-1499 XP
        int correctLevel = (user.getXp() / 500) + 1;
        if (user.getXp() == 0) correctLevel = 1; // Special case for 0 XP
        
        // Debug logging removed for production
        
        if (user.getLevel() != correctLevel) {
            user.setLevel(correctLevel);
            // Debug logging removed for production("DEBUG - Level corrected from " + (correctLevel - 1) + " to " + correctLevel);
        }
    }

    /**
     * Debug method to get information about a set and user's progress
     */
    public Map<String, Object> debugInfo(UUID setId, String email) {
        var debugInfo = new HashMap<String, Object>();
        
        try {
            // Get user
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new NotFoundException("User not found"));
            
            // Check if set exists and user has access
            access.ensureMemberOfSet(setId, email);
            
            // Get all cards in the set
            var allCards = cardRepo.findBySetId(setId, PageRequest.of(0, 100));
            debugInfo.put("totalCardsInSet", allCards.getTotalElements());
            debugInfo.put("cardsInSet", allCards.getContent().size());
            
            // Get all progress records for this user and set
            var allProgress = progressRepo.findByUser_IdAndFlashcard_Set_Id(user.getId(), setId);
            debugInfo.put("totalProgressRecords", allProgress.size());
            
            // Get due progress records
            Instant now = Instant.now();
            var dueProgress = progressRepo
                    .findByUser_IdAndFlashcard_Set_IdAndNextDueAtLessThanEqualOrderByNextDueAtAsc(user.getId(), setId, now);
            debugInfo.put("dueProgressRecords", dueProgress.size());
            
            // Add details about each progress record
            var progressDetails = new HashMap<String, Object>();
            for (var progress : allProgress) {
                var cardInfo = new HashMap<String, Object>();
                cardInfo.put("cardId", progress.getFlashcard().getId());
                cardInfo.put("question", progress.getFlashcard().getQuestion());
                cardInfo.put("nextDueAt", progress.getNextDueAt());
                cardInfo.put("isDue", progress.getNextDueAt().isBefore(now) || progress.getNextDueAt().equals(now));
                cardInfo.put("repetitions", progress.getRepetitions());
                cardInfo.put("mastered", progress.isMastered());
                progressDetails.put(progress.getFlashcard().getId().toString(), cardInfo);
            }
            debugInfo.put("progressDetails", progressDetails);
            
            // Add details about cards in set
            var cardDetails = new HashMap<String, Object>();
            for (var card : allCards.getContent()) {
                var cardInfo = new HashMap<String, Object>();
                cardInfo.put("cardId", card.getId());
                cardInfo.put("question", card.getQuestion());
                cardInfo.put("answer", card.getAnswer());
                cardDetails.put(card.getId().toString(), cardInfo);
            }
            debugInfo.put("cardDetails", cardDetails);
            
        } catch (Exception e) {
            debugInfo.put("error", e.getMessage());
            debugInfo.put("errorType", e.getClass().getSimpleName());
        }
        
        return debugInfo;
    }

    /**
     * Get user statistics for display
     */
    public Map<String, Object> getUserStats(String email) {
        var stats = new HashMap<String, Object>();
        
        try {
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new NotFoundException("User not found"));
            
            // Basic stats
            stats.put("xp", user.getXp());
            stats.put("level", user.getLevel());
            stats.put("streakCount", user.getStreakCount());
            stats.put("lastStudyDate", user.getLastStudyDate());
            
            // Ensure user's level is correct based on their XP
            correctUserLevel(user);
            // Save the user to persist level changes
            userRepo.save(user);
            
            // Debug logging
            // Debug logging removed for production("DEBUG - User XP: " + user.getXp() + ", Level: " + user.getLevel());
            
            // Calculate level progress
            // Level 1: 0-499 XP (needs 500 XP to reach Level 2)
            // Level 2: 500-999 XP (needs 1000 XP to reach Level 3)
            int currentLevel = user.getLevel();
            int currentLevelXp = (currentLevel - 1) * 500;  // XP threshold for current level (Level 1 = 0, Level 2 = 500)
            int nextLevelXp = currentLevel * 500;  // XP threshold for next level (Level 2 = 500, Level 3 = 1000)
            int progressInLevel = Math.max(0, user.getXp() - currentLevelXp);
            int xpNeededForNextLevel = Math.max(0, nextLevelXp - user.getXp());
            int progressPercentage = nextLevelXp > currentLevelXp ? 
                (int) ((double) progressInLevel / (nextLevelXp - currentLevelXp) * 100) : 100;
            
            // Debug logging removed for production
            
            stats.put("progressInLevel", progressInLevel);
            stats.put("xpNeededForNextLevel", xpNeededForNextLevel);
            stats.put("progressPercentage", progressPercentage);
            
            // Get total mastered cards
            int masteredCards = progressRepo.countByUser_IdAndMasteredTrue(user.getId());
            stats.put("masteredCards", masteredCards);
            
            // Get total due cards today
            Instant now = Instant.now();
            int dueToday = progressRepo.countDueByUserForToday(user.getId(), now);
            stats.put("dueToday", dueToday);
            
        } catch (Exception e) {
            stats.put("error", e.getMessage());
        }
        
        return stats;
    }

    /**
     * Get daily XP data for the last 7 days
     */
    public List<Map<String, Object>> getDailyXpData(String email) {
        var dailyXpData = new ArrayList<Map<String, Object>>();
        
        try {
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new NotFoundException("User not found"));
            
            // Use Vancouver timezone (PST/PDT)
            ZoneId vancouverZone = ZoneId.of("America/Vancouver");
            LocalDate today = LocalDate.now(vancouverZone);
            
            // Get XP data from review logs for the last 7 days
            if (reviewLogRepo.isPresent()) {
                Instant sevenDaysAgo = today.minusDays(6).atStartOfDay(vancouverZone).toInstant();
                var reviewLogs = reviewLogRepo.get().findByUser_IdAndReviewedAtAfterOrderByReviewedAtAsc(user.getId(), sevenDaysAgo);
                
                // Group by date and sum XP
                var xpByDate = new HashMap<LocalDate, Integer>();
                for (var log : reviewLogs) {
                    LocalDate date = LocalDate.ofInstant(log.getReviewedAt(), vancouverZone);
                    xpByDate.merge(date, log.getXpAwarded(), Integer::sum);
                }
                
                // Create data for the last 7 days
                for (int i = 6; i >= 0; i--) {
                    LocalDate date = today.minusDays(i);
                    int xp = xpByDate.getOrDefault(date, 0);
                    
                    var dayData = new HashMap<String, Object>();
                    dayData.put("date", date.toString());
                    dayData.put("xp", xp);
                    dayData.put("day", date.getDayOfWeek().toString().substring(0, 3)); // Mon, Tue, etc.
                    dailyXpData.add(dayData);
                }
            } else {
                // If no review logs, return empty data for the last 7 days
                for (int i = 6; i >= 0; i--) {
                    LocalDate date = today.minusDays(i);
                    var dayData = new HashMap<String, Object>();
                    dayData.put("date", date.toString());
                    dayData.put("xp", 0);
                    dayData.put("day", date.getDayOfWeek().toString().substring(0, 3));
                    dailyXpData.add(dayData);
                }
            }
            
        } catch (Exception e) {
            // Return empty data on error
            ZoneId vancouverZone = ZoneId.of("America/Vancouver");
            LocalDate today = LocalDate.now(vancouverZone);
            for (int i = 6; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                var dayData = new HashMap<String, Object>();
                dayData.put("date", date.toString());
                dayData.put("xp", 0);
                dayData.put("day", date.getDayOfWeek().toString().substring(0, 3));
                dailyXpData.add(dayData);
            }
        }
        
        return dailyXpData;
    }

    /**
     * Get recent activity for the user
     */
    public List<Map<String, Object>> getRecentActivity(String email) {
        var activities = new ArrayList<Map<String, Object>>();
        
        try {
            User user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new NotFoundException("User not found"));
            
            // Get recent review logs for activity (last 10 items)
            if (reviewLogRepo.isPresent()) {
                Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
                var recentLogs = reviewLogRepo.get().findByUser_IdAndReviewedAtAfterOrderByReviewedAtDesc(user.getId(), sevenDaysAgo)
                    .stream()
                    .limit(10)
                    .toList();
                
                for (var log : recentLogs) {
                    var activity = new HashMap<String, Object>();
                    
                    // Format the activity text
                    String action = switch (log.getGrade()) {
                        case 0 -> "Reviewed";
                        case 1 -> "Reviewed (Hard)";
                        case 2 -> "Reviewed (Good)";
                        case 3 -> "Mastered";
                        default -> "Reviewed";
                    };
                    
                    String setTitle = log.getSet().getTitle();
                    String groupName = log.getGroup().getName();
                    
                    activity.put("id", log.getId().toString());
                    activity.put("text", String.format("%s card in \"%s\" from %s", action, setTitle, groupName));
                    activity.put("when", formatTimeAgo(log.getReviewedAt()));
                    activity.put("xp", log.getXpAwarded());
                    activity.put("reviewedAt", log.getReviewedAt());
                    
                    activities.add(activity);
                }
            }
            
            // If no activities, add some placeholder data
            if (activities.isEmpty()) {
                var placeholder1 = new HashMap<String, Object>();
                placeholder1.put("id", "placeholder1");
                placeholder1.put("text", "Welcome to SkillSync! Start studying to see your activity here.");
                placeholder1.put("when", "Just now");
                placeholder1.put("xp", 0);
                activities.add(placeholder1);
            }
            
        } catch (Exception e) {
            // Return placeholder data on error
            var placeholder = new HashMap<String, Object>();
            placeholder.put("id", "error");
            placeholder.put("text", "Unable to load recent activity");
            placeholder.put("when", "Just now");
            placeholder.put("xp", 0);
            activities.add(placeholder);
        }
        
        return activities;
    }

    private String formatTimeAgo(Instant time) {
        Instant now = Instant.now();
        long seconds = ChronoUnit.SECONDS.between(time, now);
        
        if (seconds < 60) {
            return "Just now";
        } else if (seconds < 3600) {
            long minutes = seconds / 60;
            return minutes == 1 ? "1 minute ago" : minutes + " minutes ago";
        } else if (seconds < 86400) {
            long hours = seconds / 3600;
            return hours == 1 ? "1 hour ago" : hours + " hours ago";
        } else {
            long days = seconds / 86400;
            if (days == 1) {
                return "Yesterday";
            } else if (days < 7) {
                return days + " days ago";
            } else {
                return "Over a week ago";
            }
        }
    }

    /**
     * Calculate grade (0-3) based on correctness, response time, and card difficulty
     */
    private int calculateGrade(boolean isCorrect, long responseTimeMs, int cardDifficulty) {
        if (!isCorrect) {
            return 0; // Again
        }

        // Calculate expected response time based on difficulty
        // Higher difficulty = more time expected
        long expectedTimeMs = switch (cardDifficulty) {
            case 1 -> 5000;  // 5 seconds for beginner
            case 2 -> 8000;  // 8 seconds for easy
            case 3 -> 12000; // 12 seconds for medium
            case 4 -> 15000; // 15 seconds for hard
            case 5 -> 20000; // 20 seconds for expert
            default -> 10000;
        };

        // Calculate performance ratio (lower is better)
        double performanceRatio = (double) responseTimeMs / expectedTimeMs;

        if (performanceRatio <= 0.5) {
            return 3; // Easy - answered very quickly
        } else if (performanceRatio <= 0.8) {
            return 2; // Good - answered reasonably quickly
        } else if (performanceRatio <= 1.2) {
            return 2; // Good - answered in expected time
        } else {
            return 1; // Hard - took longer than expected
        }
    }

    /**
     * Ensure the correct answer is in the options and return its index
     */
    private int ensureCorrectAnswerInOptions(List<String> options, String correctAnswer) {
        // First, try exact match
        int exactIndex = options.indexOf(correctAnswer);
        if (exactIndex != -1) {
            return exactIndex;
        }
        
        // Try case-insensitive match
        for (int i = 0; i < options.size(); i++) {
            if (options.get(i).equalsIgnoreCase(correctAnswer)) {
                // Replace with exact answer
                options.set(i, correctAnswer);
                return i;
            }
        }
        
        // Try trimmed match
        String trimmedAnswer = correctAnswer.trim();
        for (int i = 0; i < options.size(); i++) {
            if (options.get(i).trim().equalsIgnoreCase(trimmedAnswer)) {
                // Replace with exact answer
                options.set(i, correctAnswer);
                return i;
            }
        }
        
        // If no match found, replace the first option with the correct answer
        log.warn("Correct answer '{}' not found in AI options, replacing first option", correctAnswer);
        options.set(0, correctAnswer);
        return 0;
    }

    /**
     * Update card difficulty based on user performance
     */
    private void updateCardDifficulty(Flashcard card, boolean isCorrect, long responseTimeMs) {
        int currentDifficulty = card.getDifficulty();
        int newDifficulty = currentDifficulty;

        if (isCorrect) {
            // If answered correctly and quickly, increase difficulty
            long expectedTimeMs = switch (currentDifficulty) {
                case 1 -> 5000;
                case 2 -> 8000;
                case 3 -> 12000;
                case 4 -> 15000;
                case 5 -> 20000;
                default -> 10000;
            };

            if (responseTimeMs < expectedTimeMs * 0.7) {
                // Answered much faster than expected - increase difficulty
                newDifficulty = Math.min(5, currentDifficulty + 1);
            } else if (responseTimeMs > expectedTimeMs * 1.5) {
                // Answered much slower than expected - decrease difficulty
                newDifficulty = Math.max(1, currentDifficulty - 1);
            }
        } else {
            // If answered incorrectly, decrease difficulty
            newDifficulty = Math.max(1, currentDifficulty - 1);
        }

        if (newDifficulty != currentDifficulty) {
            card.setDifficulty(newDifficulty);
            cardRepo.save(card);
        }
    }
}
