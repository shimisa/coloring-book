package com.example.userauth.service;

import com.example.userauth.domain.*;
import com.example.userauth.email.EmailSender;
import com.example.userauth.repo.PasswordResetTokenRepo;
import com.example.userauth.repo.UserRepo;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@AllArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {
    
    private final UserRepo userRepo;
    private final PasswordResetTokenRepo passwordResetTokenRepo;
    private final EmailSender emailSender;
    private final PasswordEncoder passwordEncoder;
    
    private static final int TOKEN_EXPIRY_HOURS = 1;
    private static final int TOKEN_LENGTH = 32;
    
    @Override
    @Transactional
    public String initiatePasswordReset(ForgotPasswordRequest request) {
        Optional<com.example.userauth.domain.User> userOptional = userRepo.findByEmail(request.getEmail());
        
        if (userOptional.isEmpty()) {
            log.warn("Password reset requested for non-existent email: {}", request.getEmail());
            // Return success message even if user doesn't exist for security reasons
            return "If an account with that email exists, you will receive a password reset link.";
        }
        
        com.example.userauth.domain.User user = userOptional.get();
        
        // Delete any existing reset tokens for this user
        passwordResetTokenRepo.deleteAllByUser(user);
        
        // Generate new reset token
        String token = generateSecureToken();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS);
        
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
        passwordResetTokenRepo.save(resetToken);
        
        // Send reset email
        String resetLink = buildResetLink(token);
        String emailContent = buildPasswordResetEmail(user.getFirstName(), resetLink);
        emailSender.send(user.getEmail(), emailContent, "Password Reset Request");

        log.info("Password reset email sent to: {}", user.getEmail());
        return "If an account with that email exists, you will receive a password reset link.";
    }
    
    @Override
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepo.findByToken(request.getToken());
        
        if (tokenOptional.isEmpty()) {
            throw new IllegalArgumentException("Invalid reset token");
        }
        
        PasswordResetToken resetToken = tokenOptional.get();
        
        if (resetToken.isExpired()) {
            passwordResetTokenRepo.delete(resetToken);
            throw new IllegalArgumentException("Reset token has expired");
        }
        
        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("Reset token has already been used");
        }
        
        // Update user password
        com.example.userauth.domain.User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepo.save(resetToken);
        
        log.info("Password successfully reset for user: {}", user.getEmail());
        return "Password has been successfully reset";
    }
    
    @Override
    public boolean validateResetToken(String token) {
        Optional<PasswordResetToken> tokenOptional = passwordResetTokenRepo.findByToken(token);
        
        if (tokenOptional.isEmpty()) {
            return false;
        }
        
        PasswordResetToken resetToken = tokenOptional.get();
        return !resetToken.isExpired() && !resetToken.isUsed();
    }
    
    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[TOKEN_LENGTH];
        random.nextBytes(bytes);
        
        StringBuilder token = new StringBuilder();
        for (byte b : bytes) {
            token.append(String.format("%02x", b));
        }
        return token.toString();
    }
    
    private String buildResetLink(String token) {
        // You can make this configurable via application.properties
        String baseUrl = "http://localhost:3000"; // Frontend URL
        return baseUrl + "/reset-password?token=" + token;
    }
    
    private String buildPasswordResetEmail(String firstName, String resetLink) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Password Reset Request</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">Password Reset Request</h2>
                    
                    <p>Hello %s,</p>
                    
                    <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                    
                    <p>To reset your password, click the button below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    </div>
                    
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #3498db;">%s</p>
                    
                    <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #666;">
                        If you're having trouble clicking the button, copy and paste the URL into your web browser.
                    </p>
                </div>
            </body>
            </html>""", firstName, resetLink, resetLink);
    }
}
