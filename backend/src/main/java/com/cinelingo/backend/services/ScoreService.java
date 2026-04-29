package com.cinelingo.backend.services;

import com.cinelingo.backend.models.Score;
import com.cinelingo.backend.repositories.ScoreRepository;
import com.cinelingo.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final UserRepository  userRepository;

    public Score saveScore(Score score) {
        // Denormalize username for leaderboard display
        userRepository.findById(score.getUserId())
                .ifPresent(u -> score.setUsername(u.getUsername()));

        score.setPlayedAt(LocalDateTime.now());

        // Calculate accuracy rate
        int total = score.getCommandsCompleted() + (3 - Math.max(score.getLivesRemaining(), 0));
        if (total > 0) {
            score.setAccuracyRate((double) score.getCommandsCompleted() / total);
        }

        // Award XP based on result
        if ("victory".equals(score.getStatus())) {
            int xp = 50 + (score.getLevel() * 20) + (score.getLivesRemaining() * 10);
            score.setXpEarned(xp);
        }

        return scoreRepository.save(score);
    }

    public List<Score> getScoresByUser(String userId) {
        return scoreRepository.findByUserIdOrderByPlayedAtDesc(userId);
    }

    public Optional<Score> getBestScoreByUser(String userId) {
        List<Score> scores = scoreRepository.findTopScoresByUserId(userId);
        return scores.isEmpty() ? Optional.empty() : Optional.of(scores.get(0));
    }

    public long getGamesPlayed(String userId) {
        return scoreRepository.countByUserId(userId);
    }

    public long getVictoryCount(String userId) {
        return scoreRepository.countByUserIdAndStatus(userId, "victory");
    }

    public int getTotalXpByUser(String userId) {
        return scoreRepository.findByUserIdOrderByPlayedAtDesc(userId).stream()
                .mapToInt(Score::getXpEarned)
                .sum();
    }
}