package com.example.userauth.service;

import jakarta.servlet.http.HttpServletResponse;

public interface SessionService {
    IsAuthenticatedResponse checkAuthentication(String token);
    void logout(HttpServletResponse response);
}

