package com.leave.leavemanagement.controller;

import com.leave.leavemanagement.dto.LeaveRequestDto;
import com.leave.leavemanagement.entity.Employee;
import com.leave.leavemanagement.entity.LeaveRequest;
import com.leave.leavemanagement.exception.ResourceNotFoundException;
import com.leave.leavemanagement.repository.EmployeeRepository;
import com.leave.leavemanagement.service.LeaveRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;
    private final EmployeeRepository employeeRepository;

    public LeaveRequestController(LeaveRequestService leaveRequestService,
                                  EmployeeRepository employeeRepository) {
        this.leaveRequestService = leaveRequestService;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping
    public ResponseEntity<LeaveRequest> applyLeave(@Valid @RequestBody LeaveRequestDto dto, Authentication authentication) {
        if (dto.getEmployeeId() == null && authentication != null) {
            String email = authentication.getName();
            Employee employee = employeeRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            dto.setEmployeeId(employee.getId());
        }

        LeaveRequest leaveRequest = leaveRequestService.applyLeave(dto);
        return ResponseEntity.ok(leaveRequest);
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getAllLeaves() {
        return ResponseEntity.ok(leaveRequestService.getAllLeaves());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequest> getLeaveById(@PathVariable Long id) {
        return ResponseEntity.ok(leaveRequestService.getLeaveById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequest>> getLeavesByEmployeeId(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveRequestService.getLeavesByEmployeeId(employeeId));
    }

    @GetMapping("/my-leaves")
    public ResponseEntity<List<LeaveRequest>> getMyLeaves(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        Employee employee = employeeRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return ResponseEntity.ok(leaveRequestService.getLeavesByEmployeeId(employee.getId()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveRequest>> getPendingLeaves() {
        return ResponseEntity.ok(leaveRequestService.getPendingLeaves());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveRequest> approveLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveRequestService.approveLeave(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveRequest> rejectLeave(@PathVariable Long id) {
        return ResponseEntity.ok(leaveRequestService.rejectLeave(id));
    }
}