'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    department: string;
    isActive: boolean;
    createdAt: string;
    lastLogin: string | null;
    violationCount: number;
    activityCount: number;
}

const roleConfig: Record<string, { label: string; color: 'normal' | 'warning' | 'critical' }> = {
    EXECUTIVE: { label: 'Executive', color: 'critical' },
    SYSTEM_ADMIN: { label: 'Sys Admin', color: 'critical' },
    IT_SECURITY: { label: 'IT Security', color: 'warning' },
    COMPLIANCE_OFFICER: { label: 'Compliance', color: 'warning' },
    AUDITOR: { label: 'Auditor', color: 'normal' },
    ARCHIVIST: { label: 'Archivist', color: 'normal' },
};

const ITEMS_PER_PAGE = 15;

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'ARCHIVIST', department: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // Filter users
    const filteredUsers = users.filter(u => {
        const matchSearch = search === '' ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.department.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        const matchDept = departmentFilter === 'all' || u.department === departmentFilter;
        const matchStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && u.isActive) ||
            (statusFilter === 'inactive' && !u.isActive);
        return matchSearch && matchRole && matchDept && matchStatus;
    });

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter, departmentFilter, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    // Stats
    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        withViolations: users.filter(u => u.violationCount > 0).length,
        highRisk: users.filter(u => u.violationCount > 10).length,
    };

    // Unique departments and roles for filters
    const departments = [...new Set(users.map(u => u.department))].sort();
    const roles = [...new Set(users.map(u => u.role))].sort();

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getTimeAgo = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    const getRiskLevel = (violationCount: number): 'normal' | 'warning' | 'critical' => {
        if (violationCount > 10) return 'critical';
        if (violationCount > 5) return 'warning';
        return 'normal';
    };

    const handleRowClick = (user: User) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleEditClick = (user: User, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            password: ''
        });
        setShowEditModal(true);
    };

    const handleCreateClick = () => {
        setSelectedUser(null);
        setFormData({ name: '', email: '', role: 'ARCHIVIST', department: '', password: '' });
        setShowEditModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = '/api/users';
            const method = selectedUser ? 'PATCH' : 'POST';
            const body = selectedUser
                ? { ...formData, id: selectedUser.id, password: formData.password || undefined }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();
            if (json.success) {
                showToast('success', selectedUser ? 'User updated successfully' : 'User created successfully');
                setShowEditModal(false);
                fetchUsers();
            } else {
                showToast('error', json.error || 'Operation failed');
            }
        } catch {
            showToast('error', 'System error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (user: User, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, isActive: !user.isActive })
            });
            if (res.ok) {
                showToast('success', user.isActive ? 'User deactivated' : 'User activated');
                fetchUsers();
            }
        } catch {
            showToast('error', 'Failed to update user');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Personnel Management" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Loading users...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Personnel Management" subtitle="User Access & Risk Intelligence">
            <div className={styles.container}>
                {/* Toast */}
                {toast && (
                    <div className={`${styles.toast} ${styles[toast.type]}`}>
                        {toast.type === 'success' ? '✓' : '✗'} {toast.message}
                    </div>
                )}

                {/* Controls */}
                <section className={styles.controls}>
                    <div className={styles.searchBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, email, department..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Roles</option>
                            {roles.map(r => <option key={r} value={r}>{roleConfig[r]?.label || r}</option>)}
                        </select>
                        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <Button variant="primary" size="sm" onClick={handleCreateClick}>+ Add User</Button>
                </section>

                {/* Stats Row */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Users</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.success}`}>
                        <span className={styles.statValue}>{stats.active}</span>
                        <span className={styles.statLabel}>Active</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.warning}`}>
                        <span className={styles.statValue}>{stats.withViolations}</span>
                        <span className={styles.statLabel}>With Violations</span>
                    </div>
                    <div className={`${styles.statCard} ${stats.highRisk > 0 ? styles.critical : ''}`}>
                        <span className={styles.statValue}>{stats.highRisk}</span>
                        <span className={styles.statLabel}>High Risk</span>
                    </div>
                </section>

                {/* Table */}
                <Card noPadding>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Violations</th>
                                    <th>Last Login</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.length === 0 ? (
                                    <tr><td colSpan={7} className={styles.emptyRow}>No users found</td></tr>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <tr key={user.id} className={styles.row} onClick={() => handleRowClick(user)}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <div className={styles.avatar}>{user.name.charAt(0)}</div>
                                                    <div className={styles.userInfo}>
                                                        <span className={styles.userName}>{user.name}</span>
                                                        <span className={styles.userEmail}>{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <StatusBadge
                                                    status={roleConfig[user.role]?.color || 'normal'}
                                                    label={roleConfig[user.role]?.label || user.role}
                                                    size="sm"
                                                />
                                            </td>
                                            <td><span className={styles.department}>{user.department}</span></td>
                                            <td>
                                                <StatusBadge
                                                    status={user.isActive ? 'normal' : 'critical'}
                                                    label={user.isActive ? 'Active' : 'Inactive'}
                                                    size="sm"
                                                />
                                            </td>
                                            <td>
                                                {user.violationCount > 0 ? (
                                                    <StatusBadge
                                                        status={getRiskLevel(user.violationCount)}
                                                        label={`${user.violationCount} violations`}
                                                        size="sm"
                                                    />
                                                ) : (
                                                    <span className={styles.noViolations}>Clean</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.dateCell}>
                                                    <span className={styles.date}>{formatDate(user.lastLogin)}</span>
                                                    <span className={styles.timeAgo}>{getTimeAgo(user.lastLogin)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons} onClick={(e) => e.stopPropagation()}>
                                                    <button className={styles.actionBtn} onClick={(e) => handleEditClick(user, e)} title="Edit">✏️</button>
                                                    <button className={styles.actionBtn} onClick={(e) => handleToggleStatus(user, e)} title={user.isActive ? 'Deactivate' : 'Activate'}>
                                                        {user.isActive ? '🚫' : '✅'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                        </div>
                        <div className={styles.paginationControls}>
                            <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹ Prev</button>
                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button key={idx} className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                                ) : (
                                    <span key={idx} className={styles.pageEllipsis}>{page}</span>
                                )
                            ))}
                            <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next ›</button>
                        </div>
                    </div>
                )}

                {/* View Detail Modal */}
                {showModal && selectedUser && (
                    <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div className={styles.modalTitle}>
                                    <h2>User Details</h2>
                                    <StatusBadge status={selectedUser.isActive ? 'normal' : 'critical'} label={selectedUser.isActive ? 'Active' : 'Inactive'} />
                                </div>
                                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                            </div>
                            <div className={styles.modalBody}>
                                {/* User Profile Header */}
                                <div className={styles.profileHeader}>
                                    <div className={styles.profileAvatar}>{selectedUser.name.charAt(0)}</div>
                                    <div className={styles.profileInfo}>
                                        <h3>{selectedUser.name}</h3>
                                        <span className={styles.profileEmail}>{selectedUser.email}</span>
                                        <StatusBadge status={roleConfig[selectedUser.role]?.color || 'normal'} label={roleConfig[selectedUser.role]?.label || selectedUser.role} />
                                    </div>
                                </div>

                                {/* Detail Grid */}
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Department</span>
                                        <span className={styles.detailValue}>{selectedUser.department}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Role</span>
                                        <span className={styles.detailValue}>{roleConfig[selectedUser.role]?.label || selectedUser.role}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Email</span>
                                        <span className={styles.detailValue}>{selectedUser.email}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Created At</span>
                                        <span className={styles.detailValue}>{formatDate(selectedUser.createdAt)}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Last Login</span>
                                        <span className={styles.detailValue}>{formatDate(selectedUser.lastLogin)}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Activity Count</span>
                                        <span className={styles.detailValue}>{selectedUser.activityCount}</span>
                                    </div>
                                </div>

                                {/* Risk Assessment */}
                                <div className={styles.riskSection}>
                                    <h4>Risk Assessment</h4>
                                    <div className={styles.riskGrid}>
                                        <div className={styles.riskItem}>
                                            <span className={styles.riskLabel}>Violations</span>
                                            <span className={`${styles.riskValue} ${styles[getRiskLevel(selectedUser.violationCount)]}`}>
                                                {selectedUser.violationCount}
                                            </span>
                                        </div>
                                        <div className={styles.riskItem}>
                                            <span className={styles.riskLabel}>Compliance Score</span>
                                            <div className={styles.complianceBar}>
                                                <div className={styles.complianceFill} style={{ width: `${Math.max(0, 100 - selectedUser.violationCount * 5)}%` }} />
                                                <span>{Math.max(0, 100 - selectedUser.violationCount * 5)}%</span>
                                            </div>
                                        </div>
                                        <div className={styles.riskItem}>
                                            <span className={styles.riskLabel}>Risk Level</span>
                                            <StatusBadge status={getRiskLevel(selectedUser.violationCount)} label={selectedUser.violationCount > 10 ? 'High Risk' : selectedUser.violationCount > 5 ? 'Medium' : 'Low'} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                                <Button variant="primary" onClick={(e) => { setShowModal(false); handleEditClick(selectedUser, e as unknown as React.MouseEvent); }}>Edit User</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit/Create Modal */}
                {showEditModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>{selectedUser ? 'Edit User' : 'Create New User'}</h2>
                                <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.modalBody}>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>Full Name</label>
                                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Email</label>
                                            <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={!!selectedUser} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Department</label>
                                            <input required type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Role</label>
                                            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                                <option value="EXECUTIVE">Executive</option>
                                                <option value="IT_SECURITY">IT Security</option>
                                                <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
                                                <option value="SYSTEM_ADMIN">System Admin</option>
                                                <option value="AUDITOR">Auditor</option>
                                                <option value="ARCHIVIST">Archivist</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>{selectedUser ? 'New Password (leave blank to keep)' : 'Password'}</label>
                                            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!selectedUser} minLength={6} />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
                                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save User'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
