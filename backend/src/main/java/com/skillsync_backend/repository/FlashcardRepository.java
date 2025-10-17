package com.skillsync_backend.repository;

import com.skillsync_backend.model.Flashcard;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    
    // Basic queries
    Page<Flashcard> findBySetId(UUID setId, Pageable pageable);
    long countBySetId(UUID setId);
    
    // Filtering queries
    @Query("SELECT f FROM Flashcard f WHERE f.set.id = :setId AND " +
           "(:minDifficulty IS NULL OR f.difficulty >= :minDifficulty) AND " +
           "(:maxDifficulty IS NULL OR f.difficulty <= :maxDifficulty) AND " +
           "(:searchTerm IS NULL OR LOWER(f.question) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(f.answer) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "(f.explanation IS NOT NULL AND LOWER(f.explanation) LIKE LOWER(CONCAT('%', :searchTerm, '%'))))")
    Page<Flashcard> findBySetIdWithFilters(@Param("setId") UUID setId,
                                           @Param("minDifficulty") Integer minDifficulty,
                                           @Param("maxDifficulty") Integer maxDifficulty,
                                           @Param("searchTerm") String searchTerm,
                                           Pageable pageable);
    
    // Tag-based queries
    @Query("SELECT DISTINCT f FROM Flashcard f JOIN f.tags t WHERE f.set.id = :setId AND t IN :tags")
    Page<Flashcard> findBySetIdAndTagsIn(@Param("setId") UUID setId, 
                                         @Param("tags") List<String> tags, 
                                         Pageable pageable);
    
    // Combined filtering with tags
    @Query("SELECT DISTINCT f FROM Flashcard f JOIN f.tags t WHERE f.set.id = :setId AND " +
           "(:minDifficulty IS NULL OR f.difficulty >= :minDifficulty) AND " +
           "(:maxDifficulty IS NULL OR f.difficulty <= :maxDifficulty) AND " +
           "(:tags IS NULL OR t IN :tags) AND " +
           "(:searchTerm IS NULL OR LOWER(f.question) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(f.answer) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "(f.explanation IS NOT NULL AND LOWER(f.explanation) LIKE LOWER(CONCAT('%', :searchTerm, '%'))))")
    Page<Flashcard> findBySetIdWithAllFilters(@Param("setId") UUID setId,
                                              @Param("minDifficulty") Integer minDifficulty,
                                              @Param("maxDifficulty") Integer maxDifficulty,
                                              @Param("tags") List<String> tags,
                                              @Param("searchTerm") String searchTerm,
                                              Pageable pageable);
    
    // Difficulty-based queries
    Page<Flashcard> findBySetIdAndDifficultyBetween(UUID setId, int minDifficulty, int maxDifficulty, Pageable pageable);
    Page<Flashcard> findBySetIdAndDifficulty(UUID setId, int difficulty, Pageable pageable);
    
    // Search queries
    @Query("SELECT f FROM Flashcard f WHERE f.set.id = :setId AND " +
           "(LOWER(f.question) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(f.answer) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "(f.explanation IS NOT NULL AND LOWER(f.explanation) LIKE LOWER(CONCAT('%', :searchTerm, '%'))))")
    Page<Flashcard> findBySetIdAndSearchTerm(@Param("setId") UUID setId, 
                                             @Param("searchTerm") String searchTerm, 
                                             Pageable pageable);
    
    // Statistics queries
    @Query("SELECT AVG(f.difficulty) FROM Flashcard f WHERE f.set.id = :setId")
    Double getAverageDifficultyBySetId(@Param("setId") UUID setId);
    
    @Query("SELECT f.difficulty, COUNT(f) FROM Flashcard f WHERE f.set.id = :setId GROUP BY f.difficulty")
    List<Object[]> getDifficultyCountsBySetId(@Param("setId") UUID setId);
    
    @Query("SELECT DISTINCT t FROM Flashcard f JOIN f.tags t WHERE f.set.id = :setId ORDER BY t")
    List<String> getAllTagsBySetId(@Param("setId") UUID setId);
    
    // Most used flashcards
    Page<Flashcard> findBySetIdOrderByUsageCountDesc(UUID setId, Pageable pageable);
    
    // Created by user
    Page<Flashcard> findBySetIdAndCreatedBy_Email(UUID setId, String email, Pageable pageable);
}


