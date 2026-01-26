'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: string;
    metadata?: Record<string, unknown> | null;
    previousValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    signature: string;
    previousHash: string | null;
    user: { id: string; name: string; role: string; department?: string } | null;
}

const actionConfig: Record<string, { label: string; icon: string; color: 'normal' | 'warning' | 'critical' }> = {
    CREATE: { label: 'Create', icon: '➕', color: 'normal' },
    UPDATE: { label: 'Update', icon: '✏️', color: 'warning' },
    DELETE: { label: 'Delete', icon: '🗑️', color: 'critical' },
    ACCESS: { label: 'Access', icon: '👁️', color: 'normal' },
    MOVE: { label: 'Movement', icon: '📦', color: 'warning' },
    ALERT: { label: 'Alert', icon: '⚠️', color: 'critical' },
    LOGIN: { label: 'Login', icon: '🔐', color: 'normal' },
    LOGOUT: { label: 'Logout', icon: '🚪', color: 'normal' },
    DOCUMENT_ACCESS: { label: 'Akses Dokumen', icon: '📄', color: 'normal' },
    DOCUMENT_MOVEMENT: { label: 'Perpindahan', icon: '📦', color: 'warning' },
    POLICY_VIOLATION: { label: 'Pelanggaran', icon: '🚫', color: 'critical' },
    USER_LOGIN: { label: 'Login User', icon: '🔐', color: 'normal' },
    UNAUTHORIZED_ACCESS: { label: 'Akses Tidak Sah', icon: '🚨', color: 'critical' },
    POLICY_UPDATED: { label: 'Update Kebijakan', icon: '📝', color: 'warning' },
    ROLE_CHANGED: { label: 'Perubahan Role', icon: '👤', color: 'warning' },
    SYSTEM_BACKUP: { label: 'Backup Sistem', icon: '💾', color: 'normal' },
};

const ITEMS_PER_PAGE = 15;

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [entityFilter, setEntityFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [verifyResult, setVerifyResult] = useState<{ valid: boolean; totalEntries: number; invalidEntries: number } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [actionFilter, entityFilter, dateRange.start, dateRange.end, currentPage]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (actionFilter !== 'all') params.append('action', actionFilter);
            if (entityFilter !== 'all') params.append('entityType', entityFilter);
            if (dateRange.start) params.append('startDate', dateRange.start);
            if (dateRange.end) params.append('endDate', dateRange.end);
            params.append('page', currentPage.toString());
            params.append('limit', ITEMS_PER_PAGE.toString());

            const res = await fetch(`/api/audit?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setLogs(data.data);
                setTotalLogs(data.pagination?.total || data.data.length);
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type: 'success' | 'error' | 'info', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleVerifyChain = async () => {
        setIsVerifying(true);
        try {
            const res = await fetch('/api/audit/verify');
            const result = await res.json();
            setVerifyResult(result);
            if (result.valid) {
                showToast('success', `Chain integrity verified (${result.totalEntries} entries)`);
            } else {
                showToast('error', `${result.invalidEntries} tampered records found!`);
            }
        } catch {
            showToast('error', 'Verification process failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleExportCSV = async () => {
        showToast('info', 'Generating CSV export...');
        try {
            const params = new URLSearchParams();
            if (actionFilter !== 'all') params.append('action', actionFilter);
            if (entityFilter !== 'all') params.append('entityType', entityFilter);
            params.append('limit', '10000');

            const res = await fetch(`/api/audit?${params.toString()}`);
            const json = await res.json();

            if (!json.success || !json.data.length) {
                showToast('error', 'No data to export');
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
            link.setAttribute('href', URL.createObjectURL(blob));
            link.setAttribute('download', `anri_audit_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('success', 'CSV Export Downloaded');
        } catch {
            showToast('error', 'Export failed');
        }
    };

    const getLogDetails = (log: AuditLog): string => {
        if (log.metadata && typeof log.metadata.description === 'string') return log.metadata.description;
        if (log.metadata && log.metadata.details) return typeof log.metadata.details === 'string' ? log.metadata.details : JSON.stringify(log.metadata.details);
        if (log.previousValue && log.newValue) return 'Update operation';
        if (log.metadata) return JSON.stringify(log.metadata);
        return '-';
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    const truncateSig = (sig: string) => sig.slice(0, 8) + '...' + sig.slice(-4);

    const handleRowClick = (log: AuditLog) => {
        setSelectedLog(log);
        setShowModal(true);
    };

    // Filter logs by search
    const filteredLogs = logs.filter(log => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            log.action.toLowerCase().includes(searchLower) ||
            log.entityType.toLowerCase().includes(searchLower) ||
            log.entityId.toLowerCase().includes(searchLower) ||
            log.user?.name?.toLowerCase().includes(searchLower) ||
            log.ipAddress.includes(search)
        );
    });

    // Pagination
    const totalPages = Math.ceil(totalLogs / ITEMS_PER_PAGE);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, actionFilter, entityFilter]);

    // Stats
    const stats = {
        total: totalLogs,
        today: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
        critical: logs.filter(l => actionConfig[l.action]?.color === 'critical').length,
        verified: verifyResult?.valid ? verifyResult.totalEntries : 0,
    };

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

    if (loading && logs.length === 0) {
        return (
            <DashboardLayout title="Audit Nexus" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Loading audit logs...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Audit Nexus" subtitle="Cryptographically Verified Audit Trail">
            <div className={styles.container}>
                {/* Toast */}
                {toast && (
                    <div className={`${styles.toast} ${styles[toast.type]}`}>
                        {toast.type === 'success' && '✓'} {toast.type === 'error' && '✗'} {toast.type === 'info' && 'ℹ'} {toast.message}
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
                            placeholder="Search by action, user, entity, IP address..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Actions</option>
                            {Object.entries(actionConfig).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className={styles.filterSelect}>
                            <option value="all">All Entities</option>
                            <option value="Document">Document</option>
                            <option value="User">User</option>
                            <option value="PolicyRule">Policy</option>
                            <option value="Zone">Zone</option>
                            <option value="Session">Session</option>
                        </select>
                        <input type="date" className={styles.dateInput} value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                        <span className={styles.dateSep}>—</span>
                        <input type="date" className={styles.dateInput} value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                    </div>
                </section>

                {/* Stats Row */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.total.toLocaleString()}</span>
                        <span className={styles.statLabel}>Total Logs</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.today}</span>
                        <span className={styles.statLabel}>Today</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.critical}`}>
                        <span className={styles.statValue}>{stats.critical}</span>
                        <span className={styles.statLabel}>Critical Events</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.success}`}>
                        <span className={styles.statValue}>{verifyResult?.valid ? '✓' : '—'}</span>
                        <span className={styles.statLabel}>Chain Status</span>
                    </div>
                </section>

                {/* Action Buttons */}
                <section className={styles.actionBar}>
                    <Button variant="secondary" size="sm" onClick={handleVerifyChain} disabled={isVerifying}>
                        🔐 {isVerifying ? 'Verifying...' : 'Verify Chain Integrity'}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleExportCSV}>
                        📥 Export CSV
                    </Button>
                </section>

                {/* Verification Result */}
                {verifyResult && (
                    <div className={`${styles.verifyAlert} ${verifyResult.valid ? styles.alertSuccess : styles.alertError}`}>
                        <strong>{verifyResult.valid ? '✅ VALID' : '❌ INVALID'}</strong>
                        <span>Checked {verifyResult.totalEntries} records</span>
                        {verifyResult.invalidEntries > 0 && <span className={styles.alertBadge}>{verifyResult.invalidEntries} TAMPERED</span>}
                    </div>
                )}

                {/* Table */}
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
                                    <th>Signature</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr><td colSpan={7} className={styles.emptyRow}>No audit logs found</td></tr>
                                ) : (
                                    filteredLogs.map((log) => {
                                        const config = actionConfig[log.action] || { label: log.action, icon: '📋', color: 'normal' as const };
                                        return (
                                            <tr
                                                key={log.id}
                                                className={`${styles.row} ${config.color === 'critical' ? styles.criticalRow : ''}`}
                                                onClick={() => handleRowClick(log)}
                                            >
                                                <td>
                                                    <div className={styles.timestampCell}>
                                                        <span className={styles.date}>{formatDateTime(log.timestamp)}</span>
                                                        <span className={styles.timeAgo}>{getTimeAgo(log.timestamp)}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={config.color}
                                                        label={`${config.icon} ${config.label}`}
                                                        size="sm"
                                                    />
                                                </td>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        <span className={styles.userName}>{log.user?.name || 'System'}</span>
                                                        <span className={styles.userRole}>{log.user?.role || ''}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.entityCell}>
                                                        <span className={styles.entityType}>{log.entityType}</span>
                                                        <code className={styles.entityId}>{log.entityId.substring(0, 12)}...</code>
                                                    </div>
                                                </td>
                                                <td className={styles.detailsCell}>
                                                    {getLogDetails(log).substring(0, 50)}{getLogDetails(log).length > 50 ? '...' : ''}
                                                </td>
                                                <td><code className={styles.ipAddress}>{log.ipAddress}</code></td>
                                                <td>
                                                    <code className={styles.signature} title={log.signature}>
                                                        🔏 {truncateSig(log.signature)}
                                                    </code>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalLogs)} of {totalLogs} logs
                        </div>
                        <div className={styles.paginationControls}>
                            <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
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
                            <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                Next ›
                            </button>
                        </div>
                    </div>
                )}

                {/* Blockchain Info Banner */}
                <section className={styles.chainInfo}>
                    <div className={styles.chainIcon}>🔐</div>
                    <div className={styles.chainContent}>
                        <h4>Cryptographic Audit Chain</h4>
                        <p>All audit records are cryptographically signed and chain-linked using HMAC-SHA256. Each record includes timestamp, action hash, and previous record reference for tamper-proof compliance verification.</p>
                    </div>
                </section>

                {/* Detail Modal */}
                {showModal && selectedLog && (
                    <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div className={styles.modalTitle}>
                                    <h2>Audit Log Details</h2>
                                    <code className={styles.logId}>{selectedLog.id}</code>
                                </div>
                                <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                            </div>
                            <div className={styles.modalBody}>
                                {/* Action Banner */}
                                <div className={`${styles.actionBanner} ${styles[actionConfig[selectedLog.action]?.color || 'normal']}`}>
                                    <span className={styles.actionIcon}>{actionConfig[selectedLog.action]?.icon || '📋'}</span>
                                    <span className={styles.actionLabel}>{actionConfig[selectedLog.action]?.label || selectedLog.action}</span>
                                </div>

                                {/* Detail Grid */}
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Timestamp</span>
                                        <span className={styles.detailValue}>{formatDateTime(selectedLog.timestamp)}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>User</span>
                                        <span className={styles.detailValue}>{selectedLog.user?.name || 'System'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Role</span>
                                        <span className={styles.detailValue}>{selectedLog.user?.role || '-'}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Entity Type</span>
                                        <span className={styles.detailValue}>{selectedLog.entityType}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Entity ID</span>
                                        <code className={styles.detailCode}>{selectedLog.entityId}</code>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>IP Address</span>
                                        <code className={styles.detailCode}>{selectedLog.ipAddress}</code>
                                    </div>
                                </div>

                                {/* User Agent */}
                                <div className={styles.section}>
                                    <h4>User Agent</h4>
                                    <code className={styles.userAgentCode}>{selectedLog.userAgent}</code>
                                </div>

                                {/* Cryptographic Proof */}
                                <div className={styles.section}>
                                    <h4>🔐 Cryptographic Proof</h4>
                                    <div className={styles.cryptoGrid}>
                                        <div className={styles.cryptoItem}>
                                            <span className={styles.cryptoLabel}>Signature (HMAC-SHA256)</span>
                                            <code className={styles.cryptoValue}>{selectedLog.signature}</code>
                                        </div>
                                        <div className={styles.cryptoItem}>
                                            <span className={styles.cryptoLabel}>Previous Hash</span>
                                            <code className={styles.cryptoValue}>{selectedLog.previousHash || 'GENESIS'}</code>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata / Details */}
                                <div className={styles.section}>
                                    <h4>Details &amp; Metadata</h4>
                                    <pre className={styles.jsonDetails}>{JSON.stringify({
                                        details: getLogDetails(selectedLog),
                                        metadata: selectedLog.metadata,
                                        previousValue: selectedLog.previousValue,
                                        newValue: selectedLog.newValue
                                    }, null, 2)}</pre>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
