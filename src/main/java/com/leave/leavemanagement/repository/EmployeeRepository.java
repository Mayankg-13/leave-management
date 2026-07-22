package com.leave.leavemanagement.repository;

import com.leave.leavemanagement.entity.Employee;
import com.leave.leavemanagement.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmailIgnoreCase(String email);

    List<Employee> findByDepartment(String department);

    List<Employee> findByDesignation(String designation);

    List<Employee> findByRole(Role role);

}