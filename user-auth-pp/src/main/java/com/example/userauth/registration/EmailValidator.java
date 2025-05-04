package com.example.userauth.registration;

import org.springframework.stereotype.Service;

import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 3/13/2022
 */
@Service
public class EmailValidator implements Predicate<String> {
    @Override
    public boolean test(String email) {
        String regexEmailValidation = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$";
        Pattern pattern = Pattern.compile(regexEmailValidation);
        Matcher matcher = pattern.matcher(email);
        return matcher.matches();
    }
}
