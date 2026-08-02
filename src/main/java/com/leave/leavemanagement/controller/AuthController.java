package com.leave.leavemanagement.controller;

import com.leave.leavemanagement.dto.LoginRequest;
import com.leave.leavemanagement.dto.LoginResponse;
import com.leave.leavemanagement.entity.Employee;
import com.leave.leavemanagement.exception.ResourceNotFoundException;
import com.leave.leavemanagement.repository.EmployeeRepository;
import com.leave.leavemanagement.security.jwt.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmployeeRepository employeeRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          EmployeeRepository employeeRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String cleanEmail = (request.getEmail() != null) ? request.getEmail().trim().toLowerCase() : "";

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        cleanEmail,
                        request.getPassword()
                )
        );

        Employee employee = employeeRepository.findByEmailIgnoreCase(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(employee.getEmail());

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .id(employee.getId())
                .name(employee.getName())
                .email(employee.getEmail())
                .role(employee.getRole())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .leaveBalance(employee.getLeaveBalance())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Employee> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Employee employee = employeeRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return ResponseEntity.ok(employee);
    }
}