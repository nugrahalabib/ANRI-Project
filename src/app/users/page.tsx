'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button } from '@/components/ui';
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

const clearanceConfig: Record<string, { label: string; labelId: string; icon: string; color: string }> = {
    ADMIN: { label: 'ADMIN', labelId: 'ADMINISTRATOR', icon: '◆', color: 'critical' },
    SECURITY_OFFICER: { label: 'SECURITY', labelId: 'KEAMANAN', icon: '◆', color: 'critical' },
    ARCHIVIST: { label: 'ARCHIVIST', labelId: 'ARSIPAL', icon: '◈', color: 'warning' },
    AUDITOR: { label: 'AUDITOR', labelId: 'AUDITOR', icon: '◇', color: 'normal' },
    VIEWER: { label: 'VIEWER', labelId: 'PENGAMAT', icon: '○', color: 'normal' },
};

const roleColors: Record<string, { color: string; bgColor: string }> = {
    ADMIN: { color: '#fca5a5', bgColor: 'rgba(239, 68, 68, 0.2)' },
    SECURITY_OFFICER: { color: '#93c5fd', bgColor: 'rgba(59, 130, 246, 0.2)' },
    ARCHIVIST: { color: '#fcd34d', bgColor: 'rgba(245, 158, 11, 0.2)' },
    AUDITOR: { color: '#86efac', bgColor: 'rgba(16, 185, 129, 0.2)' },
    VIEWER: { color: '#c4b5fd', bgColor: 'rgba(139, 92, 246, 0.2)' },
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [toast, setToast] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'VIEWER', department: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, departmentFilter, search]);

    async function fetchUsers() {
        try {
            const params = new URLSearchParams();
            if (roleFilter !== 'all') params.append('role', roleFilter);
            if (departmentFilter !== 'all') params.append('department', departmentFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/users?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }

    const showToastMessage = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    };

    const handleCreateClick = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', role: 'VIEWER', department: '', password: '' });
        setIsModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            password: '' // Don't fill password
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = '/api/users';
            const method = editingUser ? 'PATCH' : 'POST';
            const body = editingUser
                ? { ...formData, id: editingUser.id, password: formData.password || undefined }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();
            if (json.success) {
                showToastMessage(editingUser ? 'User updated successfully' : 'User created successfully');
                setIsModalOpen(false);
                fetchUsers();
            } else {
                alert(json.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('System error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;
        try {
            const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
            if (res.ok) {
                showToastMessage('User deactivated');
                fetchUsers();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleBulkAction = async (action: string) => {
        if (!confirm(`Apply ${action} to ${selectedUsers.length} users?`)) return;

        // Mock bulk action for now (or implement loop)
        showToastMessage(`${action} applied to ${selectedUsers.length} users`);
        setSelectedUsers([]);

        // For real implementation: loop calls or bulk API endpoint
        if (action === 'Suspend') {
            for (const id of selectedUsers) {
                await fetch(`/api/users`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, isActive: false })
                });
            }
            fetchUsers();
        }
    };

    const getRiskLevel = (violationCount: number) => {
        if (violationCount > 10) return { level: 'high', color: 'var(--status-critical)' };
        if (violationCount > 5) return { level: 'medium', color: 'var(--status-warning)' };
        return { level: 'low', color: 'var(--status-normal)' };
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const departments = [...new Set(users.map(u => u.department))];
    const roles = [...new Set(users.map(u => u.role))];

    // Hardcoded roles list for select (in case API returns empty users initially)
    const availableRoles = ['ADMIN', 'EXECUTIVE', 'IT_SECURITY', 'COMPLIANCE_OFFICER', 'SYSTEM_ADMIN'];

    const stats = {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        withViolations: users.filter(u => u.violationCount > 0).length,
        highRisk: users.filter(u => u.violationCount > 10).length,
    };

    // Group by department
    const groupedUsers = users.reduce((acc, user) => {
        const dept = user.department || 'Unassigned';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(user);
        return acc;
    }, {} as Record<string, User[]>);

    if (loading) {
        return (
            <DashboardLayout title="Personnel Intelligence" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Loading users from database...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Personnel Intelligence" subtitle="User Access & Risk Management">
            <div className={styles.container}>
                {/* Toast */}
                {toast && <div className={styles.toast}>✓ {toast}</div>}

                {/* Stats */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.total}</span><span className={styles.statLabel}>Total Users</span></div>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.active}</span><span className={styles.statLabel}>Active</span></div>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.withViolations}</span><span className={styles.statLabel}>With Violations</span></div>
                    <div className={`${styles.statCard} ${stats.highRisk > 0 ? styles.critical : ''}`}>
                        <span className={styles.statValue}>{stats.highRisk}</span><span className={styles.statLabel}>High Risk</span>
                    </div>
                </section>

                {/* Controls */}
                <section className={styles.controls}>
                    <div className={styles.searchBox}>
                        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className={styles.searchInput} />
                    </div>
                    <div className={styles.filters}>
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Roles</option>
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className={styles.actionButtons}>
                        <Button variant="primary" size="sm" onClick={handleCreateClick}>+ Add User</Button>
                        {selectedUsers.length > 0 && (
                            <div className={styles.bulkActions}>
                                <span>{selectedUsers.length} selected</span>
                                <Button variant="secondary" size="sm" onClick={() => handleBulkAction('Suspend')}>Suspend</Button>
                                {/* <Button variant="secondary" size="sm" onClick={() => handleBulkAction('Upgrade')}>Upgrade</Button> */}
                            </div>
                        )}
                    </div>
                </section>

                {/* Users by Department */}
                {Object.entries(groupedUsers).map(([department, deptUsers]) => (
                    <section key={department} className={styles.departmentSection}>
                        <div className={styles.departmentHeader}>
                            <h2>{department}</h2>
                            <span className={styles.deptCount}>{deptUsers.length} users</span>
                        </div>
                        <div className={styles.usersGrid}>
                            {deptUsers.map((user) => {
                                const risk = getRiskLevel(user.violationCount);
                                return (
                                    <div key={user.id} className={`${styles.userCardWrapper} ${selectedUsers.includes(user.id) ? styles.selected : ''}`} onClick={() => toggleUserSelection(user.id)}>
                                        <Card className={styles.userCard}>
                                            <div className={styles.userHeader}>
                                                <div className={styles.userAvatar} style={{ background: roleColors[user.role]?.bgColor || '#333' }}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className={styles.userInfo}>
                                                    <h3>{user.name}</h3>
                                                    <span className={styles.userEmail}>{user.email}</span>
                                                </div>
                                                <div className={styles.userStatus}>
                                                    <span className={`${styles.statusDot} ${user.isActive ? styles.active : styles.inactive}`} title={user.isActive ? 'Active' : 'Inactive'}></span>
                                                </div>
                                                <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="secondary" size="sm" onClick={() => handleEditClick(user)}>Edit</Button>
                                                </div>
                                            </div>
                                            <div className={styles.userMeta}>
                                                <span className={styles.roleBadge} style={{ background: roleColors[user.role]?.bgColor, color: roleColors[user.role]?.color }}>
                                                    {clearanceConfig[user.role]?.icon || '○'} {user.role}
                                                </span>
                                            </div>
                                            <div className={styles.userStats}>
                                                <div className={styles.userStat}>
                                                    <span className={styles.statLabel}>Violations</span>
                                                    <span className={styles.statValue} style={{ color: risk.color }}>{user.violationCount}</span>
                                                </div>
                                                <div className={styles.userStat}>
                                                    <span className={styles.statLabel}>Activities</span>
                                                    <span className={styles.statValue}>{user.activityCount}</span>
                                                </div>
                                                <div className={styles.userStat}>
                                                    <span className={styles.statLabel}>Compliance</span>
                                                    <div className={styles.complianceScore}>
                                                        <div
                                                            className={styles.complianceBar}
                                                            style={{
                                                                width: `${Math.max(0, 100 - Math.min(user.violationCount * 5, 100))}%`,
                                                                background: user.violationCount <= 5 ? '#4ade80' : user.violationCount <= 10 ? '#fbbf24' : '#ef4444'
                                                            }}
                                                        />
                                                        <span className={styles.complianceValue}>
                                                            {Math.max(0, 100 - Math.min(user.violationCount * 5, 100))}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                {/* Clearance Legend */}
                <section className={styles.legend}>
                    <h4>Role Legend:</h4>
                    <div className={styles.legendItems}>
                        {Object.entries(clearanceConfig).map(([key, config]) => (
                            <div key={key} className={styles.legendItem}>
                                <span className={`${styles.legendIcon} ${styles[config.color]}`}>{config.icon}</span>
                                <span>{config.labelId}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Edit/Create Modal */}
                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
                            <form onSubmit={handleSubmit} className={styles.userForm}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={!!editingUser} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Department</label>
                                    <input required type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>{editingUser ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingUser}
                                        minLength={6}
                                    />
                                </div>
                                <div className={styles.modalActions}>
                                    <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                                    {editingUser && (
                                        <Button variant="secondary" type="button" onClick={() => handleDelete(editingUser.id)} className={styles.deleteBtn}>Deactivate</Button>
                                    )}
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
