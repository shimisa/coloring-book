package com.example.api_gateway.security;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter implements GlobalFilter {
    private final WebClient webClient;

    public AuthenticationFilter(@Qualifier("authWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        if (request.getPath().toString().contains("/api/user-auth/login") ||
                request.getPath().toString().contains("/api/user-auth/register")) {
            return chain.filter(exchange);
        }

        HttpCookie access_token = request.getCookies().getFirst("access_token");
        HttpCookie refresh_token = request.getCookies().getFirst("refresh_token");
        if (access_token == null || refresh_token == null) {
            return onError(exchange, "No token cookie found", HttpStatus.UNAUTHORIZED);
        }

        return webClient.get()
                .cookie("access_token", access_token.getValue())
                .cookie("refresh_token", refresh_token.getValue())
                .exchangeToMono(clientResponse -> {
                    if (clientResponse.statusCode().is2xxSuccessful()) {
                        return chain.filter(exchange);
                    }
                    return onError(exchange, "Authentication failed", HttpStatus.UNAUTHORIZED);
                })
                .onErrorResume(e -> onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED));
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.writeWith(Mono.just(response.bufferFactory()
                .wrap(message.getBytes())));
    }
}