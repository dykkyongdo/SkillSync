package com.skillsync_backend.service;

import com.skillsync_backend.dto.FlashcardDto;
import com.skillsync_backend.dto.FlashcardRequest;
import com.skillsync_backend.model.Flashcard;
import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.repository.FlashcardRepository;
import com.skillsync_backend.repository.FlashcardSetRepository;
import com.skillsync_backend.security.AccessGuard;
import com.skillsync_backend.security.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FlashcardService {

    private final FlashcardRepository flashcardRepo;
    private final FlashcardSetRepository setRepo;
    private final AccessGuard access;

    /** Create a flashcard in a set. Caller must be a member of the owning group. */
    @Transactional
    public FlashcardDto create(FlashcardRequest req, String email) {
        UUID setId = UUID.fromString(req.getSetId());
        FlashcardSet set = access.ensureMemberOfSet(setId, email); // validates membership and loads the set

        Flashcard card = Flashcard.builder()
                .question(req.getQuestion())
                .answer(req.getAnswer())
                .group(set.getGroup())
                .set(set)
                .build();

        Flashcard saved = flashcardRepo.save(card);
        return toDto(saved);
    }

    /** List flashcards for a set. Caller must be a member. */
    @Transactional(readOnly = true)
    public List<FlashcardDto> listBySet(UUID setId, String email) {
        // Ensures set exists and caller is a member of the set’s group
        access.ensureMemberOfSet(setId, email);
        return flashcardRepo.findBySetId(setId).stream().map(this::toDto).toList();
    }

    /** Delete a flashcard. Caller must be a member of the owning group. */
    @Transactional
    public void delete(UUID flashcardId, String email) {
        Flashcard card = flashcardRepo.findById(flashcardId)
                .orElseThrow(() -> new NotFoundException("Flashcard not found"));

        access.ensureMemberOfGroup(card.getGroup().getId(), email);
        flashcardRepo.delete(card);
    }

    /** Map entity -> DTO. */
    private FlashcardDto toDto(Flashcard c) {
        return FlashcardDto.builder()
                .id(c.getId())
                .question(c.getQuestion())
                .answer(c.getAnswer())
                .setId(c.getSet().getId())
                .groupId(c.getGroup().getId())
                .build();
    }
}
