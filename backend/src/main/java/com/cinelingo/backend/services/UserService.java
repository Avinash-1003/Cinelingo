package com.cinelingo.backend.services;

import com.cinelingo.backend.models.User;
import com.cinelingo.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Register new user
    public User register(String username, String email, String password, String nativeLanguage) {

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered!");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken!");
        }

        // Create new user
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .nativeLanguage(nativeLanguage)
                .targetLanguage("korean")
                .proficiencyLevel("beginner")
                .createdAt(LocalDateTime.now())
                .lastActive(LocalDateTime.now())
                .streak(new User.Streak(0, 0, LocalDateTime.now()))
                .settings(new User.Settings("seoul", 30, true))
                .build();

        return userRepository.save(user);
    }

    // Login
    public User login(String username, String password) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Wrong password!");
        }

        // Update last active
        user.setLastActive(LocalDateTime.now());
        userRepository.save(user);

        return user;
    }

    // Get user by ID
    public User getById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    // Update profile
    public User updateProfile(String userId, Map<String, String> updates) {
        User user = getById(userId);

        if (updates.containsKey("username")) {
            user.setUsername(updates.get("username"));
        }
        if (updates.containsKey("nativeLanguage")) {
            user.setNativeLanguage(updates.get("nativeLanguage"));
        }
        if (updates.containsKey("proficiencyLevel")) {
            user.setProficiencyLevel(updates.get("proficiencyLevel"));
        }
        if (updates.containsKey("avatarUrl")) {
            user.setAvatarUrl(updates.get("avatarUrl"));
        }

        return userRepository.save(user);
    }

    // Update streak
    public User updateStreak(String userId) {
        User user = getById(userId);
        User.Streak streak = user.getStreak();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastStudied = streak.getLastStudied();

        // If studied yesterday, increment streak
        if (lastStudied != null &&
                lastStudied.toLocalDate().plusDays(1).equals(now.toLocalDate())) {
            streak.setCurrent(streak.getCurrent() + 1);
            if (streak.getCurrent() > streak.getLongest()) {
                streak.setLongest(streak.getCurrent());
            }
        }
        // If studied today already, don't change
        else if (lastStudied != null &&
                lastStudied.toLocalDate().equals(now.toLocalDate())) {
            return user;
        }
        // Streak broken
        else {
            streak.setCurrent(1);
        }

        streak.setLastStudied(now);
        user.setStreak(streak);
        return userRepository.save(user);
    }
}
