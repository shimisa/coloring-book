package com.example.userauth.api;


import com.example.userauth.registration.RegistrationRequest;
import com.example.userauth.registration.RegistrationResponse;
import com.example.userauth.registration.RegistrationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import io.swagger.v3.oas.annotations.tags.Tag;


import java.net.URI;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static java.lang.Thread.sleep;

/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 3/13/2022
 */
@RestController
@RequestMapping(path = "/register")
@Tag(name = "Registration", description = "Registration API")
@AllArgsConstructor
public class RegistrationController {
    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<RegistrationResponse> register(@RequestBody RegistrationRequest request) throws ExecutionException, InterruptedException {
        RegistrationResponse response = registrationService.register(request).get();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping(path = "/confirm-email")
    public ResponseEntity<String> confirm(@RequestParam("token") String token){
        return ResponseEntity.ok().body(registrationService.confirmToken(token));
    }
}
