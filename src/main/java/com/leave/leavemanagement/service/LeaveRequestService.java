package com.leave.leavemanagement.service;

import com.leave.leavemanagement.dto.LeaveRequestDto;
import com.leave.leavemanagement.entity.Employee;
import com.leave.leavemanagement.entity.LeaveRequest;
import com.leave.leavemanagement.entity.enums.LeaveStatus;
import com.leave.leavemanagement.exception.ResourceNotFoundException;
import com.leave.leavemanagement.repository.EmployeeRepository;
import com.leave.leavemanagement.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveRequestService(
            LeaveRequestRepository leaveRequestRepository,
            EmployeeRepository employeeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
    }

    public LeaveRequest applyLeave(LeaveRequestDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + dto.getEmployeeId()));

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        long daysRequested = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;
        if (employee.getLeaveBalance() < daysRequested) {
            throw new IllegalArgumentException("Requested days (" + daysRequested + ") exceeds remaining leave balance (" + employee.getLeaveBalance() + ")");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(dto.getLeaveType());
        leaveRequest.setStartDate(dto.getStartDate());
        leaveRequest.setEndDate(dto.getEndDate());
        leaveRequest.setReason(dto.getReason());
        leaveRequest.setStatus(LeaveStatus.PENDING);

        return leaveRequestRepository.save(leaveRequest);
    }

    public List<LeaveRequest> getAllLeaves() {
        return leaveRequestRepository.findAll();
    }

    public LeaveRequest getLeaveById(Long id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Request not found with ID: " + id));
    }

    public List<LeaveRequest> getLeavesByEmployeeId(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    public List<LeaveRequest> getPendingLeaves() {
        return leaveRequestRepository.findByStatus(LeaveStatus.PENDING);
    }

    public LeaveRequest approveLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Request not found with ID: " + leaveId));

        if (leaveRequest.getStatus() == LeaveStatus.APPROVED) {
            throw new IllegalStateException("Leave Request is already approved");
        }

        Employee employee = leaveRequest.getEmployee();
        long leaveDays = calculateLeaveDays(leaveRequest);

        if (employee.getLeaveBalance() < leaveDays) {
            throw new IllegalStateException("Insufficient leave balance for employee (" + employee.getLeaveBalance() + " days available, " + leaveDays + " required)");
        }

        employee.setLeaveBalance(employee.getLeaveBalance() - (int) leaveDays);
        leaveRequest.setStatus(LeaveStatus.APPROVED);

        employeeRepository.save(employee);
        return leaveRequestRepository.save(leaveRequest);
    }

    public LeaveRequest rejectLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Request not found with ID: " + leaveId));

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        return leaveRequestRepository.save(leaveRequest);
    }

    public long calculateLeaveDays(LeaveRequest leaveRequest) {
        if (leaveRequest.getStartDate() == null || leaveRequest.getEndDate() == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;
    }
}