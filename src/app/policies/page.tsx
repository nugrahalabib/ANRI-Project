'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

interface Policy {
    id: string;
    name: string;
    description: string;
    category: string;
    pattern: string;
    action: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    priority: number;
    isActive: boolean;
    violationCount: number;
    createdAt: string;
    updatedAt: string;
}

const categoryLabels: Record<string, { label: string; icon: string; description: string }> = {
    DNS_BLOCK: { label: 'DNS Block', icon: '🌐', description: 'Block malicious domains' },
    URL_FILTER: { label: 'URL Filter', icon: '🔗', description: 'Filter unauthorized URLs' },
    CONTENT_RESTRICTION: { label: 'Content', icon: '📝', description: 'Restrict content types' },
    TIME_RESTRICTION: { label: 'Time Based', icon: '⏰', description: 'Time-based access control' },
    APPLICATION_CONTROL: { label: 'App Control', icon: '📱', description: 'Control applications' },
    BANDWIDTH_LIMIT: { label: 'Bandwidth', icon: '📊', description: 'Limit bandwidth usage' },
};

const actionBadges: Record<string, { color: 'critical' | 'warning' | 'normal'; label: string }> = {
    BLOCK: { color: 'critical', label: 'BLOCK' },
    WARN: { color: 'warning', label: 'WARN' },
    LOG_ONLY: { color: 'normal', label: 'LOG' },
    SUSPEND_ACCESS: { color: 'critical', label: 'SUSPEND' },
    ISOLATE_DEVICE: { color: 'critical', label: 'ISOLATE' },
};

const severityColors: Record<string, 'critical' | 'warning' | 'normal'> = {
    CRITICAL: 'critical',
    HIGH: 'critical',
    MEDIUM: 'warning',
    LOW: 'normal',
};

const ITEMS_PER_PAGE = 10;

export default function PoliciesPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'DNS_BLOCK',
        pattern: '',
        action: 'BLOCK',
        severity: 'MEDIUM',
    });

    // Pattern tester
    const [testUrl, setTestUrl] = useState('');
    const [testResult, setTestResult] = useState<{ status: 'BLOCKED' | 'ALLOWED'; policy?: string } | null>(null);

    useEffect(() => {
        fetchPolicies();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, categoryFilter]);

    async function fetchPolicies() {
        try {
            const res = await fetch('/api/policies');
            const data = await res.json();
            if (data.success) {
                setPolicies(data.data);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    }

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // Filtering
    const filteredPolicies = policies.filter(p => {
        const matchSearch = search === '' ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.pattern.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    // Pagination
    const totalPages = Math.ceil(filteredPolicies.length / ITEMS_PER_PAGE);
    const paginatedPolicies = filteredPolicies.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    // Stats
    const stats = {
        total: policies.length,
        active: policies.filter(p => p.isActive).length,
        critical: policies.filter(p => p.severity === 'CRITICAL' || p.severity === 'HIGH').length,
        violations: policies.reduce((sum, p) => sum + (p.violationCount || 0), 0),
    };

    // Handlers
    const handleToggleActive = async (policy: Policy, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await fetch('/api/policies', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: policy.id, isActive: !policy.isActive }),
            });
            setPolicies(policies.map(p => p.id === policy.id ? { ...p, isActive: !p.isActive } : p));
            showToast('success', `Policy ${!policy.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            console.error('Error toggling policy:', error);
            showToast('error', 'Failed to update policy');
        }
    };

    const handleTestPattern = () => {
        if (!testUrl) return;
        const matchedPolicy = policies.find(p => p.isActive && p.pattern.split(',').some(pat => {
            try {
                const regex = new RegExp(pat.trim().replace(/\*/g, '.*'), 'i');
                return regex.test(testUrl);
            } catch {
                return testUrl.includes(pat.trim());
            }
        }));

        setTestResult(matchedPolicy
            ? { status: 'BLOCKED', policy: matchedPolicy.name }
            : { status: 'ALLOWED' }
        );
    };

    const openCreateModal = () => {
        setEditMode(false);
        setSelectedPolicy(null);
        setFormData({ name: '', description: '', category: 'DNS_BLOCK', pattern: '', action: 'BLOCK', severity: 'MEDIUM' });
        setShowModal(true);
    };

    const openEditModal = (policy: Policy) => {
        setEditMode(true);
        setSelectedPolicy(policy);
        setFormData({
            name: policy.name,
            description: policy.description,
            category: policy.category,
            pattern: policy.pattern,
            action: policy.action,
            severity: policy.severity,
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        try {
            if (editMode && selectedPolicy) {
                await fetch('/api/policies', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedPolicy.id, ...formData }),
                });
                showToast('success', 'Policy updated successfully');
            } else {
                const res = await fetch('/api/policies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const data = await res.json();
                if (data.success) {
                    showToast('success', 'Policy created successfully');
                }
            }
            fetchPolicies();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving policy:', error);
            showToast('error', 'Failed to save policy');
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Network Policy Engine" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Loading policies...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Network Policy Engine"
            subtitle="Digital Activity Intelligence & Enforcement"
            actions={<Button variant="primary" onClick={openCreateModal}>+ Create Policy</Button>}
        >
            <div className={styles.container}>
                {/* Toast */}
                {toast && (
                    <div className={`${styles.toast} ${styles[toast.type]}`}>
                        {toast.type === 'success' ? '✓' : '✗'} {toast.message}
                    </div>
                )}

                {/* Stats Row */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Rules</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.active}`}>
                        <span className={styles.statValue}>{stats.active}</span>
                        <span className={styles.statLabel}>Active</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.critical}`}>
                        <span className={styles.statValue}>{stats.critical}</span>
                        <span className={styles.statLabel}>High Priority</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.violations}`}>
                        <span className={styles.statValue}>{stats.violations.toLocaleString()}</span>
                        <span className={styles.statLabel}>Total Violations</span>
                    </div>
                </section>

                {/* Policy Simulator */}
                <Card className={styles.simulatorCard}>
                    <div className={styles.simulatorHeader}>
                        <div className={styles.simulatorTitle}>
                            <span className={styles.simulatorIcon}>🔍</span>
                            <div>
                                <h3>Policy Simulator</h3>
                                <p>Test if a URL/domain would be blocked by active policies</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.simulatorBody}>
                        <div className={styles.simulatorInput}>
                            <input
                                type="text"
                                placeholder="Enter URL or domain to test (e.g., malware-site.com)"
                                value={testUrl}
                                onChange={(e) => { setTestUrl(e.target.value); setTestResult(null); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleTestPattern()}
                            />
                            <Button variant="primary" onClick={handleTestPattern}>Test Policy</Button>
                        </div>
                        {testResult && (
                            <div className={`${styles.simulatorResult} ${testResult.status === 'BLOCKED' ? styles.blocked : styles.allowed}`}>
                                {testResult.status === 'BLOCKED' ? (
                                    <><span className={styles.resultIcon}>🚫</span> BLOCKED by policy: <strong>{testResult.policy}</strong></>
                                ) : (
                                    <><span className={styles.resultIcon}>✅</span> ALLOWED - No matching policy found</>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Controls */}
                <section className={styles.controls}>
                    <div className={styles.searchBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search policies by name, pattern, or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Categories</option>
                            {Object.entries(categoryLabels).map(([key, { label, icon }]) => (
                                <option key={key} value={key}>{icon} {label}</option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* Policies Table */}
                <Card noPadding>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Policy Name</th>
                                    <th>Category</th>
                                    <th>Pattern</th>
                                    <th>Action</th>
                                    <th>Severity</th>
                                    <th>Violations</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPolicies.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className={styles.emptyRow}>No policies found</td>
                                    </tr>
                                ) : (
                                    paginatedPolicies.map((policy) => (
                                        <tr key={policy.id} className={`${styles.row} ${!policy.isActive ? styles.inactiveRow : ''}`}>
                                            <td>
                                                <button
                                                    className={`${styles.statusToggle} ${policy.isActive ? styles.on : styles.off}`}
                                                    onClick={(e) => handleToggleActive(policy, e)}
                                                    title={policy.isActive ? 'Click to disable' : 'Click to enable'}
                                                >
                                                    <span className={styles.toggleSlider} />
                                                </button>
                                            </td>
                                            <td>
                                                <div className={styles.policyInfo}>
                                                    <span className={styles.policyName}>{policy.name}</span>
                                                    <span className={styles.policyDesc}>{policy.description}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.categoryBadge}>
                                                    {categoryLabels[policy.category]?.icon} {categoryLabels[policy.category]?.label || policy.category}
                                                </span>
                                            </td>
                                            <td>
                                                <code className={styles.pattern}>{policy.pattern}</code>
                                            </td>
                                            <td>
                                                <StatusBadge
                                                    status={actionBadges[policy.action]?.color || 'normal'}
                                                    label={actionBadges[policy.action]?.label || policy.action}
                                                    size="sm"
                                                />
                                            </td>
                                            <td>
                                                <StatusBadge status={severityColors[policy.severity]} label={policy.severity} size="sm" />
                                            </td>
                                            <td>
                                                <span className={styles.violationCount}>{policy.violationCount || 0}</span>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className={styles.editBtn} onClick={() => openEditModal(policy)} title="Edit">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
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
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredPolicies.length)} of {filteredPolicies.length} policies
                        </div>
                        <div className={styles.paginationControls}>
                            <button
                                className={styles.pageBtn}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                ‹ Prev
                            </button>
                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className={styles.pageEllipsis}>{page}</span>
                                )
                            ))}
                            <button
                                className={styles.pageBtn}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                )}

                {/* Category Legend */}
                <section className={styles.legend}>
                    <h4>Policy Categories:</h4>
                    <div className={styles.legendItems}>
                        {Object.entries(categoryLabels).map(([key, { icon, label, description }]) => (
                            <div key={key} className={styles.legendItem}>
                                <span className={styles.legendIcon}>{icon}</span>
                                <div>
                                    <span className={styles.legendLabel}>{label}</span>
                                    <span className={styles.legendDesc}>{description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitle}>
                                <h2>{editMode ? 'Edit Policy Rule' : 'Create New Policy Rule'}</h2>
                                <span className={styles.modalSubtitle}>
                                    {editMode ? 'Modify the policy configuration below' : 'Define a new network enforcement rule'}
                                </span>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Policy Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Block Gambling Sites"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    placeholder="Brief description of what this policy does"
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        disabled={editMode}
                                    >
                                        {Object.entries(categoryLabels).map(([key, { label, icon }]) => (
                                            <option key={key} value={key}>{icon} {label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Severity</label>
                                    <select value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })}>
                                        <option value="CRITICAL">🔴 Critical</option>
                                        <option value="HIGH">🟠 High</option>
                                        <option value="MEDIUM">🟡 Medium</option>
                                        <option value="LOW">🟢 Low</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Pattern/Rule *</label>
                                <input
                                    type="text"
                                    value={formData.pattern}
                                    onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                                    placeholder="*.gambling.com, poker*, judi*"
                                />
                                <span className={styles.formHint}>Use * as wildcard. Separate multiple patterns with commas.</span>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Action</label>
                                <div className={styles.actionOptions}>
                                    {['BLOCK', 'WARN', 'LOG_ONLY'].map(action => (
                                        <label key={action} className={`${styles.actionOption} ${formData.action === action ? styles.selected : ''}`}>
                                            <input
                                                type="radio"
                                                name="action"
                                                value={action}
                                                checked={formData.action === action}
                                                onChange={() => setFormData({ ...formData, action })}
                                            />
                                            <span className={styles.actionIcon}>
                                                {action === 'BLOCK' ? '🚫' : action === 'WARN' ? '⚠️' : '📝'}
                                            </span>
                                            <span>{action === 'LOG_ONLY' ? 'Log Only' : action.charAt(0) + action.slice(1).toLowerCase()}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleSubmit} disabled={!formData.name || !formData.pattern}>
                                {editMode ? 'Update Policy' : 'Create Policy'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
