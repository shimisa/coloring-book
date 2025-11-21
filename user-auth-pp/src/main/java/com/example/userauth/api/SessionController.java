package com.example.userauth.api;

import com.example.userauth.domain.ForgotPasswordRequest;
import com.example.userauth.domain.ResetPasswordRequest;
import com.example.userauth.service.IsAuthenticatedResponse;
import com.example.userauth.service.PasswordResetService;
import com.example.userauth.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Session API", description = "Endpoints for user session management and password reset")
@AllArgsConstructor
public class SessionController {
    SessionService sessionService;
    PasswordResetService passwordResetService;

    @GetMapping(path = "/check-auth")
    @Operation(summary = "Check user authentication status")
    public ResponseEntity<IsAuthenticatedResponse> checkAuthentication(@CookieValue(name = "access_token") String token){
        IsAuthenticatedResponse response = sessionService.checkAuthentication(token);
        return ResponseEntity.ok().body(response);
    }

    @PostMapping(path = "/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        sessionService.logout(response);
        return ResponseEntity.ok().body("Logged out successfully");
    }

    @PostMapping(path = "/forgot-password")
    @Operation(summary = "Initiate password reset process")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String result = passwordResetService.initiatePasswordReset(request);
        return ResponseEntity.ok().body(result);
    }

    @PostMapping(path = "/reset-password")
    @Operation(summary = "Reset password using reset token")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            String result = passwordResetService.resetPassword(request);
            return ResponseEntity.ok().body(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping(path = "/validate-reset-token")
    @Operation(summary = "Validate if reset token is valid")
    public ResponseEntity<Boolean> validateResetToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateResetToken(token);
        return ResponseEntity.ok().body(isValid);
    }
}
