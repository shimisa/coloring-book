package com.example.userauth.service;

import com.example.userauth.domain.ForgotPasswordRequest;
import com.example.userauth.domain.ResetPasswordRequest;

public interface PasswordResetService {

    /**
     * Initiates password reset process by sending reset email
     * @param request containing user email
     * @return success message
     */
    String initiatePasswordReset(ForgotPasswordRequest request);

    /**
     * Resets user password using reset token
     * @param request containing token and new password
     * @return success message
     */
    String resetPassword(ResetPasswordRequest request);

    /**
     * Validates if reset token is valid and not expired
     * @param token the reset token
     * @return true if valid, false otherwise
     */
    boolean validateResetToken(String token);
}
