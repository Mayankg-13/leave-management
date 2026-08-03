const { useState, useEffect, createContext, useContext } = React;

// Centralized API Configuration
const API_BASE = '/api';

const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('leave_app_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem('leave_app_token');
        localStorage.removeItem('leave_app_user');
        window.location.reload();
        throw new Error("Session expired. Please log in again.");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const errorMsg = data.message || (typeof data === 'object' ? Object.values(data).join(', ') : 'Request failed');
        throw new Error(errorMsg);
    }
    return data;
};

// Main App Root Component
function App() {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('leave_app_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('leave_app_token'));
    const [activeTab, setActiveTab] = useState('dashboard');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleLogin = (loginData) => {
        setToken(loginData.token);
        setUser(loginData);
        localStorage.setItem('leave_app_token', loginData.token);
        localStorage.setItem('leave_app_user', JSON.stringify(loginData));
        showToast(`Welcome back, ${loginData.name}!`);
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('leave_app_token');
        localStorage.removeItem('leave_app_user');
    };

    const refreshUserProfile = async () => {
        try {
            const updatedUser = await apiCall('/auth/me');
            setUser(prev => {
                const newObj = { ...prev, ...updatedUser };
                localStorage.setItem('leave_app_user', JSON.stringify(newObj));
                return newObj;
            });
        } catch (e) {
            console.error("Failed to refresh user profile:", e);
        }
    };

    if (!token || !user) {
        return <LoginView onLogin={handleLogin} />;
    }

    const isAdmin = user.role === 'ADMIN';

    return (
        <div className="app-layout">
            {/* Header Navigation */}
            <nav className="navbar">
                <div className="brand">
                    <div className="brand-icon">
                        <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <span>LeaveFlow</span>
                </div>
                <div className="nav-user">
                    <div className="user-badge">
                        <div className="avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                        <div>
                            <div style={{ fontWeight: 600 }}>{user.name}</div>
                            <div style={{ fontSize: '0.725rem', opacity: 0.8 }}>{user.department}</div>
                        </div>
                        <span className={`role-pill ${isAdmin ? 'role-admin' : 'role-employee'}`}>
                            {user.role}
                        </span>
                    </div>
                    <button className="btn-logout" onClick={handleLogout} title="Logout">
                        <i className="fa-solid fa-right-from-bracket"></i>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container">
                {/* Toast Notification */}
                {toast && (
                    <div className={`alert alert-${toast.type === 'error' ? 'danger' : 'success'}`}>
                        <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
                        {toast.message}
                    </div>
                )}

                {/* Sub Navigation Tabs */}
                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <i className="fa-solid fa-chart-pie"></i> Dashboard
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leaves')}
                    >
                        <i className="fa-solid fa-list-check"></i> {isAdmin ? 'All Leave Requests' : 'My Leave History'}
                    </button>
                    {isAdmin && (
                        <button 
                            className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
                            onClick={() => setActiveTab('employees')}
                        >
                            <i className="fa-solid fa-users"></i> Employee Directory
                        </button>
                    )}
                </div>

                {/* Main Views */}
                {activeTab === 'dashboard' && (
                    isAdmin ? (
                        <AdminDashboard showToast={showToast} refreshUser={refreshUserProfile} />
                    ) : (
                        <EmployeeDashboard user={user} showToast={showToast} refreshUser={refreshUserProfile} />
                    )
                )}

                {activeTab === 'leaves' && (
                    <LeaveRequestsView user={user} isAdmin={isAdmin} showToast={showToast} refreshUser={refreshUserProfile} />
                )}

                {activeTab === 'employees' && isAdmin && (
                    <EmployeeManagementView showToast={showToast} />
                )}
            </div>
        </div>
    );
}

// 1. Login Component
function LoginView({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            onLogin(response);
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (demoEmail, demoPass) => {
        setEmail(demoEmail);
        setPassword(demoPass);
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-brand-icon">
                        <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <h2>LeaveFlow Portal</h2>
                    <p>Enter your credentials to manage leave requests</p>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="mayank@company.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-right-to-bracket"></i>}
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                {/* Quick Demo Credentials Buttons for Interview Demo */}
                <div className="demo-credentials">
                    <div className="demo-title">Quick Demo Logins (Click to Fill)</div>
                    <div className="demo-btns">
                        <button type="button" className="demo-btn" onClick={() => fillDemo('admin@company.com', 'admin123')}>
                            <div className="demo-role"><i className="fa-solid fa-user-shield"></i> Admin (Rohan)</div>
                            <div className="demo-email">admin@company.com</div>
                        </button>
                        <button type="button" className="demo-btn" onClick={() => fillDemo('mayank@company.com', 'user123')}>
                            <div className="demo-role" style={{ color: '#10b981' }}><i className="fa-solid fa-user"></i> Employee (Mayank)</div>
                            <div className="demo-email">mayank@company.com</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 2. Employee Dashboard Component
function EmployeeDashboard({ user, showToast, refreshUser }) {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchMyLeaves = async () => {
        setLoading(true);
        try {
            const data = await apiCall('/leaves/my-leaves');
            setLeaves(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyLeaves();
        refreshUser();
    }, []);

    const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
    const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
    const rejectedCount = leaves.filter(l => l.status === 'REJECTED').length;

    return (
        <div>
            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon icon-purple">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <div className="stat-info">
                        <h4>Leave Balance</h4>
                        <div className="stat-value" style={{ color: '#4f46e5' }}>{user.leaveBalance || 0} Days</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon icon-amber">
                        <i className="fa-solid fa-hourglass-half"></i>
                    </div>
                    <div className="stat-info">
                        <h4>Pending Requests</h4>
                        <div className="stat-value">{pendingCount}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon icon-green">
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div className="stat-info">
                        <h4>Approved Leaves</h4>
                        <div className="stat-value">{approvedCount}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon icon-red">
                        <i className="fa-solid fa-circle-xmark"></i>
                    </div>
                    <div className="stat-info">
                        <h4>Rejected</h4>
                        <div className="stat-value">{rejectedCount}</div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="section-header">
                <div className="section-title">
                    <i className="fa-solid fa-clock-rotate-left"></i> Recent Leave Applications
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <i className="fa-solid fa-plus"></i> Apply for Leave
                </button>
            </div>

            {/* Recent Leaves Table */}
            <LeaveTable leaves={leaves.slice(0, 5)} loading={loading} />

            {/* Modal Form */}
            {showModal && (
                <ApplyLeaveModal 
                    user={user} 
                    onClose={() => setShowModal(false)} 
                    onSuccess={() => {
                        setShowModal(false);
                        fetchMyLeaves();
                        refreshUser();
                        showToast("Leave request submitted successfully!");
                    }} 
                />
            )}
        </div>
    );
}

// 3. Admin Dashboard Component
function AdminDashboard({ showToast, refreshUser }) {
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pendingRes, allRes, empRes] = await Promise.all([
                apiCall('/leaves/pending'),
                apiCall('/leaves'),
                apiCall('/employees')
            ]);
            setPendingLeaves(pendingRes);
            setAllLeaves(allRes);
            setEmployees(empRes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await apiCall(`/leaves/${id}/approve`, { method: 'PUT' });
            showToast("Leave request APPROVED successfully!");
            loadData();
            refreshUser();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            await apiCall(`/leaves/${id}/reject`, { method: 'PUT' });
            showToast("Leave request REJECTED", 'error');
            loadData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const totalApproved = allLeaves.filter(l => l.status === 'APPROVED').length;

    return (
        <div>
            {/* Admin Metrics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon icon-blue">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <div className="stat-info">
                        <h4>Total Staff</h4>
                        <div className="stat-value">{employees.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon icon-amber">
                        <i className="fa-solid fa-bell"></i>
                    </div>
                    <div className="stat-info">
                        <h4>Pending Approvals</h4>
                        <div className="stat-value" style={{ color: '#d97706' }}>{pendingLeaves.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon icon-green">
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div className="stat-info">
                        <h4>Total Approved</h4>
                        <div className="stat-value">{totalApproved}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon icon-purple">
                        <i className="fa-solid fa-layer-group"></i>
                    </div>
                    <div className="stat-info">
                        <h4>Total Applications</h4>
                        <div className="stat-value">{allLeaves.length}</div>
                    </div>
                </div>
            </div>

            {/* Pending Approvals Action Section */}
            <div className="section-header">
                <div className="section-title">
                    <i className="fa-solid fa-clock-rotate-left"></i> Pending Leave Approvals
                </div>
            </div>

            <div className="card-table" style={{ marginBottom: '2rem' }}>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Type</th>
                            <th>Date Range</th>
                            <th>Reason</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>
                        ) : pendingLeaves.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-state">
                                    <i className="fa-solid fa-circle-check"></i>
                                    <div>No pending leave approvals! All caught up.</div>
                                </td>
                            </tr>
                        ) : (
                            pendingLeaves.map(leave => (
                                <tr key={leave.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{leave.employee?.name || 'N/A'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{leave.employee?.email}</div>
                                    </td>
                                    <td>{leave.employee?.department || 'N/A'}</td>
                                    <td><span className="type-badge">{leave.leaveType}</span></td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{leave.startDate} to {leave.endDate}</div>
                                    </td>
                                    <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>{leave.reason}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-success" onClick={() => handleApprove(leave.id)}>
                                                <i className="fa-solid fa-check"></i> Approve
                                            </button>
                                            <button className="btn-danger" onClick={() => handleReject(leave.id)}>
                                                <i className="fa-solid fa-xmark"></i> Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// 4. Leave Requests View (All or Filtered)
function LeaveRequestsView({ user, isAdmin, showToast, refreshUser }) {
    const [leaves, setLeaves] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const endpoint = isAdmin ? '/leaves' : '/leaves/my-leaves';
            const data = await apiCall(endpoint);
            setLeaves(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [isAdmin]);

    const filteredLeaves = leaves.filter(l => filter === 'ALL' || l.status === filter);

    return (
        <div>
            <div className="section-header">
                <div className="section-title">
                    <i className="fa-solid fa-list-check"></i> {isAdmin ? 'All Company Leave Requests' : 'My Leave Application History'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
                        <button 
                            key={st}
                            className={`tab-btn ${filter === st ? 'active' : ''}`}
                            onClick={() => setFilter(st)}
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            <LeaveTable leaves={filteredLeaves} loading={loading} showEmployee={isAdmin} />
        </div>
    );
}

// Reusable Leave Table Component
function LeaveTable({ leaves, loading, showEmployee = false }) {
    return (
        <div className="card-table">
            <table className="custom-table">
                <thead>
                    <tr>
                        {showEmployee && <th>Employee</th>}
                        <th>Leave Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>
                    ) : leaves.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="empty-state">
                                <i className="fa-solid fa-folder-open"></i>
                                <div>No leave records found</div>
                            </td>
                        </tr>
                    ) : (
                        leaves.map(leave => (
                            <tr key={leave.id}>
                                {showEmployee && (
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{leave.employee?.name || 'N/A'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{leave.employee?.department}</div>
                                    </td>
                                )}
                                <td><span className="type-badge">{leave.leaveType}</span></td>
                                <td>{leave.startDate}</td>
                                <td>{leave.endDate}</td>
                                <td style={{ maxWidth: '260px' }}>{leave.reason}</td>
                                <td>
                                    <span className={`badge badge-${leave.status.toLowerCase()}`}>
                                        <i className={`fa-solid ${
                                            leave.status === 'APPROVED' ? 'fa-check' :
                                            leave.status === 'REJECTED' ? 'fa-xmark' : 'fa-clock'
                                        }`}></i>
                                        {leave.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// 5. Employee Management View (Admin Only)
function EmployeeManagementView({ showToast }) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await apiCall('/employees');
            setEmployees(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (emp) => {
        if (window.confirm(`Are you sure you want to delete employee "${emp.name}" (${emp.email})?`)) {
            try {
                await apiCall(`/employees/${emp.id}`, { method: 'DELETE' });
                showToast(`Employee "${emp.name}" deleted successfully!`);
                fetchEmployees();
            } catch (err) {
                showToast(err.message || "Failed to delete employee", 'error');
            }
        }
    };

    return (
        <div>
            <div className="section-header">
                <div className="section-title">
                    <i className="fa-solid fa-users"></i> Employee Directory & Leave Balances
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    <i className="fa-solid fa-user-plus"></i> Add New Employee
                </button>
            </div>

            <div className="card-table">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Leave Balance</th>
                            <th>System Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>
                        ) : (
                            employees.map(emp => (
                                <tr key={emp.id}>
                                    <td>#{emp.id}</td>
                                    <td style={{ fontWeight: 600 }}>{emp.name}</td>
                                    <td>{emp.email}</td>
                                    <td>{emp.department}</td>
                                    <td>{emp.designation}</td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: '#4f46e5' }}>{emp.leaveBalance} Days</span>
                                    </td>
                                    <td>
                                        <span className={`role-pill ${emp.role === 'ADMIN' ? 'role-admin' : 'role-employee'}`}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-danger" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => handleDelete(emp)} title="Delete Employee">
                                            <i className="fa-solid fa-trash"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <AddEmployeeModal 
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchEmployees();
                        showToast("New employee added successfully!");
                    }}
                />
            )}
        </div>
    );
}

// 6. Apply Leave Modal
function ApplyLeaveModal({ user, onClose, onSuccess }) {
    const [leaveType, setLeaveType] = useState('CASUAL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const calculateDays = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) return 0;
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
    };

    const daysRequested = calculateDays();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (daysRequested <= 0) {
            setError("End date cannot be before start date.");
            return;
        }

        if (daysRequested > user.leaveBalance) {
            setError(`Requested days (${daysRequested}) exceeds your available balance (${user.leaveBalance} days).`);
            return;
        }

        setLoading(true);
        try {
            await apiCall('/leaves', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId: user.id,
                    leaveType,
                    startDate,
                    endDate,
                    reason
                })
            });
            onSuccess();
        } catch (err) {
            setError(err.message || "Failed to submit leave request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Apply For Leave</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="form-group">
                            <label>Leave Type</label>
                            <select className="form-control" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                                <option value="CASUAL">Casual Leave</option>
                                <option value="SICK">Sick Leave</option>
                                <option value="EARNED">Earned Leave</option>
                                <option value="MATERNITY">Maternity Leave</option>
                                <option value="PATERNITY">Paternity Leave</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        {daysRequested > 0 && (
                            <div style={{ background: '#eef2ff', padding: '0.65rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', color: '#4338ca', fontWeight: 600 }}>
                                <i className="fa-solid fa-calculator"></i> Duration: {daysRequested} Day(s) (Available: {user.leaveBalance} Days)
                            </div>
                        )}

                        <div className="form-group">
                            <label>Reason for Leave</label>
                            <textarea 
                                className="form-control" 
                                rows="3" 
                                placeholder="State clear reason for leave..."
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)} 
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// 7. Add Employee Modal (Admin Only)
function AddEmployeeModal({ onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState('Engineering');
    const [designation, setDesignation] = useState('Software Engineer');
    const [leaveBalance, setLeaveBalance] = useState(20);
    const [role, setRole] = useState('EMPLOYEE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiCall('/employees', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    department,
                    designation,
                    leaveBalance: parseInt(leaveBalance),
                    role
                })
            });
            onSuccess();
        } catch (err) {
            setError(err.message || "Failed to create employee");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Register New Employee</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" className="form-control" placeholder="e.g. Alice Walker" value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" className="form-control" placeholder="alice@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Department</label>
                                <input type="text" className="form-control" value={department} onChange={e => setDepartment(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Designation</label>
                                <input type="text" className="form-control" value={designation} onChange={e => setDesignation(e.target.value)} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Initial Leave Balance</label>
                                <input type="number" min="0" className="form-control" value={leaveBalance} onChange={e => setLeaveBalance(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="EMPLOYEE">EMPLOYEE</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
                            Save Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Render React Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
