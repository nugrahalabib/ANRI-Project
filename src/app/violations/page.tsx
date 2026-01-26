'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
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

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const severityColors: Record<string, 'critical' | 'warning' | 'normal'> = {
    CRITICAL: 'critical',
    HIGH: 'critical',
    MEDIUM: 'warning',
    LOW: 'normal',
};

const actionLabels: Record<string, { label: string; color: 'critical' | 'warning' | 'normal' }> = {
    BLOCK: { label: 'Blocked', color: 'critical' },
    WARN: { label: 'Warned', color: 'warning' },
    LOG_ONLY: { label: 'Logged', color: 'normal' },
    SUSPEND_ACCESS: { label: 'Suspended', color: 'critical' },
    ISOLATE_DEVICE: { label: 'Isolated', color: 'critical' },
};

const categoryLabels: Record<string, string> = {
    GAMBLING: 'Gambling',
    SOCIAL_MEDIA: 'Social Media',
    STREAMING: 'Streaming',
    MALWARE: 'Malware',
    ADULT_CONTENT: 'Adult Content',
    ILLEGAL_CONTENT: 'Illegal Content',
};

const ITEMS_PER_PAGE = 15;

export default function ViolationsPage() {
    const [violations, setViolations] = useState<Violation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0 });
    const [toast, setToast] = useState('');

    // Detail Modal
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchViolations();
    }, [severityFilter, actionFilter, currentPage]);

    async function fetchViolations() {
        try {
            const params = new URLSearchParams();
            if (severityFilter !== 'all') params.append('severity', severityFilter);
            if (actionFilter !== 'all') params.append('action', actionFilter);
            params.append('page', currentPage.toString());
            params.append('limit', ITEMS_PER_PAGE.toString());

            const res = await fetch(`/api/violations?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setViolations(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const handleExportCSV = () => {
        if (violations.length === 0) {
            showToast('Tidak ada data');
            return;
        }

        const headers = ['Waktu', 'User', 'Departemen', 'Policy', 'Category', 'Target', 'Action', 'Severity', 'IP'];
        const rows = violations.map(v => [
            new Date(v.timestamp).toLocaleString('id-ID'),
            v.user?.name || '-',
            v.user?.department || '-',
            v.policy?.name || '-',
            v.policy?.category || '-',
            v.dnsQuery || v.requestUrl,
            v.actionTaken,
            v.severity,
            v.ipAddress
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `violations-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showToast('✓ Berhasil export CSV');
    };

    const handleViewDetails = (v: Violation) => {
        setSelectedViolation(v);
        setShowDetailModal(true);
    };

    const handleIsolateDevice = async (violation: Violation) => {
        if (!confirm(`Isolasi device ${violation.deviceId}?`)) return;

        try {
            const res = await fetch('/api/violations/isolate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: violation.deviceId, reason: violation.policy?.name })
            });
            if (res.ok) {
                showToast(`🚫 Device ${violation.deviceId} diisolasi`);
                setViolations(violations.map(v =>
                    v.deviceId === violation.deviceId ? { ...v, actionTaken: 'ISOLATE_DEVICE' } : v
                ));
                setShowDetailModal(false);
            }
        } catch {
            showToast('Gagal mengisolasi device');
        }
    };

    // Filter by search
    const filteredViolations = violations.filter(v => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            v.user?.name?.toLowerCase().includes(s) ||
            v.dnsQuery?.toLowerCase().includes(s) ||
            v.requestUrl?.toLowerCase().includes(s) ||
            v.policy?.name?.toLowerCase().includes(s)
        );
    });

    const stats = {
        total: pagination.total,
        blocked: violations.filter(v => v.actionTaken === 'BLOCK').length,
        critical: violations.filter(v => v.severity === 'CRITICAL' || v.severity === 'HIGH').length,
        today: violations.filter(v => new Date(v.timestamp).toDateString() === new Date().toDateString()).length,
    };

    // Pagination helpers
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const total = pagination.totalPages;
        if (total <= 6) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', total);
            } else if (currentPage >= total - 2) {
                pages.push(1, '...', total - 3, total - 2, total - 1, total);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', total);
            }
        }
        return pages;
    };

    if (loading && violations.length === 0) {
        return (
            <DashboardLayout title="Policy Violations" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Memuat data pelanggaran...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Policy Violations" subtitle="Log Pelanggaran Kebijakan Internet">
            <div className={styles.container}>
                {toast && <div className={styles.toast}>{toast}</div>}

                {/* Controls */}
                <section className={styles.controls}>
                    <div className={styles.searchBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari user, domain, atau policy..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }} className={styles.filterSelect}>
                            <option value="all">Semua Severity</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }} className={styles.filterSelect}>
                            <option value="all">Semua Action</option>
                            <option value="BLOCK">Blocked</option>
                            <option value="WARN">Warned</option>
                            <option value="LOG_ONLY">Logged</option>
                        </select>
                        <Button variant="secondary" onClick={handleExportCSV}>
                            Export CSV
                        </Button>
                    </div>
                </section>

                {/* Stats Row */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.danger}`}>
                        <span className={styles.statValue}>{stats.blocked}</span>
                        <span className={styles.statLabel}>Blocked</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.warning}`}>
                        <span className={styles.statValue}>{stats.critical}</span>
                        <span className={styles.statLabel}>Critical/High</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.today}</span>
                        <span className={styles.statLabel}>Hari Ini</span>
                    </div>
                </section>

                {/* Table */}
                <Card noPadding>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>User</th>
                                    <th>Policy / Category</th>
                                    <th>Target Domain</th>
                                    <th>Action</th>
                                    <th>Severity</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredViolations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={styles.emptyRow}>
                                            Tidak ada pelanggaran ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    filteredViolations.map((v) => (
                                        <tr key={v.id} className={styles.row} onClick={() => handleViewDetails(v)}>
                                            <td>
                                                <span className={styles.timestamp}>{formatTime(v.timestamp)}</span>
                                            </td>
                                            <td>
                                                <div className={styles.userInfo}>
                                                    <span className={styles.userName}>{v.user?.name || 'Unknown'}</span>
                                                    <span className={styles.userDept}>{v.user?.department || '-'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.policyInfo}>
                                                    <span className={styles.policyName}>{v.policy?.name || 'Unknown'}</span>
                                                    <span className={styles.policyCategory}>{categoryLabels[v.policy?.category || ''] || v.policy?.category || '-'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.targetDomain}>{v.dnsQuery || v.requestUrl || '-'}</span>
                                            </td>
                                            <td>
                                                <StatusBadge
                                                    status={actionLabels[v.actionTaken]?.color || 'normal'}
                                                    label={actionLabels[v.actionTaken]?.label || v.actionTaken}
                                                    size="sm"
                                                />
                                            </td>
                                            <td>
                                                <StatusBadge
                                                    status={severityColors[v.severity]}
                                                    label={v.severity}
                                                    size="sm"
                                                />
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button className={styles.actionBtn} title="View Details" onClick={(e) => { e.stopPropagation(); handleViewDetails(v); }}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                    </button>
                                                    {v.actionTaken !== 'ISOLATE_DEVICE' && (
                                                        <button className={`${styles.actionBtn} ${styles.dangerBtn}`} title="Isolate Device" onClick={(e) => { e.stopPropagation(); handleIsolateDevice(v); }}>
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} dari {pagination.total}
                        </div>
                        <div className={styles.paginationControls}>
                            <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                ‹ Prev
                            </button>
                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button key={idx} className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''}`} onClick={() => setCurrentPage(page)}>
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className={styles.ellipsis}>...</span>
                                )
                            ))}
                            <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages}>
                                Next ›
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedViolation && (
                <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Detail Pelanggaran</h2>
                            <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>User</span>
                                    <span className={styles.detailValue}>{selectedViolation.user?.name || '-'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Departemen</span>
                                    <span className={styles.detailValue}>{selectedViolation.user?.department || '-'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Policy</span>
                                    <span className={styles.detailValue}>{selectedViolation.policy?.name || '-'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Category</span>
                                    <span className={styles.detailValue}>{categoryLabels[selectedViolation.policy?.category || ''] || selectedViolation.policy?.category || '-'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Severity</span>
                                    <StatusBadge status={severityColors[selectedViolation.severity]} label={selectedViolation.severity} />
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Action Taken</span>
                                    <StatusBadge status={actionLabels[selectedViolation.actionTaken]?.color || 'normal'} label={actionLabels[selectedViolation.actionTaken]?.label || selectedViolation.actionTaken} />
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Device ID</span>
                                    <code className={styles.detailCode}>{selectedViolation.deviceId}</code>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>IP Address</span>
                                    <code className={styles.detailCode}>{selectedViolation.ipAddress}</code>
                                </div>
                            </div>

                            <div className={styles.urlBox}>
                                <span className={styles.detailLabel}>Target URL / Domain</span>
                                <code className={styles.urlCode}>{selectedViolation.dnsQuery || selectedViolation.requestUrl || '-'}</code>
                            </div>

                            <div className={styles.urlBox}>
                                <span className={styles.detailLabel}>Matched Pattern</span>
                                <code className={styles.urlCode}>{selectedViolation.matchedPattern || '-'}</code>
                            </div>

                            <div className={styles.timestampBox}>
                                <span>⏱️ {new Date(selectedViolation.timestamp).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Tutup</Button>
                            {selectedViolation.actionTaken !== 'ISOLATE_DEVICE' && (
                                <Button variant="danger" onClick={() => handleIsolateDevice(selectedViolation)}>
                                    🔒 Isolate Device
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
