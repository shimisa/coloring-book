package com.example.userauth.filter;

import com.auth0.jwt.JWT;
import com.example.userauth.domain.UserLoginRes;
import com.example.userauth.domain.UserSec;
import com.example.userauth.security.SecurityUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import static com.example.userauth.security.SecurityUtil.ACCESS_TOKEN_EXP_MILL;
import static com.example.userauth.security.SecurityUtil.REFRESH_TOKEN_EXP_MILL;
import static org.springframework.util.MimeTypeUtils.APPLICATION_JSON_VALUE;

/**
 * Custom authentication filter for handling JWT tokens.
 */
@Slf4j
public class CustomAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;

    public CustomAuthenticationFilter(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        log.info("Username is: {}", username);
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
        return authenticationManager.authenticate(authenticationToken);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) {
        UserSec user = (UserSec) authResult.getPrincipal();

        // Generate JWT tokens
        String access_token = JWT.create()
                .withSubject(user.getUsername())
                .withExpiresAt(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXP_MILL))
                .withIssuer(request.getRequestURL().toString())
                .withClaim("role", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()))
                .sign(SecurityUtil.getAlgorithm());
        String refresh_token = JWT.create()
                .withSubject(user.getUsername())
                .withExpiresAt(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXP_MILL))
                .withIssuer(request.getRequestURL().toString())
                .sign(SecurityUtil.getAlgorithm());

        // Set HttpOnly and SameSite cookies
        Cookie accessTokenCookie = new Cookie("access_token", access_token);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(false); // Set to true if using HTTPS
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge((int) (ACCESS_TOKEN_EXP_MILL / 1000));
        accessTokenCookie.setAttribute("SameSite", "Strict");

        Cookie refreshTokenCookie = new Cookie("refresh_token", refresh_token);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false); // Set to true if using HTTPS
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge((int) (REFRESH_TOKEN_EXP_MILL / 1000));
        refreshTokenCookie.setAttribute("SameSite", "Strict");

        response.addCookie(accessTokenCookie);
        response.addCookie(refreshTokenCookie);

        insertUserDetailsToResponse(response, user);
        log.info("The user: {} logged in", user.getUsername());
    }

    private void insertUserDetailsToResponse(HttpServletResponse response, UserSec user) {
        UserLoginRes userLoginRes = new UserLoginRes(user.getFirstName(), user.getLastName(), user.getUsername());
        Map<String, UserLoginRes> userDetails = new HashMap<>();
        userDetails.put("user", userLoginRes);
        response.setContentType(APPLICATION_JSON_VALUE);
        try {
            new ObjectMapper().writeValue(response.getOutputStream(), userDetails);
        } catch (IOException e) {
            log.error("Error writing user details to response: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }
}