package com.skillsync_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillsync_backend.dto.FlashcardRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIFlashcardGenerationService {

    @Value("${ai.openai.api-key:}")
    private String openaiApiKey;

    @Value("${ai.openai.base-url:https://api.openai.com/v1}")
    private String openaiBaseUrl;

    @Value("${ai.openai.model:gpt-3.5-turbo}")
    private String openaiModel;

    private final RestTemplate restTemplate;
    
    public AIFlashcardGenerationService() {
        this.restTemplate = new RestTemplate();
        // Set timeout to prevent hanging requests
        this.restTemplate.getRequestFactory().setConnectTimeout(10000); // 10 seconds
        this.restTemplate.getRequestFactory().setReadTimeout(30000); // 30 seconds
    }
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate flashcards for a specific topic
     */
    public List<FlashcardRequest> generateFlashcards(String topic, int count, String difficulty, String setId) {
        log.info("Generating {} flashcards for topic: {} with difficulty: {}", count, topic, difficulty);

        // Retry logic for OpenAI API calls
        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                String prompt = buildPrompt(topic, count, difficulty);
                String response = callOpenAI(prompt);
                return parseResponse(response, setId);
            } catch (Exception e) {
                log.warn("Attempt {} failed for topic: {} - {}", attempt, topic, e.getMessage());
                if (attempt == maxRetries) {
                    log.error("All attempts failed for topic: {}, using fallback", topic);
                    return generateFallbackFlashcards(topic, count, setId);
                }
                // Wait before retry (exponential backoff)
                try {
                    Thread.sleep(1000 * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        return generateFallbackFlashcards(topic, count, setId);
    }

    /**
     * Build the prompt for AI generation
     */
    private String buildPrompt(String topic, int count, String difficulty) {
        return String.format("""
            Generate %d flashcards about "%s" with %s difficulty level.
            
            IMPORTANT: Create MULTIPLE CHOICE questions with 2-4 answer options each.
            
            For each flashcard, provide:
            - A clear, concise question
            - 2-4 answer options (one correct, others plausible but incorrect)
            - The correct answer text
            - The index of the correct answer (0-based)
            - A brief explanation (1-2 sentences)
            - Appropriate difficulty level (1-5)
            - Relevant tags (2-4 tags per card)
            
            Format your response as a JSON array with this exact structure:
            [
                {
                    "question": "What is...?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "The correct answer text",
                    "correctOptionIndex": 1,
                    "explanation": "This is important because...",
                    "difficulty": 3,
                    "tags": ["tag1", "tag2", "tag3"]
                }
            ]
            
            Make sure the questions are educational, clear, and test different aspects of the topic.
            For %s difficulty, focus on %s concepts.
            Create plausible but incorrect options that test understanding, not just memorization.
            """, 
            count, 
            topic, 
            difficulty,
            difficulty,
            getDifficultyGuidance(difficulty)
        );
    }

    /**
     * Get difficulty-specific guidance
     */
    private String getDifficultyGuidance(String difficulty) {
        return switch (difficulty.toLowerCase()) {
            case "beginner" -> "basic, fundamental concepts";
            case "easy" -> "introductory and straightforward concepts";
            case "medium" -> "intermediate concepts with some complexity";
            case "hard" -> "advanced and complex concepts";
            case "expert" -> "highly specialized and expert-level concepts";
            default -> "well-rounded concepts of varying complexity";
        };
    }

    /**
     * Call OpenAI API
     */
    private String callOpenAI(String prompt) {
        if (openaiApiKey == null || openaiApiKey.isEmpty()) {
            log.warn("OpenAI API key not configured, using fallback generation");
            throw new RuntimeException("OpenAI API key not configured");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openaiModel);
            requestBody.put("messages", Arrays.asList(
                Map.of("role", "user", "content", prompt)
            ));
            requestBody.put("max_tokens", 2000);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            String url = openaiBaseUrl + "/chat/completions";
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage());
            if (e.getMessage().contains("timeout") || e.getMessage().contains("Connection")) {
                throw new RuntimeException("OpenAI API timeout or connection error: " + e.getMessage());
            } else if (e.getMessage().contains("rate limit") || e.getMessage().contains("429")) {
                throw new RuntimeException("OpenAI API rate limit exceeded: " + e.getMessage());
            } else {
                throw new RuntimeException("OpenAI API error: " + e.getMessage());
            }
        }
    }

    /**
     * Parse AI response into FlashcardRequest objects
     */
    @SuppressWarnings("unchecked")
    private List<FlashcardRequest> parseResponse(String response, String setId) {
        try {
            // Clean the response to extract JSON
            String jsonContent = extractJsonFromResponse(response);
            
            List<Map<String, Object>> flashcards = objectMapper.readValue(jsonContent, List.class);
            
            return flashcards.stream()
                .map(flashcard -> {
                    FlashcardRequest request = new FlashcardRequest();
                    request.setQuestion((String) flashcard.get("question"));
                    
                    // All questions are now multiple choice
                    List<String> options = (List<String>) flashcard.get("options");
                    if (options != null && !options.isEmpty()) {
                        // Multiple choice question
                        request.setAnswer((String) flashcard.get("correctAnswer"));
                        request.setOptions(options);
                        request.setCorrectOptionIndex((Integer) flashcard.get("correctOptionIndex"));
                        request.setQuestionType("MULTIPLE_CHOICE");
                    } else {
                        // If no options provided, create a simple multiple choice question
                        String answer = (String) flashcard.get("answer");
                        List<String> defaultOptions = Arrays.asList(answer, "Incorrect option 1", "Incorrect option 2", "Incorrect option 3");
                        request.setAnswer(answer);
                        request.setOptions(defaultOptions);
                        request.setCorrectOptionIndex(0);
                        request.setQuestionType("MULTIPLE_CHOICE");
                    }
                    
                    request.setExplanation((String) flashcard.get("explanation"));
                    request.setDifficulty((Integer) flashcard.get("difficulty"));
                    
                    List<String> tags = (List<String>) flashcard.get("tags");
                    request.setTags(tags != null ? tags : new ArrayList<>());
                    request.setSetId(setId);
                    
                    return request;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error parsing AI response", e);
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage());
        }
    }

    /**
     * Extract JSON from AI response (handle markdown formatting)
     */
    private String extractJsonFromResponse(String response) {
        // Remove markdown code blocks if present
        String cleaned = response.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");
        
        // Find the first '[' and last ']' to extract the array
        int startIndex = cleaned.indexOf('[');
        int endIndex = cleaned.lastIndexOf(']');
        
        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return cleaned.substring(startIndex, endIndex + 1);
        }
        
        return cleaned.trim();
    }

    /**
     * Generate fallback flashcards when AI is not available
     */
    private List<FlashcardRequest> generateFallbackFlashcards(String topic, int count, String setId) {
        log.info("Generating fallback flashcards for topic: {}", topic);
        
        List<FlashcardRequest> flashcards = new ArrayList<>();
        
        // Create some basic multiple choice flashcards as fallback
        String[][] basicQuestions = {
            {"What is the main concept of " + topic + "?", 
             "Understanding fundamental principles", 
             "Memorizing facts", 
             "Following procedures", 
             "Avoiding mistakes"},
            {"How does " + topic + " work?", 
             "By following established methodologies", 
             "Through random processes", 
             "Without any structure", 
             "By avoiding best practices"},
            {"What are the key principles of " + topic + "?", 
             "Efficiency, effectiveness, and proper implementation", 
             "Speed, shortcuts, and quick fixes", 
             "Complexity, confusion, and difficulty", 
             "Avoidance, delay, and postponement"},
            {"What are the benefits of " + topic + "?", 
             "Improved understanding, better outcomes, and enhanced skills", 
             "Confusion, frustration, and wasted time", 
             "Complexity, difficulty, and stress", 
             "Avoidance, delay, and procrastination"},
            {"What are common applications of " + topic + "?", 
             "Educational, professional, and personal contexts", 
             "Only theoretical situations", 
             "Impossible scenarios", 
             "Outdated practices"}
        };
        
        String[] basicExplanations = {
            "This foundational knowledge is essential for deeper understanding.",
            "Understanding the mechanics helps in practical application.",
            "These principles guide effective implementation and usage.",
            "Recognizing benefits helps motivate learning and application.",
            "Knowing applications helps connect theory to real-world usage."
        };
        
        for (int i = 0; i < Math.min(count, basicQuestions.length); i++) {
            FlashcardRequest request = new FlashcardRequest();
            request.setQuestion(basicQuestions[i][0]);
            
            // Create multiple choice options
            List<String> options = Arrays.asList(
                basicQuestions[i][1], // Correct answer
                basicQuestions[i][2], // Wrong option 1
                basicQuestions[i][3], // Wrong option 2
                basicQuestions[i][4]  // Wrong option 3
            );
            
            request.setOptions(options);
            request.setAnswer(basicQuestions[i][1]); // Correct answer text
            request.setCorrectOptionIndex(0); // First option is correct
            request.setQuestionType("MULTIPLE_CHOICE");
            request.setExplanation(basicExplanations[i]);
            request.setDifficulty(2); // Medium difficulty for fallback
            request.setTags(Arrays.asList(topic.toLowerCase(), "basics", "general"));
            request.setSetId(setId);
            
            flashcards.add(request);
        }
        
        return flashcards;
    }

    /**
     * Generate multiple choice options for an existing flashcard
     */
    public List<String> generateMultipleChoiceOptions(String question, String answer, String topic) {
        log.info("Generating multiple choice options for question: {}", question);

        try {
            String prompt = buildOptionsPrompt(question, answer, topic);
            String response = callOpenAI(prompt);
            return parseOptionsResponse(response);
        } catch (Exception e) {
            log.error("Error generating options for question: {}", question, e);
            return generateFallbackOptions(answer);
        }
    }

    /**
     * Build prompt for generating multiple choice options
     */
    private String buildOptionsPrompt(String question, String answer, String topic) {
        return String.format("""
            Generate 4 multiple choice options for this question about "%s":
            
            Question: %s
            Correct Answer: %s
            
            Requirements:
            - Create exactly 4 options
            - Include the EXACT correct answer as one of the options (word-for-word match)
            - Create 3 plausible but incorrect options that test understanding
            - Options should be similar in length and style
            - Avoid obviously wrong answers that don't relate to the topic
            
            IMPORTANT: The correct answer "%s" must appear exactly as written in one of the options.
            
            Format your response as a JSON array with this exact structure:
            [
                "Option 1",
                "Option 2", 
                "Option 3",
                "Option 4"
            ]
            
            Make sure the correct answer is included as one of the options.
            """, 
            topic, question, answer, answer
        );
    }

    /**
     * Parse AI response to extract options
     */
    @SuppressWarnings("unchecked")
    private List<String> parseOptionsResponse(String response) {
        try {
            String jsonContent = extractJsonFromResponse(response);
            List<String> options = objectMapper.readValue(jsonContent, List.class);
            
            if (options.size() != 4) {
                log.warn("AI returned {} options instead of 4, using fallback", options.size());
                return generateFallbackOptions("Sample answer");
            }
            
            return options;
        } catch (Exception e) {
            log.error("Error parsing options response", e);
            return generateFallbackOptions("Sample answer");
        }
    }

    /**
     * Generate fallback options when AI fails
     */
    private List<String> generateFallbackOptions(String answer) {
        return Arrays.asList(
            answer,
            "Incorrect option 1",
            "Incorrect option 2",
            "Incorrect option 3"
        );
    }

    /**
     * Generate flashcards with custom parameters
     */
    public List<FlashcardRequest> generateFlashcardsAdvanced(
            String topic, 
            int count, 
            String difficulty, 
            String setId,
            List<String> specificAspects,
            String questionType
    ) {
        log.info("Generating advanced flashcards for topic: {} with aspects: {}", topic, specificAspects);

        try {
            String prompt = buildAdvancedPrompt(topic, count, difficulty, specificAspects, questionType);
            String response = callOpenAI(prompt);
            return parseResponse(response, setId);
        } catch (Exception e) {
            log.error("Error generating advanced flashcards for topic: {}", topic, e);
            return generateFallbackFlashcards(topic, count, setId);
        }
    }

    /**
     * Build advanced prompt with specific aspects and question types
     */
    private String buildAdvancedPrompt(String topic, int count, String difficulty, List<String> aspects, String questionType) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(String.format("Generate %d flashcards about \"%s\" with %s difficulty level.\n\n", count, topic, difficulty));
        
        if (aspects != null && !aspects.isEmpty()) {
            prompt.append("Focus specifically on these aspects: ").append(String.join(", ", aspects)).append("\n\n");
        }
        
        if (questionType != null && !questionType.isEmpty()) {
            prompt.append("Question type preference: ").append(questionType).append("\n\n");
        }
        
        prompt.append("""
            IMPORTANT: Create MULTIPLE CHOICE questions with 2-4 answer options each.
            
            For each flashcard, provide:
            - A clear, concise question
            - 2-4 answer options (one correct, others plausible but incorrect)
            - The correct answer text
            - The index of the correct answer (0-based)
            - A brief explanation (1-2 sentences)
            - Appropriate difficulty level (1-5)
            - Relevant tags (2-4 tags per card)
            
            Format your response as a JSON array with this exact structure:
            [
                {
                    "question": "What is...?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "The correct answer text",
                    "correctOptionIndex": 1,
                    "explanation": "This is important because...",
                    "difficulty": 3,
                    "tags": ["tag1", "tag2", "tag3"]
                }
            ]
            
            Make sure the questions are educational, clear, and test different aspects of the topic.
            Create plausible but incorrect options that test understanding, not just memorization.
            """);
        
        return prompt.toString();
    }
}
