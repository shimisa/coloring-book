package com.example.userauth.service;

import com.example.userauth.service.userservice.UserService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class SessionServiceImpl implements SessionService {
    private final UserService userService;
    @Override
    public IsAuthenticatedResponse checkAuthentication(String token) {
        com.example.userauth.domain.User user = userService.getUserByToken(token);
        return new IsAuthenticatedResponse(true, new User(user.getFirstName(), user.getLastName()));
    }



}
