package com.example.api_gateway.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    // This controller is now reserved for future auth-related endpoints
    // JWT validation is handled by AuthenticationFilter
}
