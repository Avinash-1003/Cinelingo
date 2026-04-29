package com.cinelingo.backend.controllers;

import com.cinelingo.backend.models.UserProgress;
import com.cinelingo.backend.repositories.UserProgressRepository;
import com.cinelingo.backend.services.ScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ProgressController {

    private final UserProgressRepository userProgressRepository;
    private final ScoreService scoreService;

    /**
     * GET /api/recommendations/progress/{userId}
     *
     * Returns a unified progress snapshot for the given user.
     * Tries UserProgress document first; falls back to aggregating Score records.
     */
    @GetMapping("/progress/{userId}")
    public ResponseEntity<Map<String, Object>> getProgress(@PathVariable String userId) {

        Map<String, Object> result = new LinkedHashMap<>();

        // 1. Try UserProgress collection
        Optional<UserProgress> upOpt = userProgressRepository.findByUserId(userId);

        if (upOpt.isPresent()) {
            UserProgress up = upOpt.get();
            result.put("totalXp", up.getTotalXp());
            result.put("currentLevel", up.getCurrentLevel() != null ? up.getCurrentLevel() : "beginner");
            result.put("currentStreak", up.getCurrentStreak());

            // Vocabulary counts
            int wordsLearned = up.getVocabularyProgress() != null ? up.getVocabularyProgress().size() : 0;
            result.put("totalWordsLearned", wordsLearned);
            result.put("totalWordsPracticed", wordsLearned);

            // Pronunciation
            int pronAttempts = up.getPronunciationAttempts() != null ? up.getPronunciationAttempts().size() : 0;
            result.put("totalPronunciationAttempts", pronAttempts);
            result.put("bestPronunciationScore", up.getBestPronunciationScore() != null ? up.getBestPronunciationScore() : 0);
            result.put("averagePronunciationScore", up.getAveragePronunciationScore() != null ? up.getAveragePronunciationScore() : 0);

            // SRS lists
            result.put("masteredWordIds", up.getMasteredWordIds() != null ? up.getMasteredWordIds() : List.of());
            result.put("strugglingWordIds", up.getStrugglingWordIds() != null ? up.getStrugglingWordIds() : List.of());
        } else {
            // 2. Fallback: aggregate from Score records
            int xpFromScores = scoreService.getTotalXpByUser(userId);
            long gamesPlayed = scoreService.getGamesPlayed(userId);
            long victories = scoreService.getVictoryCount(userId);

            String level = "beginner";
            if (xpFromScores >= 1000) level = "advanced";
            else if (xpFromScores >= 300) level = "intermediate";

            result.put("totalXp", xpFromScores);
            result.put("currentLevel", level);
            result.put("currentStreak", 0);
            result.put("totalWordsLearned", victories * 3); // estimate: ~3 words per victory
            result.put("totalWordsPracticed", gamesPlayed * 4);
            result.put("totalPronunciationAttempts", gamesPlayed);
            result.put("bestPronunciationScore", 0);
            result.put("averagePronunciationScore", 0);
            result.put("masteredWordIds", List.of());
            result.put("strugglingWordIds", List.of());
        }

        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/recommendations/progress/{userId}
     *
     * Upserts progress data (called by frontend after mini-games).
     */
    @PostMapping("/progress/{userId}")
    public ResponseEntity<Map<String, Object>> updateProgress(
            @PathVariable String userId,
            @RequestBody Map<String, Object> body) {

        UserProgress up = userProgressRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProgress fresh = new UserProgress();
                    fresh.setUserId(userId);
                    fresh.setCurrentLevel("beginner");
                    fresh.setTotalXp(0);
                    fresh.setCurrentStreak(0);
                    return fresh;
                });

        // Merge incoming data
        if (body.containsKey("addXp")) {
            int addXp = ((Number) body.get("addXp")).intValue();
            up.setTotalXp(up.getTotalXp() + addXp);
        }
        if (body.containsKey("totalXp")) {
            int newXp = ((Number) body.get("totalXp")).intValue();
            if (newXp > up.getTotalXp()) up.setTotalXp(newXp);
        }
        if (body.containsKey("addWordsLearned")) {
            int count = ((Number) body.get("addWordsLearned")).intValue();
            int current = up.getVocabularyProgress() != null ? up.getVocabularyProgress().size() : 0;
            // We can't add arbitrary words without IDs, so just track count via XP
            // The GET endpoint will derive word count from vocabularyProgress size
        }

        // Auto-level based on XP
        if (up.getTotalXp() >= 1000) up.setCurrentLevel("advanced");
        else if (up.getTotalXp() >= 300) up.setCurrentLevel("intermediate");
        else up.setCurrentLevel("beginner");

        up.setUpdatedAt(java.time.LocalDateTime.now());
        userProgressRepository.save(up);

        return ResponseEntity.ok(Map.of(
                "message", "Progress updated",
                "totalXp", up.getTotalXp(),
                "currentLevel", up.getCurrentLevel()
        ));
    }
}
