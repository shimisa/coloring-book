package com.example.userauth.service;

public record IsAuthenticatedResponse(boolean isLoggedIn, User user) {
}

record User(String firstName, String lastName) {
}
