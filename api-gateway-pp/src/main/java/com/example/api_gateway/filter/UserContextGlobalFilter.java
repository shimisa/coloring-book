
package com.example.api_gateway.filter;

import com.example.api_gateway.dto.UserDetailsDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class UserContextGlobalFilter implements GlobalFilter, Ordered {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        UserDetailsDto userDetails = exchange.getAttribute("userDetails");
        String username = exchange.getAttribute("username");

        if (userDetails != null || username != null) {
            ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate();

            if (username != null) {
                requestBuilder.header("X-User-Username", username);
            }

            if (userDetails != null) {
                try {
                    String userDetailsJson = objectMapper.writeValueAsString(userDetails);
                    requestBuilder.header("X-User-Details", userDetailsJson);
                    requestBuilder.header("X-User-Email", userDetails.getEmail());
                    requestBuilder.header("X-User-FirstName", userDetails.getFirstName());
                    requestBuilder.header("X-User-LastName", userDetails.getLastName());
                } catch (JsonProcessingException e) {
                    log.error("Error serializing user details: {}", e.getMessage());
                }
            }

            return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1; // Execute after authentication filter
    }
}
