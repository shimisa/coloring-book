package com.example.userauth.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 3/10/2022
 */
@Component
public class SecurityUtil {

    @Value("${jwt.secret}")
    private String secretKey;
    private static Algorithm algorithm;
    public static final String AUTHORIZATION_PREFIX = "Bearer ";
    public static final int ACCESS_TOKEN_EXP_MILL = 15 * 60 * 1000; // 15 minutes
    public static final int REFRESH_TOKEN_EXP_MILL = 40 * 60 * 1000; // 40 minutes



    @PostConstruct
    private void init(){
        algorithm = Algorithm.HMAC256(secretKey);
    }

    public static Algorithm getAlgorithm() {
        return algorithm;
    }


    public static String verifyAndGetSubject(String token) {
        JWTVerifier verifier = JWT.require(algorithm).build();
        DecodedJWT decodedJWT = verifier.verify(token);
        String username = decodedJWT.getSubject();
        return username;
    }
    public static DecodedJWT getDecodedJWT(String token) {
        JWTVerifier verifier = JWT.require(algorithm).build();
        DecodedJWT decodedJWT = verifier.verify(token);
        return decodedJWT;
    }

    public static void handleTokenException(Exception exception, HttpServletResponse response) throws IOException {
        response.setHeader("error", exception.getMessage());
        response.setStatus(FORBIDDEN.value());
        //response.sendError(FORBIDDEN.value());
        Map<String, String> error = new HashMap<>();
        error.put("error_message", exception.getMessage());
        response.setContentType(APPLICATION_JSON_VALUE);
        new ObjectMapper().writeValue(response.getOutputStream(), error);
    }

    public static boolean isAuthorizationCookieNotValid(HttpServletRequest request) {
        return request.getCookies() == null || request.getCookies().length != 2 ||
                !request.getCookies()[0].getName().equals("access_token") || !request.getCookies()[1].getName().equals("refresh_token");
    }

    public static String getTokenFromCookie(HttpServletRequest request, String cookieName) {
        return Arrays.stream(request.getCookies()).filter(c -> c.getName().equals(cookieName)).findFirst().get().getValue();
    }

}
