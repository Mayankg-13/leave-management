# 🌴 LeaveFlow - Employee Leave Management System (Spring Boot + React)

A full-stack **Employee Leave Management System** built with **Spring Boot 3**, **Spring Security (JWT)**, **Spring Data JPA**, and **React**. Designed to be simple, robust, visually stunning, and easy to explain during technical interviews (e.g. **Cognizant Full Stack / Java Developer Interview**).

---

## 🚀 Quick Start (Zero Setup Required)

Launch both backend and frontend together with a single Maven command:

```bash
# In project root directory
./mvnw spring-boot:run
```

- **Web Application URL**: `http://localhost:8080`
- **H2 Database Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:leave_db`, Username: `sa`, Password: leave blank)

---

## 🔑 Pre-Loaded Demo Credentials

The application automatically seeds initial data on startup:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@company.com` | `admin123` | **Rohan Verma (Admin)** - HR Director (Access to all leave approvals & employee directory) |
| **EMPLOYEE** | `mayank@company.com` | `user123` | **Mayank Gomase** - Full Stack Developer (20 Days Leave Balance) |
| **EMPLOYEE** | `ananya@company.com` | `user123` | **Ananya Gupta** - UI/UX Designer (14 Days Leave Balance) |

*(Quick demo buttons are available directly on the login screen for instant 1-click access during demos!)*

---

## ✨ Features Overview

### 👨‍💼 Employee Portal
- **Dashboard & Stats**: View real-time available leave balance, total applied leaves, approved count, and pending requests.
- **Apply for Leave**: Modal form supporting multiple leave types (*Casual, Sick, Earned, Maternity, Paternity*), date range selection with auto-calculated duration, and reason description.
- **Validation**: Automatically prevents requesting leaves exceeding available balance or setting end dates before start dates.
- **Leave History**: Filterable history table with real-time status badges (*Pending*, *Approved*, *Rejected*).

### 🛠️ Admin Portal
- **System Metrics**: Overview cards for total staff count, pending approvals queue, approved requests, and total applications.
- **Pending Approvals Manager**: High-priority approval queue with 1-click **Approve** (deducts employee leave balance in real-time) and **Reject** buttons.
- **Employee Directory**: Register new employees, edit employee details, and view current leave balances across all departments.

---

## 🛠️ Technology Stack

- **Backend**: Java 17/22, Spring Boot 3.5.5, Spring Data JPA, Spring Security 6, JWT (`io.jsonwebtoken 0.11.5`), H2 Database (with MySQL compatibility), Lombok, Bean Validation.
- **Frontend**: React 18 SPA, HTML5, Vanilla CSS3 (Custom Design System with Inter Typography & Glassmorphism), FontAwesome Icons.
- **Build Tool**: Apache Maven (`mvnw`).

---



## 📁 Repository Directory Structure

```
leave-management/
├── pom.xml                                    # Maven Dependencies & Build Config
├── README.md                                  # Project Documentation & Interview Guide
├── src/
│   ├── main/
│   │   ├── java/com/leave/leavemanagement/
│   │   │   ├── config/                        # SecurityConfig, DataInitializer
│   │   │   ├── controller/                    # AuthController, EmployeeController, LeaveRequestController
│   │   │   ├── dto/                           # LoginRequest, LoginResponse, EmployeeDTO, LeaveRequestDto
│   │   │   ├── entity/                        # Employee, LeaveRequest, Role, Enums
│   │   │   ├── exception/                     # GlobalExceptionHandler, ResourceNotFoundException
│   │   │   ├── repository/                    # EmployeeRepository, LeaveRequestRepository
│   │   │   ├── security/                      # CustomUserDetails, CustomUserDetailsService
│   │   │   │   └── jwt/                       # JwtAuthenticationFilter, JwtService
│   │   │   └── service/                       # EmployeeService, EmployeeServiceImpl, LeaveRequestService
│   │   └── resources/
│   │       ├── application.properties         # Spring Config (H2 / MySQL)
│   │       └── static/                        # Embedded React SPA
│   │           ├── index.html
│   │           ├── css/styles.css
│   │           └── js/app.js
└── frontend/                                  # React Frontend Source Directory
    └── src/
        ├── App.jsx
        └── index.css
```

---

## 🌐 Deploy on Render (Free Demo URL for Resume)

This project includes a **Dockerfile** and **render.yaml Blueprint** for easy 1-click deployment on [Render.com](https://render.com).

### Steps to Deploy:
1. **Push Changes to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Render deployment setup"
   git push origin main
   ```
2. **Log in to Render**:
   - Open [dashboard.render.com](https://dashboard.render.com/) and log in with your GitHub account.
3. **Create a New Web Service**:
   - Click **New +** -> **Web Service**.
   - Connect your `leave-management` GitHub repository.
   - Render will auto-detect the `Dockerfile`.
   - Select **Free Plan**.
4. **Deploy**:
   - Click **Deploy Web Service**.
   - Once deployed (approx 2–3 minutes), Render will provide your live URL (e.g., `https://leave-management-system.onrender.com`).
5. **Add to Resume**:
   - Add your live URL under **Projects** in your resume!

