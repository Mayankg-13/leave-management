package com.leave.leavemanagement.security;

import com.leave.leavemanagement.entity.Employee;
import com.leave.leavemanagement.repository.EmployeeRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    public CustomUserDetailsService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        String cleanEmail = (username != null) ? username.trim().toLowerCase() : "";

        Employee employee = employeeRepository
                .findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + username));

        return new CustomUserDetails(employee);
    }
}