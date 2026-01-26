'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

interface Alert {
    id: string;
    alertType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE' | 'ESCALATED';
    riskScore: number;
    explanation: string;
    contributingFactors: Array<{ factor: string; weight: number }>;
    confidence: number;
    createdAt: string;
    document: { id: string; rfidTag: string; title: string; classification: string } | null;
    movement: { fromZone: { name: string } | null; toZone: { name: string } | null } | null;
}

const alertTypeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    UNAUTHORIZED_ZONE: {
        label: 'Akses Zona Tidak Sah',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
    },
    AFTER_HOURS_ACCESS: {
        label: 'Akses Di Luar Jam Kerja',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    },
    UNUSUAL_FREQUENCY: {
        label: 'Frekuensi Tidak Normal',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
    },
    RAPID_MOVEMENT: {
        label: 'Pergerakan Cepat',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
    },
    PATTERN_DEVIATION: {
        label: 'Penyimpangan Pola',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
    },
};

const severityConfig: Record<string, { color: string; bgColor: string }> = {
    CRITICAL: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
    HIGH: { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
    MEDIUM: { color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.15)' },
    LOW: { color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)' },
};

export default function AlertsPage() {
    const router = useRouter();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const fetchAlerts = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const res = await fetch('/api/alerts');
            const data = await res.json();
            if (data.success) {
                setAlerts(data.data);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts(true);
        const interval = setInterval(() => fetchAlerts(false), 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSimulateBreach = async () => {
        setIsSimulating(true);
        try {
            const res = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'SIMULATE', zoneId: 'zone-l1-id' })
            });
            const data = await res.json();
            if (data.success) {
                fetchAlerts();
                setSelectedAlert(data.data);
            }
        } catch (error) {
            console.error('Simulation failed:', error);
        } finally {
            setIsSimulating(false);
        }
    };

    const updateAlertStatus = async (alert: Alert, status: string, notes: string) => {
        try {
            await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: alert.id, status, resolutionNotes: notes }),
            });
            setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: status as Alert['status'] } : a));
            setSelectedAlert(null);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 1) return 'Baru saja';
        if (diff < 60) return `${diff} menit lalu`;
        if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
        return `${Math.floor(diff / 1440)} hari lalu`;
    };

    const filteredAlerts = alerts.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'open') return a.status === 'OPEN';
        if (filter === 'investigating') return a.status === 'INVESTIGATING' || a.status === 'ESCALATED';
        return a.status === 'RESOLVED' || a.status === 'FALSE_POSITIVE';
    });

    const stats = {
        total: alerts.length,
        open: alerts.filter(a => a.status === 'OPEN').length,
        critical: alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'OPEN').length,
        investigating: alerts.filter(a => a.status === 'INVESTIGATING' || a.status === 'ESCALATED').length,
        resolved: alerts.filter(a => a.status === 'RESOLVED').length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Document Alerts" subtitle="Loading...">
                <div className={styles.loading}>Memuat data alert...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Document Alerts" subtitle="Anomaly Detection & Response">
            <div className={styles.container}>
                {/* Stats Row */}
                <section className={styles.statsRow}>
                    <div className={`${styles.statCard} ${filter === 'open' ? styles.active : ''}`} onClick={() => setFilter('open')}>
                        <div className={`${styles.statIcon} ${styles.critical}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.open}</span>
                            <span className={styles.statLabel}>Perlu Tindakan</span>
                        </div>
                        {stats.critical > 0 && <span className={styles.criticalBadge}>{stats.critical} Kritis</span>}
                    </div>
                    <div className={`${styles.statCard} ${filter === 'investigating' ? styles.active : ''}`} onClick={() => setFilter('investigating')}>
                        <div className={`${styles.statIcon} ${styles.warning}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.investigating}</span>
                            <span className={styles.statLabel}>Dalam Investigasi</span>
                        </div>
                    </div>
                    <div className={`${styles.statCard} ${filter === 'resolved' ? styles.active : ''}`} onClick={() => setFilter('resolved')}>
                        <div className={`${styles.statIcon} ${styles.success}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.resolved}</span>
                            <span className={styles.statLabel}>Sudah Ditangani</span>
                        </div>
                    </div>
                    <div className={`${styles.statCard} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>
                        <div className={styles.statIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.total}</span>
                            <span className={styles.statLabel}>Total Semua</span>
                        </div>
                    </div>
                    <button className={styles.simulateBtn} onClick={handleSimulateBreach} disabled={isSimulating}>
                        {isSimulating ? 'Simulating...' : 'Demo: Simulate Breach'}
                    </button>
                </section>

                {/* Main Grid */}
                <div className={styles.mainGrid}>
                    {/* Alert List */}
                    <div className={styles.listSection}>
                        <div className={styles.sectionHeader}>
                            <h3>Daftar Alert</h3>
                            <span className={styles.count}>{filteredAlerts.length} alert</span>
                        </div>
                        <div className={styles.alertList}>
                            {filteredAlerts.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </div>
                                    <h3>Tidak Ada Alert</h3>
                                    <p>Sistem aman, tidak ada anomali terdeteksi.</p>
                                </div>
                            ) : (
                                filteredAlerts.map(alert => {
                                    const typeConfig = alertTypeConfig[alert.alertType] || { label: alert.alertType, icon: null };
                                    const sevConfig = severityConfig[alert.severity];

                                    return (
                                        <div
                                            key={alert.id}
                                            className={`${styles.alertCard} ${selectedAlert?.id === alert.id ? styles.selected : ''} ${alert.status === 'OPEN' && alert.severity === 'CRITICAL' ? styles.criticalCard : ''}`}
                                            onClick={() => setSelectedAlert(alert)}
                                        >
                                            <div className={styles.alertIcon} style={{ background: sevConfig.bgColor, color: sevConfig.color }}>
                                                {typeConfig.icon}
                                            </div>
                                            <div className={styles.alertInfo}>
                                                <div className={styles.alertHeader}>
                                                    <span className={styles.alertType}>{typeConfig.label}</span>
                                                    <span className={styles.alertTime}>{formatTimeAgo(alert.createdAt)}</span>
                                                </div>
                                                <div className={styles.alertDoc}>{alert.document?.title || 'Dokumen Tidak Dikenal'}</div>
                                                <div className={styles.alertMeta}>
                                                    <span className={styles.severityBadge} style={{ background: sevConfig.bgColor, color: sevConfig.color }}>
                                                        {alert.severity}
                                                    </span>
                                                    <span className={`${styles.statusBadge} ${styles[alert.status.toLowerCase()]}`}>
                                                        {alert.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Detail Section */}
                    <div className={styles.detailSection}>
                        {selectedAlert ? (
                            <Card className={styles.detailCard}>
                                <AlertDetail
                                    alert={selectedAlert}
                                    onAction={updateAlertStatus}
                                    onViewTimeline={() => router.push(`/documents/${selectedAlert.document?.id}/timeline`)}
                                />
                            </Card>
                        ) : (
                            <Card className={styles.emptyCard}>
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                        </svg>
                                    </div>
                                    <h3>Pilih Alert</h3>
                                    <p>Klik alert dari daftar untuk melihat detail dan mengambil tindakan.</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function AlertDetail({ alert, onAction, onViewTimeline }: {
    alert: Alert;
    onAction: (alert: Alert, status: string, notes: string) => void;
    onViewTimeline: () => void;
}) {
    const typeConfig = alertTypeConfig[alert.alertType] || { label: alert.alertType, icon: null };
    const sevConfig = severityConfig[alert.severity];

    return (
        <>
            {/* Header */}
            <div className={styles.detailHeader}>
                <div>
                    <h2>{typeConfig.label}</h2>
                    <p className={styles.detailSubtitle}>ID: {alert.id.slice(0, 12)}...</p>
                </div>
                <div className={styles.detailBadges}>
                    <span className={styles.severityBadge} style={{ background: sevConfig.bgColor, color: sevConfig.color, border: `1px solid ${sevConfig.color}` }}>
                        {alert.severity}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            {alert.status === 'OPEN' && (
                <div className={styles.actionButtons}>
                    <Button variant="primary" className={styles.actionBtn} onClick={() => onAction(alert, 'INVESTIGATING', 'Security dispatched')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                        Dispatch Security
                    </Button>
                    <Button variant="secondary" className={styles.actionBtn} onClick={() => onAction(alert, 'RESOLVED', 'Marked as resolved')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        Resolve
                    </Button>
                    {(alert.severity === 'HIGH' || alert.severity === 'CRITICAL') && (
                        <Button variant="danger" className={styles.actionBtn} onClick={() => onAction(alert, 'ESCALATED', 'Escalated')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" /></svg>
                            Escalate
                        </Button>
                    )}
                </div>
            )}

            {alert.status !== 'OPEN' && (
                <div className={styles.statusBanner} data-status={alert.status.toLowerCase()}>
                    Status: {alert.status.replace('_', ' ')}
                </div>
            )}

            {/* Detail Stats */}
            <div className={styles.detailStats}>
                <div className={styles.detailStatItem}>
                    <span className={styles.detailStatLabel}>Dokumen</span>
                    <span className={styles.detailStatValue}>{alert.document?.title || '-'}</span>
                </div>
                <div className={styles.detailStatItem}>
                    <span className={styles.detailStatLabel}>Klasifikasi</span>
                    <span className={styles.detailStatValue}>{alert.document?.classification || '-'}</span>
                </div>
                <div className={styles.detailStatItem}>
                    <span className={styles.detailStatLabel}>RFID Tag</span>
                    <span className={`${styles.detailStatValue} ${styles.mono}`}>{alert.document?.rfidTag || '-'}</span>
                </div>
                <div className={styles.detailStatItem}>
                    <span className={styles.detailStatLabel}>Risk Score</span>
                    <span className={styles.detailStatValue} style={{ color: sevConfig.color }}>{Math.round(alert.riskScore * 100)}%</span>
                </div>
            </div>

            {/* Movement */}
            {alert.movement && (
                <div className={styles.movementBox}>
                    <h4>Pergerakan Terdeteksi</h4>
                    <div className={styles.movementPath}>
                        <span className={styles.zoneFrom}>{alert.movement.fromZone?.name || 'Unknown'}</span>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.zoneTo}>{alert.movement.toZone?.name || 'Unknown'}</span>
                    </div>
                </div>
            )}

            {/* AI Explanation */}
            <div className={styles.aiBox}>
                <div className={styles.aiHeader}>
                    <span>AI Analysis</span>
                    <span className={styles.confidence}>{Math.round(alert.confidence * 100)}% confident</span>
                </div>
                <p>{alert.explanation}</p>

                {alert.contributingFactors && alert.contributingFactors.length > 0 && (
                    <div className={styles.factors}>
                        <h4>Faktor Kontributor</h4>
                        {alert.contributingFactors.map((f, i) => (
                            <div key={i} className={styles.factorRow}>
                                <span className={styles.factorName}>{f.factor}</span>
                                <div className={styles.factorBar}>
                                    <div className={styles.factorFill} style={{ width: `${f.weight * 100}%` }} />
                                </div>
                                <span className={styles.factorValue}>{Math.round(f.weight * 100)}%</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Timeline */}
            <Button variant="secondary" onClick={onViewTimeline} style={{ width: '100%', marginTop: 'var(--space-4)' }}>
                Lihat Timeline Evidence
            </Button>
        </>
    );
}
