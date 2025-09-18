package com.skillsync_backend.service;

import com.skillsync_backend.model.Flashcard;
import com.skillsync_backend.dto.FlashcardRequest;
import com.skillsync_backend.model.FlashcardSet;
import com.skillsync_backend.repository.FlashcardRepository;
import com.skillsync_backend.repository.FlashcardSetRepository;
import lombok.RequiredArgsConstructor;
import  org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FlashcardService {

    private final FlashcardRepository flashcardRepo;
    private final FlashcardSetRepository setRepo;

    public Flashcard create(FlashcardRequest req) {
        FlashcardSet set = setRepo.findById(UUID.fromString(req.getSetId()))
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));

        Flashcard card = Flashcard.builder()
                .question(req.getQuestion())
                .answer(req.getAnswer())
                .group(set.getGroup())
                .set(set)
                .build();

        return flashcardRepo.save(card);
    }

    public List<Flashcard> listBySet(UUID setId) {
        FlashcardSet set = setRepo .findById(setId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found"));

        return flashcardRepo.findByGroup(set.getGroup())
                .stream()
                .filter(c -> c.getSet() != null && c.getSet().getId().equals(setId))
                .toList();
    }

    public void delete(UUID flashcardId) {
        flashcardRepo.deleteById(flashcardId);
    }
}
