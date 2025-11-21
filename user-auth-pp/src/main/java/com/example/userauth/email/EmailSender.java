package com.example.userauth.email;

/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 3/13/2022
 */
public interface EmailSender {
    void send(String to, String email);
    void send(String to, String email, String subject);
    String buildEmail(String name, String link);
}
