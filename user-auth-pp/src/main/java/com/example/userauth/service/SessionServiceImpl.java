package com.example.userauth.service;

import com.example.userauth.service.userservice.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.example.userauth.security.SecurityUtil;

@Slf4j
@Service
@AllArgsConstructor
public class SessionServiceImpl implements SessionService {
    private final UserService userService;
    @Override
    public IsAuthenticatedResponse checkAuthentication(String token) {
        com.example.userauth.domain.User user = userService.getUserByToken(token);
        log.info("The user is logged in: {}", user.getEmail());
        return new IsAuthenticatedResponse(true, new User(user.getFirstName(), user.getLastName()));
    }

    @Override
    public void logout(HttpServletResponse response) {
        SecurityUtil.clearAuthenticationCookies(response);
        log.info("User logged out successfully");
    }



}
