package com.example.api_gateway.security;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.example.api_gateway.dto.UserDetailsDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static java.util.Arrays.stream;

@Slf4j
@Component
public class AuthenticationFilter implements WebFilter {

    private final WebClient userServiceWebClient;

    public AuthenticationFilter(@Qualifier("userServiceWebClient") WebClient userServiceWebClient) {
        this.userServiceWebClient = userServiceWebClient;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        // Avoid duplicate authentication per request
        if (exchange.getAttribute("AUTH_DONE") != null) {
            return chain.filter(exchange);
        }

        // Skip authentication for these paths
        if (path.matches("(.*)/login") ||
            path.matches("(.*)/register(.*)") ||
            path.matches("(.*)/token/refresh(.*)") ||
            path.matches("/api/auth/.*")) {
            return chain.filter(exchange);
        }

        // Check for access_token cookie
        List<HttpCookie> cookies = exchange.getRequest().getCookies().get("access_token");
        if (cookies == null || cookies.isEmpty()) {
            log.debug("No access_token cookie found for path: {}", path);
            return chain.filter(exchange);
        }

        try {
            String token = cookies.get(0).getValue();
            DecodedJWT decodedJWT = SecurityUtil.getDecodedJWT(token);
            String username = decodedJWT.getSubject();
            String[] roles = decodedJWT.getClaim("role").asArray(String.class);

            Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
            if (roles != null) {
                stream(roles).forEach(role -> {
                    authorities.add(new SimpleGrantedAuthority(role));
                });
            }

            UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(username, null, authorities);

            // Mark authentication as done for this request (set before async work)
            exchange.getAttributes().put("AUTH_DONE", true);

            // Add user details to request attributes for downstream services
            return fetchUserDetails(username)
                .doOnNext(userDetails -> {
                    exchange.getAttributes().put("userDetails", userDetails);
                    exchange.getAttributes().put("username", username);
                })
                .then(chain.filter(exchange)
                    .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authenticationToken)))
                .onErrorResume(ex -> {
                    log.error("Error fetching user details for {}: {}", username, ex.getMessage());
                    // Continue without user details but with authentication
                    return chain.filter(exchange)
                        .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authenticationToken));
                });

        } catch (Exception exception) {
            log.error("Error validating token: ", exception);
            return chain.filter(exchange);
        }
    }

    private Mono<UserDetailsDto> fetchUserDetails(String username) {
        return userServiceWebClient
            .get()
            .uri("/api/user-auth/users/{username}", username)
            .retrieve()
            .bodyToMono(UserDetailsDto.class)
            .doOnNext(userDetails -> log.debug("Fetched user details for: {}", username))
            .onErrorResume(ex -> {
                log.warn("Failed to fetch user details for {}: {}", username, ex.getMessage());
                return Mono.empty();
            });
    }
}