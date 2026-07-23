package com.leave.leavemanagement.repository;

import com.leave.leavemanagement.entity.LeaveRequest;
import com.leave.leavemanagement.entity.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByStatus(LeaveStatus status);

    List<LeaveRequest> findByEmployeeId(Long employeeId);

}