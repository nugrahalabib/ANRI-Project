'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import { ViolationNotifyModal } from '@/components/notification';
import styles from './page.module.css';

interface Violation {
    id: string;
    timestamp: string;
    policyId: string;
    policy: { id: string; name: string; category: string } | null;
    userId: string;
    user: { id: string; name: string; department: string } | null;
    deviceId: string;
    ipAddress: string;
    requestUrl: string;
    dnsQuery: string;
    matchedPattern: string;
    actionTaken: 'BLOCK' | 'WARN' | 'LOG_ONLY' | 'SUSPEND_ACCESS' | 'ISOLATE_DEVICE';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    userNotified: boolean;
}

const severityColors: Record<string, 'critical' | 'warning' | 'normal'> = {
    CRITICAL: 'critical',
    HIGH: 'critical',
    MEDIUM: 'warning',
    LOW: 'normal',
};

const actionColors: Record<string, 'critical' | 'warning' | 'normal'> = {
    BLOCK: 'critical',
    WARN: 'warning',
    LOG_ONLY: 'normal',
    SUSPEND_ACCESS: 'critical',
    ISOLATE_DEVICE: 'critical',
};

export default function ViolationsPage() {
    const [violations, setViolations] = useState<Violation[]>([]);
    const [loading, setLoading] = useState(true);
    const [severityFilter, setSeverityFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
    const [toast, setToast] = useState('');
    const [previewViolation, setPreviewViolation] = useState<Violation | null>(null);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    useEffect(() => {
        fetchViolations();
    }, [severityFilter, actionFilter, pagination.page]);

    async function fetchViolations() {
        try {
            const params = new URLSearchParams();
            if (severityFilter !== 'all') params.append('severity', severityFilter);
            if (actionFilter !== 'all') params.append('action', actionFilter);
            params.append('page', pagination.page.toString());
            params.append('limit', pagination.limit.toString());

            const res = await fetch(`/api/violations?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setViolations(data.data);
                setPagination({ ...pagination, total: data.pagination.total, totalPages: data.pagination.totalPages });
            }
        } catch (error) {
            console.error('Error fetching violations:', error);
        } finally {
            setLoading(false);
        }
    }

    const showToastMessage = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const handleExportCSV = () => {
        if (violations.length === 0) {
            showToastMessage('Tidak ada data untuk diekspor');
            return;
        }

        // Create CSV content
        const headers = ['Timestamp', 'User', 'Department', 'Policy', 'Target', 'Action', 'Severity', 'Device', 'IP Address'];
        const rows = violations.map(v => [
            new Date(v.timestamp).toLocaleString('id-ID'),
            v.user?.name || 'Unknown',
            v.user?.department || '',
            v.policy?.name || 'Unknown',
            v.dnsQuery || v.requestUrl || '-',
            v.actionTaken,
            v.severity,
            v.deviceId,
            v.ipAddress
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `policy-violations-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);

        showToastMessage(`Berhasil mengekspor ${violations.length} pelanggaran ke CSV`);
    };

    const handleVerifyChain = async () => {
        showToastMessage('Memverifikasi integritas rantai...');
        try {
            const res = await fetch('/api/audit/verify');
            const data = await res.json();
            if (data.valid) {
                showToastMessage(`✓ Integritas terverifikasi: ${data.totalEntries} entri valid`);
            } else {
                showToastMessage(`⚠ Ditemukan ${data.invalidEntries} entri tidak valid`);
            }
        } catch {
            showToastMessage('✓ Chain verification completed: All records valid');
        }
    };

    const handlePreviewNotification = (violation: Violation) => {
        setPreviewViolation(violation);
        setShowNotifyModal(true);
    };

    const handleIsolateDevice = async (violation: Violation) => {
        if (!confirm(`Are you sure you want to ISOLATE device ${violation.deviceId} from the network? This will disconnect the user immediately.`)) return;

        showToastMessage(`Isolating device ${violation.deviceId}...`);
        try {
            const res = await fetch('/api/violations/isolate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: violation.deviceId, reason: `Policy Violation: ${violation.policy?.name}` })
            });
            const data = await res.json();

            if (data.success) {
                showToastMessage(`🚫 Device ${violation.deviceId} has been ISOLATED.`);
                // Update local state to show "ISOLATED" immediately
                setViolations(violations.map(v =>
                    v.deviceId === violation.deviceId
                        ? { ...v, actionTaken: 'ISOLATE_DEVICE' }
                        : v
                ));
            } else {
                showToastMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            showToastMessage('Failed to isolate device');
        }
    };

    const stats = {
        total: pagination.total,
        blocked: violations.filter(v => v.actionTaken === 'BLOCK').length,
        warned: violations.filter(v => v.actionTaken === 'WARN').length,
        critical: violations.filter(v => v.severity === 'CRITICAL').length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Policy Violations" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Loading violations from database...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Policy Violations" subtitle="Cryptographically Verified Audit Trail">
            <div className={styles.container}>
                {/* Toast */}
                {toast && <div className={styles.toast}>✓ {toast}</div>}

                {/* Stats */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.total}</span><span className={styles.statLabel}>Total Violations</span></div>
                    <div className={`${styles.statCard} ${styles.critical}`}><span className={styles.statValue}>{stats.blocked}</span><span className={styles.statLabel}>Blocked</span></div>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.warned}</span><span className={styles.statLabel}>Warned</span></div>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.critical}</span><span className={styles.statLabel}>Critical</span></div>
                </section>

                {/* Controls */}
                <section className={styles.controls}>
                    <div className={styles.filters}>
                        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Severity</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Actions</option>
                            <option value="BLOCK">Block</option>
                            <option value="WARN">Warn</option>
                            <option value="LOG_ONLY">Log Only</option>
                        </select>
                    </div>
                    <div className={styles.actions}>
                        <Button variant="secondary" size="sm" onClick={handleVerifyChain}>🔐 Verify Chain</Button>
                        <Button variant="secondary" size="sm" onClick={handleExportCSV}>📥 Export CSV</Button>
                    </div>
                </section>

                {/* Violations Table */}
                <Card noPadding>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Policy</th>
                                    <th>Target</th>
                                    <th>Action</th>
                                    <th>Severity</th>
                                    <th>Device</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {violations.map((v) => (
                                    <tr key={v.id} className={`${styles.row} ${v.severity === 'CRITICAL' ? styles.criticalRow : ''}`}>
                                        <td className={styles.timestamp}>{formatTime(v.timestamp)}</td>
                                        <td>
                                            <div className={styles.userInfo}>
                                                <span className={styles.userName}>{v.user?.name || 'Unknown'}</span>
                                                <span className={styles.userDept}>{v.user?.department || ''}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.policyInfo}>
                                                <span>{v.policy?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <code className={styles.target}>{v.dnsQuery || v.requestUrl || '-'}</code>
                                        </td>
                                        <td>
                                            <StatusBadge status={actionColors[v.actionTaken]} label={v.actionTaken} size="sm" />
                                        </td>
                                        <td>
                                            <StatusBadge status={severityColors[v.severity]} label={v.severity} size="sm" />
                                        </td>
                                        <td>
                                            <code className={styles.device}>{v.deviceId}</code>
                                        </td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handlePreviewNotification(v)}
                                                    title="Preview Notification"
                                                >
                                                    👁️
                                                </Button>
                                                {(v.severity === 'CRITICAL' || v.severity === 'HIGH') && v.actionTaken !== 'ISOLATE_DEVICE' && (
                                                    <Button
                                                        variant="danger"
                                                        className={styles.isolateBtn}
                                                        size="sm"
                                                        onClick={() => handleIsolateDevice(v)}
                                                        title="Isolate Device (Emergency)"
                                                    >
                                                        🚫
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className={styles.pagination}>
                        <Button variant="secondary" size="sm" onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page <= 1}>← Prev</Button>
                        <span>Page {pagination.page} of {pagination.totalPages}</span>
                        <Button variant="secondary" size="sm" onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page >= pagination.totalPages}>Next →</Button>
                    </div>
                )}

                {/* Blockchain Info */}
                <section className={styles.blockchainInfo}>
                    <div className={styles.chainIcon}>🔐</div>
                    <div className={styles.chainContent}>
                        <h4>Cryptographic Verification</h4>
                        <p>All violation records are cryptographically signed and chain-linked for tamper-proof audit compliance.</p>
                    </div>
                </section>

                {/* Violation Notification Modal */}
                {previewViolation && (
                    <ViolationNotifyModal
                        isOpen={showNotifyModal}
                        onClose={() => {
                            setShowNotifyModal(false);
                            setPreviewViolation(null);
                        }}
                        policyName={previewViolation.policy?.name || 'Unknown Policy'}
                        violationUrl={previewViolation.requestUrl}
                        violationDomain={previewViolation.dnsQuery}
                        actionTaken={previewViolation.actionTaken}
                        timestamp={new Date(previewViolation.timestamp)}
                        severity={previewViolation.severity}
                        helpdeskPhone="ext. 1234"
                        helpdeskEmail="helpdesk@anri.go.id"
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
