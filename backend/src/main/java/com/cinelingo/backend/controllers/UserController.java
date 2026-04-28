package com.cinelingo.backend.controllers;

import com.cinelingo.backend.models.User;
import com.cinelingo.backend.security.JwtUtil;
import com.cinelingo.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // ── Register ──────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            User user = userService.register(
                    request.get("username"),
                    request.get("email"),
                    request.get("password"),
                    request.get("nativeLanguage")
            );

            String token = jwtUtil.generateToken(user.getId(), user.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully!",
                    "token", token,
                    "userId", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "proficiencyLevel", user.getProficiencyLevel() != null ? user.getProficiencyLevel() : "beginner",
                    "targetLanguage", user.getTargetLanguage() != null ? user.getTargetLanguage() : "korean"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            User user = userService.login(
                    request.get("username"),
                    request.get("password")
            );

            String token = jwtUtil.generateToken(user.getId(), user.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful!",
                    "token", token,
                    "userId", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "proficiencyLevel", user.getProficiencyLevel() != null ? user.getProficiencyLevel() : "beginner",
                    "targetLanguage", user.getTargetLanguage() != null ? user.getTargetLanguage() : "korean"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get profile ───────────────────────────────────────────────────────────
    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable String userId) {
        try {
            User user = userService.getById(userId);
            // Never return passwordHash to frontend
            user.setPasswordHash(null);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Update profile ────────────────────────────────────────────────────────
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        try {
            User user = userService.updateProfile(userId, request);
            user.setPasswordHash(null);
            return ResponseEntity.ok(Map.of("message", "Profile updated!", "user", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get streak ────────────────────────────────────────────────────────────
    @GetMapping("/{userId}/streak")
    public ResponseEntity<?> getStreak(@PathVariable String userId) {
        try {
            User user = userService.getById(userId);
            return ResponseEntity.ok(Map.of(
                    "currentStreak", user.getStreak().getCurrent(),
                    "longestStreak", user.getStreak().getLongest(),
                    "lastStudied", user.getStreak().getLastStudied()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}