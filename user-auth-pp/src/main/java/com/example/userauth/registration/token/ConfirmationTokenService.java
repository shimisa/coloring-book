package com.example.userauth.registration.token;

import com.example.userauth.domain.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 3/13/2022
 */
@Service
@AllArgsConstructor
public class ConfirmationTokenService {
    private final ConfirmationTokenRepository confirmationTokenRepository;
    public static final int CONFIRMATION_TOKEN_EXPIRY_TIME = 15;

    public void saveConfirmationToken(ConfirmationToken confirmationToken){
        confirmationTokenRepository.save(confirmationToken);
    }

    public Optional<ConfirmationToken> getToken(String token) {
        return confirmationTokenRepository.findByToken(token);
    }
    public Optional<ConfirmationToken> getTokenById(long id) {
        return confirmationTokenRepository.findById(id);
    }
    public Optional<ConfirmationToken> getTokenByUser(User user) {
        return confirmationTokenRepository.findByUser(user);
    }

    public void setConfirmedAt(String token) {
        ConfirmationToken confirmationToken = confirmationTokenRepository.findByToken(token).orElseThrow(
                () -> new IllegalStateException("Confirmation token does not exist")
        );
        confirmationToken.setConfirmedAt(LocalDateTime.now());
        confirmationTokenRepository.save(confirmationToken);
    }
}
