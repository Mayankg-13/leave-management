package com.leave.leavemanagement.config;

import com.leave.leavemanagement.entity.Employee;
import com.leave.leavemanagement.entity.LeaveRequest;
import com.leave.leavemanagement.entity.Role;
import com.leave.leavemanagement.entity.enums.LeaveStatus;
import com.leave.leavemanagement.entity.enums.LeaveType;
import com.leave.leavemanagement.repository.EmployeeRepository;
import com.leave.leavemanagement.repository.LeaveRequestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(EmployeeRepository employeeRepository,
                           LeaveRequestRepository leaveRequestRepository,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (employeeRepository.count() == 0) {
            // 1. Create Admin Employee (Rohan Verma)
            Employee admin = Employee.builder()
                    .name("Rohan Verma (Admin)")
                    .email("admin@company.com")
                    .password(passwordEncoder.encode("admin123"))
                    .department("Human Resources")
                    .designation("HR Director")
                    .leaveBalance(30)
                    .role(Role.ADMIN)
                    .build();
            admin = employeeRepository.save(admin);

            // 2. Create Employee 1 (Mayank Gomase)
            Employee emp1 = Employee.builder()
                    .name("Mayank Gomase")
                    .email("mayank@company.com")
                    .password(passwordEncoder.encode("user123"))
                    .department("Engineering")
                    .designation("Full Stack Developer")
                    .leaveBalance(20)
                    .role(Role.EMPLOYEE)
                    .build();
            emp1 = employeeRepository.save(emp1);

            // 3. Create Employee 2 (Ananya Gupta)
            Employee emp2 = Employee.builder()
                    .name("Ananya Gupta")
                    .email("ananya@company.com")
                    .password(passwordEncoder.encode("user123"))
                    .department("Product Design")
                    .designation("UI/UX Designer")
                    .leaveBalance(14)
                    .role(Role.EMPLOYEE)
                    .build();
            emp2 = employeeRepository.save(emp2);

            // 4. Create Sample Leave Requests
            LeaveRequest req1 = new LeaveRequest();
            req1.setEmployee(emp1);
            req1.setLeaveType(LeaveType.CASUAL);
            req1.setStartDate(LocalDate.now().plusDays(2));
            req1.setEndDate(LocalDate.now().plusDays(4));
            req1.setReason("Family function in hometown");
            req1.setStatus(LeaveStatus.PENDING);
            leaveRequestRepository.save(req1);

            LeaveRequest req2 = new LeaveRequest();
            req2.setEmployee(emp1);
            req2.setLeaveType(LeaveType.SICK);
            req2.setStartDate(LocalDate.now().minusDays(10));
            req2.setEndDate(LocalDate.now().minusDays(8));
            req2.setReason("Fever and doctor recommended rest");
            req2.setStatus(LeaveStatus.APPROVED);
            leaveRequestRepository.save(req2);

            LeaveRequest req3 = new LeaveRequest();
            req3.setEmployee(emp2);
            req3.setLeaveType(LeaveType.EARNED);
            req3.setStartDate(LocalDate.now().plusDays(5));
            req3.setEndDate(LocalDate.now().plusDays(10));
            req3.setReason("Annual vacation trip");
            req3.setStatus(LeaveStatus.PENDING);
            leaveRequestRepository.save(req3);

            System.out.println(">>> Demo data successfully initialized: Admin Rohan (admin@company.com / admin123), Employee Mayank Gomase (mayank@company.com / user123), Employee Ananya (ananya@company.com / user123)");
        }
    }
}
