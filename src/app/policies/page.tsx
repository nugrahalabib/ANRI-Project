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

const categoryLabels: Record<string, { label: string; icon: string }> = {
    DNS_BLOCK: { label: 'DNS Block', icon: '🌐' },
    URL_FILTER: { label: 'URL Filter', icon: '🔗' },
    CONTENT_RESTRICTION: { label: 'Content Restriction', icon: '📝' },
    TIME_RESTRICTION: { label: 'Time Restriction', icon: '⏰' },
    APPLICATION_CONTROL: { label: 'Application Control', icon: '📱' },
    BANDWIDTH_LIMIT: { label: 'Bandwidth Limit', icon: '📊' },
};

const actionColors: Record<string, 'critical' | 'warning' | 'normal'> = {
    BLOCK: 'critical',
    WARN: 'warning',
    LOG_ONLY: 'normal',
    SUSPEND_ACCESS: 'critical',
    ISOLATE_DEVICE: 'critical',
};

const severityColors: Record<string, 'critical' | 'warning' | 'normal'> = {
    CRITICAL: 'critical',
    HIGH: 'critical',
    MEDIUM: 'warning',
    LOW: 'normal',
};

export default function PoliciesPage() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [toast, setToast] = useState('');

    // Form state
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCategory, setFormCategory] = useState('DNS_BLOCK');
    const [formPattern, setFormPattern] = useState('');
    const [formAction, setFormAction] = useState('BLOCK');
    const [formSeverity, setFormSeverity] = useState('MEDIUM');

    useEffect(() => {
        fetchPolicies();
    }, [categoryFilter]);

    async function fetchPolicies() {
        try {
            const params = new URLSearchParams();
            if (categoryFilter !== 'all') params.append('category', categoryFilter);

            const res = await fetch(`/api/policies?${params.toString()}`);
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

    const showToastMessage = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    };

    const handleToggleActive = async (policy: Policy) => {
        try {
            await fetch('/api/policies', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: policy.id, isActive: !policy.isActive }),
            });
            setPolicies(policies.map(p => p.id === policy.id ? { ...p, isActive: !p.isActive } : p));
            showToastMessage(`Policy ${!policy.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            console.error('Error toggling policy:', error);
        }
    };

    // Pattern Tester Logic
    const [testUrl, setTestUrl] = useState('');
    const [testResult, setTestResult] = useState<{ status: 'BLOCKED' | 'ALLOWED', policy?: string } | null>(null);

    const handleTestPattern = () => {
        if (!testUrl) return;
        const matchedPolicy = policies.find(p => p.isActive && p.pattern.split(',').some(pat => {
            const regex = new RegExp(pat.replace(/\*/g, '.*'));
            return regex.test(testUrl);
        }));

        if (matchedPolicy) {
            setTestResult({ status: 'BLOCKED', policy: matchedPolicy.name });
        } else {
            setTestResult({ status: 'ALLOWED' });
        }
    };

    const handleCreatePolicy = async () => {
        try {
            const res = await fetch('/api/policies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formName,
                    description: formDescription,
                    category: formCategory,
                    pattern: formPattern,
                    action: formAction,
                    severity: formSeverity,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setPolicies([data.data, ...policies]);
                setShowCreateModal(false);
                showToastMessage('Policy created successfully');
                resetForm();
            }
        } catch (error) {
            console.error('Error creating policy:', error);
        }
    };

    const handleEditPolicy = (policy: Policy) => {
        setSelectedPolicy(policy);
        setFormName(policy.name);
        setFormDescription(policy.description);
        setFormCategory(policy.category);
        setFormPattern(policy.pattern);
        setFormAction(policy.action);
        setFormSeverity(policy.severity);
        setShowEditModal(true);
    };

    const handleUpdatePolicy = async () => {
        if (!selectedPolicy) return;
        try {
            await fetch('/api/policies', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedPolicy.id,
                    name: formName,
                    description: formDescription,
                    pattern: formPattern,
                    action: formAction,
                    severity: formSeverity,
                }),
            });
            fetchPolicies();
            setShowEditModal(false);
            showToastMessage('Policy updated successfully');
            resetForm();
        } catch (error) {
            console.error('Error updating policy:', error);
        }
    };

    const resetForm = () => {
        setFormName('');
        setFormDescription('');
        setFormCategory('DNS_BLOCK');
        setFormPattern('');
        setFormAction('BLOCK');
        setFormSeverity('MEDIUM');
        setSelectedPolicy(null);
    };

    const stats = {
        total: policies.length,
        active: policies.filter(p => p.isActive).length,
        critical: policies.filter(p => p.severity === 'CRITICAL').length,
        violations: policies.reduce((sum, p) => sum + (p.violationCount || 0), 0),
    };

    if (loading) {
        return (
            <DashboardLayout title="Policy Engine" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Loading policies from database...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Policy Engine" subtitle="Real-time Enforcement Layer">
            <div className={styles.container}>
                {/* Toast */}
                {toast && <div className={styles.toast}>✓ {toast}</div>}

                {/* Stats */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.total}</span><span className={styles.statLabel}>Total Rules</span></div>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.active}</span><span className={styles.statLabel}>Active</span></div>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.critical}</span><span className={styles.statLabel}>Critical</span></div>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.violations}</span><span className={styles.statLabel}>Violations</span></div>

                    {/* Pattern Tester Widget */}
                    <Card className={styles.testerCard} noPadding>
                        <div className={styles.testerHeader}>🔍 Policy Simulator</div>
                        <div className={styles.testerBody}>
                            <input
                                type="text"
                                placeholder="e.g. judionline.com"
                                value={testUrl}
                                onChange={(e) => setTestUrl(e.target.value)}
                                className={styles.testerInput}
                            />
                            <Button size="sm" onClick={handleTestPattern}>Test</Button>
                        </div>
                        {testResult && (
                            <div className={`${styles.testerResult} ${testResult.status === 'BLOCKED' ? styles.blocked : styles.allowed}`}>
                                {testResult.status === 'BLOCKED' ? `🚫 Blocked by: ${testResult.policy}` : '✅ Allowed'}
                            </div>
                        )}
                    </Card>
                </section>

                {/* Controls */}
                <section className={styles.controls}>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={styles.filterSelect}>
                        <option value="all">All Categories</option>
                        {Object.entries(categoryLabels).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <Button variant="primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>+ Create Policy</Button>
                </section>

                {/* Policies Grid */}
                <div className={styles.policiesGrid}>
                    {policies.map((policy) => (
                        <Card key={policy.id} className={`${styles.policyCard} ${!policy.isActive ? styles.inactive : ''}`}>
                            <div className={styles.policyHeader}>
                                <div className={styles.policyMeta}>
                                    <span className={styles.categoryIcon}>{categoryLabels[policy.category]?.icon || '📋'}</span>
                                    <span className={styles.categoryLabel}>{categoryLabels[policy.category]?.label || policy.category}</span>
                                </div>
                                <StatusBadge status={severityColors[policy.severity]} label={policy.severity} size="sm" />
                            </div>
                            <h3 className={styles.policyName}>{policy.name}</h3>
                            <p className={styles.policyDescription}>{policy.description}</p>
                            <div className={styles.policyDetails}>
                                <div className={styles.patternBox}><code>{policy.pattern}</code></div>
                                <div className={styles.policyStats}>
                                    <span>Action: <StatusBadge status={actionColors[policy.action] || 'normal'} label={policy.action} size="sm" /></span>
                                    <span>Violations: {policy.violationCount || 0}</span>
                                </div>
                            </div>
                            <div className={styles.policyActions}>
                                <Button variant="secondary" size="sm" onClick={() => handleEditPolicy(policy)}>Edit</Button>
                                <Button variant={policy.isActive ? 'secondary' : 'primary'} size="sm" onClick={() => handleToggleActive(policy)}>
                                    {policy.isActive ? 'Disable' : 'Enable'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className={styles.modalOverlay} onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{showEditModal ? 'Edit Policy' : 'Create Policy'}</h2>
                            <button className={styles.closeBtn} onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}><label>Name *</label><input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
                            <div className={styles.formGroup}><label>Description</label><textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} /></div>
                            {!showEditModal && (
                                <div className={styles.formGroup}>
                                    <label>Category *</label>
                                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                                        {Object.entries(categoryLabels).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
                                    </select>
                                </div>
                            )}
                            <div className={styles.formGroup}><label>Pattern *</label><input type="text" value={formPattern} onChange={(e) => setFormPattern(e.target.value)} placeholder="*.example.com, keyword*" /></div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Action</label>
                                    <select value={formAction} onChange={(e) => setFormAction(e.target.value)}>
                                        <option value="BLOCK">Block</option><option value="WARN">Warn</option><option value="LOG_ONLY">Log Only</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Severity</label>
                                    <select value={formSeverity} onChange={(e) => setFormSeverity(e.target.value)}>
                                        <option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button variant="secondary" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>Cancel</Button>
                            <Button variant="primary" onClick={showEditModal ? handleUpdatePolicy : handleCreatePolicy} disabled={!formName || !formPattern}>
                                {showEditModal ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
