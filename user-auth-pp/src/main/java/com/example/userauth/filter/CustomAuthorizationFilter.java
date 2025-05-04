package com.example.userauth.filter;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.example.userauth.security.SecurityUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;


import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

import static java.util.Arrays.stream;


/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 3/10/2022
 */
@Slf4j
public class CustomAuthorizationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (request.getServletPath().equals("/login") || request.getServletPath().matches("/register(.*)") || request.getServletPath().equals("/token/refresh") || request.getServletPath().equals("/post/posts")){
            filterChain.doFilter(request, response); // not doing anything in case of these paths
        } else { // else verify the token validity and the authorities
            if (SecurityUtil.isAuthorizationCookieNotValid(request)) {
                logger.error("Authorization Cookie is not valid");
                filterChain.doFilter(request, response);
                return;
            }
            try {
                String token = SecurityUtil.getTokenFromCookie(request, "access_token");
                DecodedJWT decodedJWT = SecurityUtil.getDecodedJWT(token);
                String username = decodedJWT.getSubject();
                String[] roles = decodedJWT.getClaim("role").asArray(String.class);
                Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
                stream(roles).forEach(role -> {
                    authorities.add(new SimpleGrantedAuthority(role));
                });
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                filterChain.doFilter(request, response);
            } catch (Exception exception) {
                log.error("Error logging in: ", exception);
                SecurityUtil.handleTokenException(exception, response);
            }

        }
    }
}
