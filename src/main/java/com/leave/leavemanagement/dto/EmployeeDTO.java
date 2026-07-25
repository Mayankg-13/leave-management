package com.leave.leavemanagement.dto;

import com.leave.leavemanagement.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {

    private Long id;

    private String name;

    private String email;

    private String department;

    private String designation;

    private Integer leaveBalance;

    private Role role;
}