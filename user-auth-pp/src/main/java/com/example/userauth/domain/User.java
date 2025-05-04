package com.example.userauth.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.Hibernate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

import static jakarta.persistence.GenerationType.AUTO;


/**
 * @author Shimi Sadaka
 * @since 16/01/2022
 *
 */

@Getter
@Setter
@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = AUTO)
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private boolean locked = false;
    private boolean enabled = false;
    @Enumerated(EnumType.STRING)
    private RoleName role;
//    @ManyToMany(fetch = EAGER)
//    private Collection<Role> roles = new ArrayList<>();


    public User(String firstName, String lastName, String email, String password, RoleName role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    /**
     * Add to All the Authorities beneath this role include this role
     * @return
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        RoleName.stream().filter(
                roleName ->
                        roleName.getVal() <= this.getRole().getVal())
                .forEach(
                role -> {
                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role.name());
                        authorities.add(authority);
                }
        );
        return authorities;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return false;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        User user = (User) o;
        return  (Objects.equals(firstName, user.getFirstName())) && (Objects.equals(lastName, user.getLastName()));
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
