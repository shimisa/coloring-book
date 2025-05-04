package com.example.userauth.repo;

import com.example.userauth.domain.Role;
import com.example.userauth.domain.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author Shimi Sadaka
 * @version 1.0
 * @since 1/16/2022
 */
public interface RoleRepo extends JpaRepository<Role, Long> {
    Role findByName(RoleName name);
}

