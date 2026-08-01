package com.leave.leavemanagement.service;

import com.leave.leavemanagement.entity.Employee;
import com.leave.leavemanagement.exception.ResourceNotFoundException;
import com.leave.leavemanagement.repository.EmployeeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Employee saveEmployee(Employee employee) {
        String cleanEmail = (employee.getEmail() != null) ? employee.getEmail().trim().toLowerCase() : "";
        employee.setEmail(cleanEmail);

        if (employeeRepository.findByEmailIgnoreCase(cleanEmail).isPresent()) {
            throw new IllegalArgumentException("Employee with email '" + cleanEmail + "' already exists.");
        }

        if (employee.getPassword() != null && !employee.getPassword().isBlank()) {
            employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        }

        return employeeRepository.save(employee);
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }

    @Override
    public Employee updateEmployee(Long id, Employee employee) {
        Employee existingEmployee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));

        existingEmployee.setName(employee.getName());
        
        String cleanEmail = (employee.getEmail() != null) ? employee.getEmail().trim().toLowerCase() : existingEmployee.getEmail();
        existingEmployee.setEmail(cleanEmail);
        
        if (employee.getPassword() != null && !employee.getPassword().isBlank()) {
            existingEmployee.setPassword(passwordEncoder.encode(employee.getPassword()));
        }
        
        existingEmployee.setDepartment(employee.getDepartment());
        existingEmployee.setDesignation(employee.getDesignation());
        existingEmployee.setLeaveBalance(employee.getLeaveBalance());
        existingEmployee.setRole(employee.getRole());

        return employeeRepository.save(existingEmployee);
    }

    @Override
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete: Employee not found with ID: " + id);
        }
        employeeRepository.deleteById(id);
    }
}