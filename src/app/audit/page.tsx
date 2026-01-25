'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button } from '@/components/ui';
import styles from './page.module.css';

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: string; // Derived from metadata/new/prev
    metadata?: Record<string, unknown> | null;
    previousValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    signature: string;
    previousHash: string | null;
    user: { id: string; name: string; role: string } | null;
}

const actionConfig: Record<string, { label: string; icon: string; color: string }> = {
    DOCUMENT_ACCESS: { label: 'Akses Dokumen', icon: '📄', color: 'normal' },
    DOCUMENT_MOVEMENT: { label: 'Perpindahan Dokumen', icon: '📦', color: 'warning' },
    POLICY_VIOLATION: { label: 'Pelanggaran Kebijakan', icon: '⚠️', color: 'critical' },
    USER_LOGIN: { label: 'Login Pengguna', icon: '🔐', color: 'normal' },
    UNAUTHORIZED_ACCESS: { label: 'Akses Tidak Sah', icon: '🚫', color: 'critical' },
    POLICY_UPDATED: { label: 'Pembaruan Kebijakan', icon: '📝', color: 'info' },
    ROLE_CHANGED: { label: 'Perubahan Peran', icon: '👤', color: 'info' },
    SYSTEM_BACKUP: { label: 'Pencadangan Sistem', icon: '💾', color: 'normal' },
};

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('all');
    const [entityFilter, setEntityFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
    const [toast, setToast] = useState('');
    const [verifyResult, setVerifyResult] = useState<{ valid: boolean; totalEntries: number; invalidEntries: number; message?: string } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (actionFilter !== 'all') params.append('action', actionFilter);
                if (entityFilter !== 'all') params.append('entityType', entityFilter);
                if (dateRange.start) params.append('startDate', dateRange.start);
                if (dateRange.end) params.append('endDate', dateRange.end);
                params.append('page', pagination.page.toString());
                params.append('limit', pagination.limit.toString());

                const res = await fetch(`/api/audit?${params.toString()}`);
                const data = await res.json();
                if (data.success) {
                    setLogs(data.data);
                    setPagination(prev => ({ ...prev, total: data.pagination.total, totalPages: data.pagination.totalPages }));
                }
            } catch (error) {
                console.error('Error fetching audit logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [actionFilter, entityFilter, pagination.page, dateRange.start, dateRange.end, pagination.limit]);

    const showToastMessage = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(''), 3000);
    };

    const handleVerifyChain = async () => {
        setIsVerifying(true);
        try {
            const res = await fetch('/api/audit/verify');
            const result = await res.json();
            setVerifyResult(result);
            if (result.valid) {
                showToastMessage(`Chain integrity verified (${result.totalEntries} entries) ✓`);
            } else {
                showToastMessage(`⚠️ Validation FAILED: ${result.invalidEntries} invalid entries found!`);
            }
        } catch (error) {
            console.error('Verify failed:', error);
            showToastMessage('Verification process failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleExportCSV = async () => {
        showToastMessage('Generating CSV export...');
        try {
            // Fetch all matching logs for export (no pagination limits)
            const params = new URLSearchParams();
            if (actionFilter !== 'all') params.append('action', actionFilter);
            if (entityFilter !== 'all') params.append('entityType', entityFilter);
            if (dateRange.start) params.append('startDate', dateRange.start);
            if (dateRange.end) params.append('endDate', dateRange.end);
            params.append('limit', '10000'); // Export limit

            const res = await fetch(`/api/audit?${params.toString()}`);
            const json = await res.json();

            if (!json.success || !json.data.length) {
                showToastMessage('No data to export');
                return;
            }

            const headers = ['Timestamp', 'Action', 'User', 'Role', 'Entity Type', 'Entity ID', 'Details', 'IP Address', 'Signature'];
            const csvContent = [
                headers.join(','),
                ...json.data.map((log: AuditLog) => {
                    const detailStr = getLogDetails(log).replace(/,/g, ';').replace(/\n/g, ' ');
                    return [
                        new Date(log.timestamp).toISOString(),
                        log.action,
                        log.user?.name || 'System',
                        log.user?.role || '-',
                        log.entityType,
                        log.entityId,
                        `"${detailStr}"`,
                        log.ipAddress,
                        log.signature
                    ].join(',');
                })
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `anri_audit_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToastMessage('CSV Export Downloaded ✓');
        } catch (error) {
            console.error('Export failed:', error);
            showToastMessage('Export failed');
        }
    };

    const getLogDetails = (log: AuditLog): string => {
        if (log.metadata && typeof log.metadata.description === 'string') return log.metadata.description;
        if (log.metadata && log.metadata.details) return typeof log.metadata.details === 'string' ? log.metadata.details : JSON.stringify(log.metadata.details);
        if (log.previousValue && log.newValue) return 'Update operation';
        if (log.metadata) return JSON.stringify(log.metadata);
        return '-';
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const truncateSignature = (sig: string) => sig.slice(0, 8) + '...' + sig.slice(-4);

    const stats = {
        total: pagination.total,
        critical: logs.filter(l => actionConfig[l.action]?.color === 'critical').length,
        today: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Audit Nexus" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Loading audit logs from database...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Audit Nexus" subtitle="Cryptographically Verified Audit Trail">
            <div className={styles.container}>
                {/* Toast */}
                {toast && <div className={styles.toast}>✓ {toast}</div>}

                {/* Stats */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.total}</span><span className={styles.statLabel}>Total Logs</span></div>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.today}</span><span className={styles.statLabel}>Today</span></div>
                    <div className={`${styles.statCard} ${styles.critical}`}><span className={styles.statValue}>{stats.critical}</span><span className={styles.statLabel}>Critical</span></div>
                </section>

                {/* Controls */}
                <section className={styles.controls}>
                    <div className={styles.filters}>
                        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Actions</option>
                            {Object.entries(actionConfig).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Entity Types</option>
                            <option value="Document">Document</option>
                            <option value="User">User</option>
                            <option value="PolicyRule">Policy</option>
                            <option value="Zone">Zone</option>
                            <option value="Session">Session</option>
                            <option value="ApprovalRequest">Approval</option>
                        </select>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                        <span className={styles.dateSep}>To</span>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                    <div className={styles.actions}>
                        <Button variant="secondary" size="sm" onClick={handleVerifyChain} disabled={isVerifying}>
                            {isVerifying ? 'Verifying...' : '🔐 Verify Chain'}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleExportCSV}>📥 Export CSV</Button>
                    </div>
                </section>

                {/* Verification Result Alert */}
                {verifyResult && (
                    <div className={`${styles.verifyAlert} ${verifyResult.valid ? styles.alertSuccess : styles.alertError}`}>
                        <strong>Validation Result:</strong> {verifyResult.valid ? 'VALID' : 'INVALID'}
                        — Checked {verifyResult.totalEntries} records.
                        {verifyResult.invalidEntries > 0 && ` Found ${verifyResult.invalidEntries} TAMPERED records!`}
                    </div>
                )}

                {/* Audit Logs Table */}
                <Card noPadding>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Action</th>
                                    <th>User</th>
                                    <th>Entity</th>
                                    <th>Details</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => {
                                    const config = actionConfig[log.action] || { label: log.action, icon: '📋', color: 'normal' };
                                    return (
                                        <tr key={log.id} className={`${styles.row} ${styles[config.color]}`} onClick={() => setSelectedLog(log)}>
                                            <td className={styles.timestamp}>{formatTime(log.timestamp)}</td>
                                            <td>
                                                <div className={styles.actionCell}>
                                                    <span className={styles.actionIcon}>{config.icon}</span>
                                                    <span>{config.label}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.userInfo}>
                                                    <span className={styles.userName}>{log.user?.name || 'System'}</span>
                                                    <span className={styles.userRole}>{log.user?.role || ''}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <code className={styles.entityCode}>{log.entityType}: {log.entityId.substring(0, 8)}...</code>
                                            </td>
                                            <td className={styles.details}>{getLogDetails(log).substring(0, 50) + (getLogDetails(log).length > 50 ? '...' : '')}</td>
                                            <td><code>{log.ipAddress}</code></td>
                                        </tr>
                                    );
                                })}
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
                <section className={styles.chainInfo}>
                    <div className={styles.chainIcon}>🔐</div>
                    <div className={styles.chainContent}>
                        <h4>Cryptographic Audit Chain</h4>
                        <p>All audit records are cryptographically signed and chain-linked (HMAC-SHA256). Each record includes timestamp, action hash, and previous record reference for tamper-proof compliance verification.</p>
                    </div>
                </section>

                {/* Detail Modal */}
                {selectedLog && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedLog(null)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Audit Log Details</h2>
                                <button className={styles.closeBtn} onClick={() => setSelectedLog(null)}>×</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailItem}><span className={styles.detailLabel}>Log ID</span><code>{selectedLog.id}</code></div>
                                    <div className={styles.detailItem}><span className={styles.detailLabel}>Timestamp</span><span>{formatTime(selectedLog.timestamp)}</span></div>
                                    <div className={styles.detailItem}><span className={styles.detailLabel}>Action</span><span>{actionConfig[selectedLog.action]?.label || selectedLog.action}</span></div>
                                    <div className={styles.detailItem}><span className={styles.detailLabel}>User</span><span>{selectedLog.user?.name || 'System'}</span></div>
                                    <div className={styles.detailItem}><span className={styles.detailLabel}>Entity</span><code>{selectedLog.entityType}: {selectedLog.entityId}</code></div>
                                    <div className={styles.detailItem}><span className={styles.detailLabel}>IP Address</span><code>{selectedLog.ipAddress}</code></div>
                                    <div className={styles.detailItem}><span className={styles.detailLabel}>User Agent</span><code className={styles.userAgent}>{selectedLog.userAgent}</code></div>
                                    <div className={styles.detailItem}><span className={styles.detailLabel}>Signature</span><code className={styles.signature}>{truncateSignature(selectedLog.signature)}</code></div>
                                </div>
                                <div className={styles.detailsFull}>
                                    <h4>Details</h4>
                                    <pre className={styles.jsonDetails}>{JSON.stringify({
                                        details: getLogDetails(selectedLog),
                                        metadata: selectedLog.metadata,
                                        previousValue: selectedLog.previousValue,
                                        newValue: selectedLog.newValue
                                    }, null, 2)}</pre>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <Button variant="secondary" onClick={() => setSelectedLog(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
