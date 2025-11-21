package com.example.userauth.service;

import com.example.userauth.repo.PasswordResetTokenRepo;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@AllArgsConstructor
public class TokenCleanupService {

    private final PasswordResetTokenRepo passwordResetTokenRepo;

    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredTokens() {
        try {
            passwordResetTokenRepo.deleteExpiredTokens(LocalDateTime.now());
            log.info("Expired password reset tokens cleaned up successfully");
        } catch (Exception e) {
            log.error("Error cleaning up expired tokens: {}", e.getMessage());
        }
    }
}
