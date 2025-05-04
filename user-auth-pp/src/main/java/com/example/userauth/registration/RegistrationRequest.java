package com.example.userauth.registration;

import lombok.*;

/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 3/13/2022
 */
@Getter
@Setter
@AllArgsConstructor
@EqualsAndHashCode
@ToString
public class RegistrationRequest {
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String password;
}
