package com.example.userauth.domain;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * UserSec class extends the User class from Spring Security to include additional fields.
 * It represents a user in the system with additional attributes like first name and last name.
 */
@Getter
public class UserSec extends User {
    private final String firstName;
    private final String lastName;

    public UserSec(String username, String password, boolean enabled, boolean accountNonExpired, boolean credentialsNonExpired, boolean accountNonLocked, Collection<? extends GrantedAuthority> authorities, String firstName, String lastName) {
        super(username, password, enabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
        this.firstName = firstName;
        this.lastName = lastName;
    }

}
