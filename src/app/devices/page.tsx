'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

interface Device {
    id: string;
    deviceId: string;
    hostname: string | null;
    ipAddress: string;
    macAddress: string | null;
    deviceType: 'DESKTOP' | 'LAPTOP' | 'MOBILE' | 'TABLET' | 'SERVER' | 'VIRTUAL';
    manufacturer: string | null;
    model: string | null;
    osName: string | null;
    osVersion: string | null;
    userName: string | null;
    userDepartment: string | null;
    status: 'ACTIVE' | 'SUSPENDED' | 'ISOLATED' | 'OFFLINE';
    isolatedAt: string | null;
    isolationReason: string | null;
    lastSeen: string;
    violationCount: number;
}

interface Summary {
    active: number;
    suspended: number;
    isolated: number;
    offline: number;
}

const statusConfig: Record<string, { label: string; color: 'normal' | 'warning' | 'critical' }> = {
    ACTIVE: { label: 'Active', color: 'normal' },
    ISOLATED: { label: 'Isolated', color: 'critical' },
    SUSPENDED: { label: 'Suspended', color: 'warning' },
    OFFLINE: { label: 'Offline', color: 'warning' },
};

const ITEMS_PER_PAGE = 10;

export default function DevicesPage() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [summary, setSummary] = useState<Summary>({ active: 0, suspended: 0, isolated: 0, offline: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Detail Modal
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const res = await fetch('/api/devices');
            const data = await res.json();
            if (data.success) {
                setDevices(data.data);
                setSummary(data.summary);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const formatLastSeen = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000);

        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const handleViewDetails = (device: Device) => {
        setSelectedDevice(device);
        setShowDetailModal(true);
    };

    const handleIsolateToggle = async (device: Device) => {
        const isReleasing = device.status === 'ISOLATED';

        if (isReleasing) {
            if (!confirm(`Release device ${device.deviceId} from isolation?`)) return;
        } else {
            if (!confirm(`ISOLATE device ${device.deviceId}? This will cut off network access.`)) return;
        }

        setProcessingId(device.id);
        try {
            if (isReleasing) {
                const res = await fetch('/api/devices', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceId: device.deviceId, status: 'ACTIVE' })
                });
                if (res.ok) {
                    showToast(`✅ Device ${device.deviceId} released`);
                    fetchDevices();
                    setShowDetailModal(false);
                }
            } else {
                const res = await fetch('/api/violations/isolate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceId: device.deviceId, reason: 'Manual isolation' })
                });
                if (res.ok) {
                    showToast(`🚫 Device ${device.deviceId} isolated`);
                    fetchDevices();
                    setShowDetailModal(false);
                }
            }
        } catch {
            showToast('Failed to process request');
        } finally {
            setProcessingId(null);
        }
    };

    // Filter devices
    const filteredDevices = devices.filter(d => {
        const matchesSearch =
            d.deviceId.toLowerCase().includes(search.toLowerCase()) ||
            (d.hostname?.toLowerCase() || '').includes(search.toLowerCase()) ||
            d.ipAddress.includes(search) ||
            (d.macAddress?.toLowerCase() || '').includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredDevices.length / ITEMS_PER_PAGE);
    const paginatedDevices = filteredDevices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when filters change
    const handleFilterChange = (newFilter: string) => {
        setStatusFilter(newFilter);
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 6) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    // Stats from API summary
    const stats = {
        total: devices.length,
        active: summary.active,
        isolated: summary.isolated,
        offline: summary.offline,
        withViolations: devices.filter(d => d.violationCount > 0).length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Device Inventory" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Memuat data device...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Device Inventory" subtitle="Endpoint Agent Management">
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
                            placeholder="Cari Device ID, Hostname, IP, atau MAC..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="all">Semua Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="ISOLATED">Isolated</option>
                            <option value="OFFLINE">Offline</option>
                        </select>
                    </div>
                </section>

                {/* Stats Row - Clickable Filters */}
                <section className={styles.statsRow}>
                    <div
                        className={`${styles.statCard} ${statusFilter === 'all' ? styles.active : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Device</span>
                    </div>
                    <div
                        className={`${styles.statCard} ${styles.success} ${statusFilter === 'ACTIVE' ? styles.active : ''}`}
                        onClick={() => handleFilterChange('ACTIVE')}
                    >
                        <span className={styles.statValue}>{stats.active}</span>
                        <span className={styles.statLabel}>Active</span>
                    </div>
                    <div
                        className={`${styles.statCard} ${styles.danger} ${statusFilter === 'ISOLATED' ? styles.active : ''}`}
                        onClick={() => handleFilterChange('ISOLATED')}
                    >
                        <span className={styles.statValue}>{stats.isolated}</span>
                        <span className={styles.statLabel}>Isolated</span>
                    </div>
                    <div
                        className={`${styles.statCard} ${statusFilter === 'OFFLINE' ? styles.active : ''}`}
                        onClick={() => handleFilterChange('OFFLINE')}
                    >
                        <span className={styles.statValue}>{stats.offline}</span>
                        <span className={styles.statLabel}>Offline</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.warning}`}>
                        <span className={styles.statValue}>{stats.withViolations}</span>
                        <span className={styles.statLabel}>With Violations</span>
                    </div>
                </section>

                {/* Table */}
                <Card noPadding>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Device</th>
                                    <th>User</th>
                                    <th>Model</th>
                                    <th>IP Address</th>
                                    <th>MAC Address</th>
                                    <th>Status</th>
                                    <th>Violations</th>
                                    <th>Last Seen</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDevices.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className={styles.emptyRow}>
                                            Tidak ada device ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDevices.map((device) => (
                                        <tr
                                            key={device.id}
                                            className={`${styles.row} ${device.status === 'ISOLATED' ? styles.isolatedRow : ''}`}
                                            onClick={() => handleViewDetails(device)}
                                        >
                                            <td>
                                                <div className={styles.deviceCell}>
                                                    {device.deviceType && (
                                                        <span className={styles.deviceType}>{device.deviceType}</span>
                                                    )}
                                                    <code className={styles.deviceId}>{device.deviceId}</code>
                                                    <span className={styles.hostname}>{device.hostname || '-'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <span className={styles.userName}>{device.userName || '-'}</span>
                                                    {device.userDepartment && (
                                                        <span className={styles.userDept}>{device.userDepartment}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.modelCell}>
                                                    <span className={styles.manufacturer}>{device.manufacturer || '-'}</span>
                                                    {device.model && (
                                                        <span className={styles.modelName}>{device.model}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <code className={styles.ipAddress}>{device.ipAddress}</code>
                                            </td>
                                            <td>
                                                <code className={styles.macAddress}>{device.macAddress || '-'}</code>
                                            </td>
                                            <td>
                                                <StatusBadge
                                                    status={statusConfig[device.status]?.color || 'normal'}
                                                    label={statusConfig[device.status]?.label || device.status}
                                                    size="sm"
                                                />
                                            </td>
                                            <td>
                                                {device.violationCount > 0 ? (
                                                    <span className={styles.violationCount}>
                                                        <span className={styles.violationDot} />
                                                        {device.violationCount}
                                                    </span>
                                                ) : (
                                                    <span className={styles.noViolation}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={styles.lastSeen}>{formatLastSeen(device.lastSeen)}</span>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        title="View Details"
                                                        onClick={(e) => { e.stopPropagation(); handleViewDetails(device); }}
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className={`${styles.actionBtn} ${device.status === 'ISOLATED' ? styles.releaseBtn : styles.dangerBtn}`}
                                                        title={device.status === 'ISOLATED' ? 'Release' : 'Isolate'}
                                                        onClick={(e) => { e.stopPropagation(); handleIsolateToggle(device); }}
                                                        disabled={!!processingId}
                                                    >
                                                        {device.status === 'ISOLATED' ? (
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                                                            </svg>
                                                        ) : (
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                            </svg>
                                                        )}
                                                    </button>
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
                            Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredDevices.length)} dari {filteredDevices.length}
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
                                        className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className={styles.ellipsis}>...</span>
                                )
                            ))}
                            <button
                                className={styles.pageBtn}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedDevice && (
                <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Device Details</h2>
                            <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            {/* Status Banner */}
                            {selectedDevice.status === 'ISOLATED' && (
                                <div className={styles.isolatedBanner}>
                                    🚫 Device ini sedang TERISOLASI dari jaringan
                                </div>
                            )}

                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Device ID</span>
                                    <code className={styles.detailCode}>{selectedDevice.deviceId}</code>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Hostname</span>
                                    <span className={styles.detailValue}>{selectedDevice.hostname || '-'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>IP Address</span>
                                    <code className={styles.detailCode}>{selectedDevice.ipAddress}</code>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>MAC Address</span>
                                    <code className={styles.detailCode}>{selectedDevice.macAddress || '-'}</code>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Status</span>
                                    <StatusBadge
                                        status={statusConfig[selectedDevice.status]?.color || 'normal'}
                                        label={statusConfig[selectedDevice.status]?.label || selectedDevice.status}
                                    />
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Violation Count</span>
                                    <span className={selectedDevice.violationCount > 0 ? styles.violationText : styles.detailValue}>
                                        {selectedDevice.violationCount} pelanggaran
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Last Seen</span>
                                    <span className={styles.detailValue}>{new Date(selectedDevice.lastSeen).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            {/* Isolation Info */}
                            {selectedDevice.status === 'ISOLATED' && selectedDevice.isolatedAt && (
                                <div className={styles.isolationInfo}>
                                    <h4>Informasi Isolasi</h4>
                                    <div className={styles.isolationDetails}>
                                        <div>
                                            <span className={styles.detailLabel}>Waktu Isolasi</span>
                                            <span>{new Date(selectedDevice.isolatedAt).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div>
                                            <span className={styles.detailLabel}>Alasan</span>
                                            <span>{selectedDevice.isolationReason || 'Tidak ada alasan'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Violation Warning */}
                            {selectedDevice.violationCount > 0 && selectedDevice.status !== 'ISOLATED' && (
                                <div className={styles.warningBox}>
                                    ⚠️ Device ini memiliki {selectedDevice.violationCount} pelanggaran tercatat. Pertimbangkan untuk mengisolasi jika terus bermasalah.
                                </div>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </Button>
                            <Button
                                variant={selectedDevice.status === 'ISOLATED' ? 'primary' : 'danger'}
                                onClick={() => handleIsolateToggle(selectedDevice)}
                                disabled={!!processingId}
                            >
                                {processingId === selectedDevice.id ? 'Processing...' :
                                    selectedDevice.status === 'ISOLATED' ? '🔓 Release Device' : '🚫 Isolate Device'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
