package com.example.userauth.registration.token;

import com.example.userauth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 3/13/2022
 */
@Repository
public interface ConfirmationTokenRepository extends JpaRepository<ConfirmationToken, Long> {
    Optional<ConfirmationToken> findByToken(String token);
    Optional<ConfirmationToken> findById(long id);
    Optional<ConfirmationToken> findByUser(User user);
}
