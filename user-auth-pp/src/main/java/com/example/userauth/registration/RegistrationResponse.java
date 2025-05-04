package com.example.userauth.registration;

import lombok.*;
import org.springframework.http.HttpStatus;

/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 4/16/2022
 */
@Getter
@Setter
@AllArgsConstructor
@EqualsAndHashCode
@ToString
public class RegistrationResponse {
    private final HttpStatus status;
    private final String token;
    private final String message;
}
