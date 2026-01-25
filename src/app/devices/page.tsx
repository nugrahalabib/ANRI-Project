'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button } from '@/components/ui';
import styles from './page.module.css';

interface Device {
    id: string;
    deviceId: string;
    hostname: string | null;
    ipAddress: string;
    macAddress: string | null;
    status: 'ACTIVE' | 'SUSPENDED' | 'ISOLATED' | 'OFFLINE';
    isolatedAt: string | null;
    isolationReason: string | null;
    lastSeen: string;
}

export default function DevicesPage() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const res = await fetch('/api/devices');
            const data = await res.json();
            if (data.success) {
                setDevices(data.data);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIsolateToggle = async (device: Device) => {
        const isReleasing = device.status === 'ISOLATED';

        if (isReleasing) {
            if (!confirm(`Release device ${device.deviceId} from isolation?`)) return;
        } else {
            if (!confirm(`Are you sure you want to ISOLATE device ${device.deviceId}? This will cut off network access.`)) return;
        }

        setProcessingId(device.id);
        try {
            if (isReleasing) {
                // Release: Use PATCH /api/devices
                const res = await fetch('/api/devices', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceId: device.deviceId, status: 'ACTIVE' })
                });
                const json = await res.json();
                if (json.success) {
                    showToast(`✅ Device ${device.deviceId} released from isolation.`);
                    fetchDevices();
                } else {
                    showToast(`Error: ${json.error}`);
                }
            } else {
                // Isolate: Use POST /api/violations/isolate
                const res = await fetch('/api/violations/isolate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceId: device.deviceId, reason: 'Manual isolation from Inventory' })
                });
                const json = await res.json();
                if (json.success) {
                    showToast(`🚫 Device ${device.deviceId} ISOLATED successfully.`);
                    fetchDevices();
                } else {
                    showToast(`Error: ${json.error}`);
                }
            }
        } catch (error) {
            console.error('Device action error:', error);
            showToast('Failed to contact server');
        } finally {
            setProcessingId(null);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const filteredDevices = devices.filter(d => {
        const matchesSearch = d.deviceId.toLowerCase().includes(search.toLowerCase()) ||
            (d.hostname?.toLowerCase() || '').includes(search.toLowerCase()) ||
            d.ipAddress.includes(search);
        const matchesFilter = filter === 'ALL' || d.status === filter;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: devices.length,
        online: devices.filter(d => d.status === 'ACTIVE').length,
        isolated: devices.filter(d => d.status === 'ISOLATED').length,
        offline: devices.filter(d => d.status === 'OFFLINE').length,
    };

    return (
        <DashboardLayout title="Device Inventory" subtitle="Endpoint Agent Management">
            <div className={styles.container}>
                {toast && <div className={styles.toast}>{toast}</div>}

                {/* Stats Row */}
                <section className={styles.statsRow}>
                    <Card className={styles.statCard}>
                        <div className={styles.statValue}>{stats.total}</div>
                        <div className={styles.statLabel}>Total Devices</div>
                    </Card>
                    <Card className={styles.statCard}>
                        <div className={`${styles.statValue} ${styles.green}`}>{stats.online}</div>
                        <div className={styles.statLabel}>Online</div>
                    </Card>
                    <Card className={styles.statCard}>
                        <div className={`${styles.statValue} ${styles.red}`}>{stats.isolated}</div>
                        <div className={styles.statLabel}>Isolated</div>
                    </Card>
                    <Card className={styles.statCard}>
                        <div className={`${styles.statValue} ${styles.grey}`}>{stats.offline}</div>
                        <div className={styles.statLabel}>Offline</div>
                    </Card>
                </section>

                {/* Controls */}
                <div className={styles.controls}>
                    <input
                        type="text"
                        placeholder="Search Hostname, IP, or ID..."
                        className={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className={styles.filterSelect}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="ISOLATED">Isolated</option>
                        <option value="OFFLINE">Offline</option>
                    </select>
                </div>

                {/* Table */}
                <Card noPadding className={styles.tableCard}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Device ID</th>
                                <th>Hostname</th>
                                <th>IP Address</th>
                                <th>Status</th>
                                <th>Last Seen</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className={styles.loading}>Loading devices...</td></tr>
                            ) : filteredDevices.length === 0 ? (
                                <tr><td colSpan={6} className={styles.empty}>No devices found matching your criteria.</td></tr>
                            ) : (
                                filteredDevices.map(device => (
                                    <tr key={device.id} className={device.status === 'ISOLATED' ? styles.rowIsolated : ''}>
                                        <td className={styles.mono}>{device.deviceId}</td>
                                        <td>{device.hostname || '-'}</td>
                                        <td className={styles.mono}>{device.ipAddress}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[device.status]}`}>
                                                {device.status}
                                            </span>
                                        </td>
                                        <td className={styles.textGrey}>{new Date(device.lastSeen).toLocaleString()}</td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant={device.status === 'ISOLATED' ? 'secondary' : 'danger'}
                                                onClick={() => handleIsolateToggle(device)}
                                                disabled={!!processingId}
                                            >
                                                {processingId === device.id ? 'Processing...' :
                                                    device.status === 'ISOLATED' ? 'Release' : '🚫 Isolate'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>
        </DashboardLayout>
    );
}
