package com.example.api_gateway.config;

import com.example.api_gateway.security.AuthenticationFilter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.client.RestClient;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class SecurityConfig {

    @Bean("authWebClient")
    public WebClient authWebClient(@Value("${app.auth.service-url}") String baseUrl) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
    @Bean
    public AuthenticationFilter authenticationFilter(@Qualifier("authWebClient") WebClient webClient) {
        return new AuthenticationFilter(webClient);
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)  // Disable CSRF
                .authorizeExchange(auth -> auth
                        .pathMatchers( "/api/user-auth/**").permitAll()
                        .anyExchange().authenticated()
                )
                .build();
    }
}