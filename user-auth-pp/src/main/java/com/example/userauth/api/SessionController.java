package com.example.userauth.api;

import com.example.userauth.service.IsAuthenticatedResponse;
import com.example.userauth.service.SessionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Hello API", description = "Endpoints for greeting users")
@AllArgsConstructor
public class SessionController {
    SessionService sessionService;

    @GetMapping(path = "/check-auth")
    public ResponseEntity<IsAuthenticatedResponse> checkAuthentication(@CookieValue(name = "access_token") String token){
        IsAuthenticatedResponse response = sessionService.checkAuthentication(token);
        return ResponseEntity.ok().body(response);
    }




}
