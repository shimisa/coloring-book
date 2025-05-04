package com.example.userauth.service;

public interface SessionService {
    IsAuthenticatedResponse checkAuthentication(String token);
}

