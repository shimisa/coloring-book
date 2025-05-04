package com.example.userauth.domain;

import java.util.stream.Stream;

/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 3/10/2022
 */
public enum RoleName {

    ROLE_USER(0),
    ROLE_ADMIN(1),
    ROLE_MANAGER(2),
    ROLE_SUPER_ADMIN(3),
    ;

    final int val;
    RoleName(int val) {
        this.val = val;
    }
    public int getVal() {
        return val;
    }

    public static Stream<RoleName> stream() {
        return Stream.of(RoleName.values());
    }
}
