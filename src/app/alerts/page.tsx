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
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
    riskScore: number;
    explanation: string;
    contributingFactors: Array<{ factor: string; weight: number }>;
    confidence: number;
    createdAt: string;
    document: { id: string; rfidTag: string; title: string; classification: string } | null;
    movement: { fromZone: { name: string } | null; toZone: { name: string } | null } | null;
}

const severityColors: Record<string, 'critical' | 'high' | 'warning' | 'normal'> = {
    CRITICAL: 'critical',
    HIGH: 'critical',
    MEDIUM: 'warning',
    LOW: 'normal',
};

const alertTypeLabels: Record<string, string> = {
    UNAUTHORIZED_ZONE: 'Akses Zona Tidak Sah',
    AFTER_HOURS_ACCESS: 'Akses Di Luar Jam Kerja',
    UNUSUAL_FREQUENCY: 'Frekuensi Tidak Normal',
    RAPID_MOVEMENT: 'Pergerakan Cepat',
    PATTERN_DEVIATION: 'Penyimpangan Pola',
};

export default function AlertsPage() {
    const router = useRouter();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionSuccess, setActionSuccess] = useState(false);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const params = new URLSearchParams();
                if (statusFilter !== 'all') params.append('status', statusFilter);
                if (severityFilter !== 'all') params.append('severity', severityFilter);

                const res = await fetch(`/api/alerts?${params.toString()}`);
                const data = await res.json();
                if (data.success) {
                    setAlerts(data.data);
                }
            } catch (error) {
                console.error('Error fetching alerts:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAlerts();
    }, [statusFilter, severityFilter]);

    const formatTime = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 60) return `${diff} menit lalu`;
        if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
        return `${Math.floor(diff / 1440)} hari lalu`;
    };

    const handleInvestigate = async (alert: Alert) => {
        try {
            await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: alert.id, status: 'INVESTIGATING' }),
            });
            setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: 'INVESTIGATING' } : a));
        } catch (error) {
            console.error('Error updating alert:', error);
        }
    };

    const handleResolve = async (alert: Alert) => {
        try {
            await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: alert.id, status: 'RESOLVED', resolutionNotes: 'Resolved via dashboard' }),
            });
            setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: 'RESOLVED' } : a));
            setActionSuccess(true);
            setTimeout(() => setActionSuccess(false), 2000);
        } catch (error) {
            console.error('Error resolving alert:', error);
        }
    };

    const handleViewDetails = (alert: Alert) => {
        setSelectedAlert(alert);
        setShowDetailModal(true);
    };

    const stats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'CRITICAL').length,
        open: alerts.filter(a => a.status === 'OPEN').length,
        investigating: alerts.filter(a => a.status === 'INVESTIGATING').length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Anomaly Alerts" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Loading alerts from database...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Anomaly Alerts" subtitle="AI-Powered Document Security Monitoring">
            <div className={styles.container}>
                {/* Stats Row */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.total}</span><span className={styles.statLabel}>Total Alerts</span></div>
                    <div className={`${styles.statCard} ${styles.critical}`}><span className={styles.statValue}>{stats.critical}</span><span className={styles.statLabel}>Critical</span></div>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.open}</span><span className={styles.statLabel}>Open</span></div>
                    <div className={styles.statCard}><span className={styles.statValue}>{stats.investigating}</span><span className={styles.statLabel}>Investigating</span></div>
                </section>

                {/* Filters */}
                <section className={styles.filters}>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.filterSelect}>
                        <option value="all">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="INVESTIGATING">Investigating</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                    <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className={styles.filterSelect}>
                        <option value="all">All Severity</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </section>

                {/* Success Toast */}
                {actionSuccess && (
                    <div className={styles.toast}>✓ Alert resolved successfully</div>
                )}

                {/* Alerts List */}
                <div className={styles.alertsList}>
                    {alerts.length === 0 ? (
                        <Card><div className={styles.noAlerts}>✅ Tidak ada alert yang sesuai dengan filter</div></Card>
                    ) : (
                        alerts.map((alert) => (
                            <Card key={alert.id} className={`${styles.alertCard} ${styles[alert.severity.toLowerCase()]}`}>
                                <div className={styles.alertHeader}>
                                    <div className={styles.alertMeta}>
                                        <StatusBadge status={severityColors[alert.severity]} label={alert.severity} animate={alert.severity === 'CRITICAL'} />
                                        <span className={styles.alertType}>{alertTypeLabels[alert.alertType] || alert.alertType}</span>
                                        <span className={styles.alertTime}>{formatTime(alert.createdAt)}</span>
                                    </div>
                                    <div className={styles.alertStatus}>
                                        <span className={`${styles.statusBadge} ${styles[alert.status.toLowerCase()]}`}>{alert.status}</span>
                                    </div>
                                </div>
                                <div className={styles.alertBody}>
                                    <div className={styles.alertDocument}>
                                        <strong>{alert.document?.title || 'Unknown Document'}</strong>
                                        <code>{alert.document?.rfidTag || 'N/A'}</code>
                                    </div>
                                    <div className={styles.alertExplanation}>
                                        <span className={styles.xaiLabel}>🤖 AI Explanation:</span>
                                        <p>{alert.explanation}</p>
                                    </div>
                                    <div className={styles.alertMovement}>
                                        {alert.movement && (
                                            <span>{alert.movement.fromZone?.name || 'Unknown'} → {alert.movement.toZone?.name || 'Unknown'}</span>
                                        )}
                                    </div>
                                    <div className={styles.alertMetrics}>
                                        <span>Risk: {Math.round(alert.riskScore * 100)}%</span>
                                        <span>Confidence: {Math.round(alert.confidence * 100)}%</span>
                                    </div>
                                </div>
                                <div className={styles.alertActions}>
                                    <Button variant="secondary" size="sm" onClick={() => handleViewDetails(alert)}>View Details</Button>
                                    {alert.status === 'OPEN' && (
                                        <Button variant="primary" size="sm" onClick={() => handleInvestigate(alert)}>Investigate</Button>
                                    )}
                                    {alert.status === 'INVESTIGATING' && (
                                        <Button variant="primary" size="sm" onClick={() => handleResolve(alert)}>✓ Resolve</Button>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedAlert && (
                <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Alert Details</h2>
                            <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Type</span><span>{alertTypeLabels[selectedAlert.alertType] || selectedAlert.alertType}</span></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Severity</span><StatusBadge status={severityColors[selectedAlert.severity]} label={selectedAlert.severity} /></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Status</span><span>{selectedAlert.status}</span></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Document</span><span>{selectedAlert.document?.title || 'Unknown'}</span></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>Risk Score</span><span>{Math.round(selectedAlert.riskScore * 100)}%</span></div>
                                <div className={styles.detailItem}><span className={styles.detailLabel}>AI Confidence</span><span>{Math.round(selectedAlert.confidence * 100)}%</span></div>
                            </div>
                            <div className={styles.xaiSection}>
                                <h4>🤖 Explainable AI Analysis</h4>
                                <p>{selectedAlert.explanation}</p>
                                <h5>Contributing Factors:</h5>
                                <ul>
                                    {selectedAlert.contributingFactors?.map((f, i) => (
                                        <li key={i}>{f.factor}: {Math.round(f.weight * 100)}%</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
                            <Button variant="primary" onClick={() => router.push(`/documents/timeline?doc=${selectedAlert.document?.rfidTag}`)}>View Timeline</Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
