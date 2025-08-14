package com.example.userauth.api;

import com.auth0.jwt.JWT;
import com.example.userauth.domain.RoleName;
import com.example.userauth.domain.User;
import com.example.userauth.security.SecurityUtil;
import com.example.userauth.service.userservice.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;


import java.io.IOException;
import java.net.URI;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

/**
 * Api for managing users and their authorizations in the app database
 *
 * @author Shimi Sadaka
 * @version 1.0
 * @since 1/16/2022
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class UserResource {
    private static final long TOKEN_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(@RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok().body(userService.getUsers(page));
    }

    @GetMapping("/users/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.getUser(username);
        return ResponseEntity.ok().body(user);
    }

    @PostMapping("/user/save")
    public ResponseEntity<User> saveUser(@RequestBody User user) {
        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("api/user/save").toString());
        return ResponseEntity.created(uri).body(userService.saveUser(user));
    }

//    @PostMapping("/role/save")
//    public ResponseEntity<Role> saveUsers(@RequestBody Role role) {
//        URI uri = URI.create(ServletUriComponentsBuilder.fromCurrentContextPath().path("api/role/save").toString());
//        return ResponseEntity.created(uri).body(userService.saveRole(role));
//    }

//    @PostMapping("/role/addtouser")
//    public ResponseEntity<?> addRoleToUser(@RequestBody RoleToUserForm form) {
//        userService.addRoleToUser(form.getUserName(), form.getRoleName());
//        return ResponseEntity.ok().build();
//    }

    @GetMapping("/token/refresh")
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (SecurityUtil.isAuthorizationCookieNotValid(request)) {
            throw new RuntimeException("Refresh token is missing");
        }
        try {
            String refresh_token = SecurityUtil.getTokenFromCookie(request, "refresh_token");
            String username = SecurityUtil.verifyAndGetSubject(refresh_token);
            User user = userService.getUser(username);
            String access_token = JWT.create()
                    .withSubject(user.getUsername())
                    .withExpiresAt(new Date(System.currentTimeMillis() + TOKEN_EXPIRY_TIME))
                    .withIssuer(request.getRequestURL().toString())
                    .withClaim("role", user.getRole().name())
                    .sign(SecurityUtil.getAlgorithm());
            /* send the tokens in the body instead of in the header*/
            Map<String, String> tokens = new HashMap<>();
            tokens.put("access_token", access_token);
            tokens.put("refresh_token", refresh_token);
            response.setContentType(APPLICATION_JSON_VALUE);
            new ObjectMapper().writeValue(response.getOutputStream(), tokens);

        } catch (Exception exception) {
            log.error("Error refreshing the token: {}", exception.getMessage());
            SecurityUtil.handleTokenException(exception, response);
        }


    }


}
    @Data
    class RoleToUserForm {
        private String userName;
        private RoleName roleName;
    }