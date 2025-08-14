package com.example.api_gateway.dto;

import lombok.Data;

@Data
public class UserDetailsDto {
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String[] roles;
}
