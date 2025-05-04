package com.example.userauth.service.userservice;

import com.example.userauth.domain.RoleName;
import com.example.userauth.domain.User;
import com.example.userauth.registration.RegistrationResponse;

import java.util.List;

/**
 * User service to store and get users in the database
 *
 * @author Shimi Sadaka
 * @version 1.0
 * @since 1/16/2022
 */

public interface UserService {
    User saveUser(User user);
    //Role saveRole(Role role);
    void addRoleToUser(String username, RoleName roleName);
    User getUser(String username);
    public User getUserByToken(String token);
    List<User> getUsers(int page);
    RegistrationResponse signUpUser(User user);
    void enableUser(String email);
}
