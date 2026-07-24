package com.leave.leavemanagement.dto;

import com.leave.leavemanagement.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String department;
    private String designation;
    private Integer leaveBalance;

}