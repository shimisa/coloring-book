package com.example.userauth.domain;

public record UserLoginRes(String username, String password) {
    public UserLoginRes(String username, String password) {
        this.username = username;
        this.password = password;
    }
}
