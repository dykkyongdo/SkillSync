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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FlashcardService {

    private final FlashcardRepository flashcardRepo;
    private final FlashcardSetRepository setRepo;
    private final AccessGuard access;
    private final ValidationService validationService;

    /** Create a flashcard in a set. Caller must be a member of the owning group. */
    public FlashcardDto create(FlashcardRequest req, String email) {
        UUID setId = UUID.fromString(req.getSetId());
        FlashcardSet set = access.ensureMemberOfSet(setId, email); // validates membership and loads the set
        
        // Validate content quality
        validationService.validateFlashcardContent(req.getQuestion(), req.getAnswer());

        Flashcard card = Flashcard.builder()
                .question(req.getQuestion())
                .answer(req.getAnswer())
                .group(set.getGroup())
                .set(set)
                .build();

        return toDto(flashcardRepo.save(card));
    }

    public Page<FlashcardDto> listBySet(UUID setId, String email, Pageable pageable) {
        // Ensures set exists and caller is a member of the set’s group
        access.ensureMemberOfSet(setId, email);
        return flashcardRepo.findBySetId(setId, pageable).map(this::toDto);
    }

    /** Delete a flashcard. Caller must be a member of the owning group. */
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
