import React, { useState, useEffect } from 'react';
import './index.css';

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

export default function App() {
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
                {toast && (
                    <div className={`alert alert-${toast.type === 'error' ? 'danger' : 'success'}`}>
                        <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
                        {toast.message}
                    </div>
                )}

                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <i className="fa-solid fa-chart-pie"></i> Dashboard
                    </button>
                    <button className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>
                        <i className="fa-solid fa-list-check"></i> {isAdmin ? 'All Leave Requests' : 'My Leave History'}
                    </button>
                    {isAdmin && (
                        <button className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
                            <i className="fa-solid fa-users"></i> Employee Directory
                        </button>
                    )}
                </div>

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

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-brand-icon"><i className="fa-solid fa-calendar-check"></i></div>
                    <h2>LeaveFlow Portal</h2>
                    <p>Enter your credentials to manage leave requests</p>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="form-control" placeholder="john@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

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

    return (
        <div>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon icon-purple"><i className="fa-solid fa-clock-rotate-left"></i></div>
                    <div className="stat-info">
                        <h4>Leave Balance</h4>
                        <div className="stat-value">{user.leaveBalance || 0} Days</div>
                    </div>
                </div>
            </div>
            <div className="section-header">
                <div className="section-title">Recent Leave Applications</div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Apply for Leave</button>
            </div>
            {showModal && <ApplyLeaveModal user={user} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchMyLeaves(); refreshUser(); showToast("Submitted!"); }} />}
        </div>
    );
}

function AdminDashboard({ showToast, refreshUser }) { return <div>Admin Dashboard</div>; }
function LeaveRequestsView({ user, isAdmin, showToast, refreshUser }) { return <div>Leave Requests View</div>; }
function EmployeeManagementView({ showToast }) { return <div>Employee Management</div>; }
function ApplyLeaveModal({ user, onClose, onSuccess }) { return <div>Apply Leave Modal</div>; }
