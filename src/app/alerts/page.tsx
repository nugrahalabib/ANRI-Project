'use client';

import React, { useState, useEffect, useRef } from 'react';
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

    // Demo State
    const [isSimulating, setIsSimulating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Polling Logic
    const fetchAlerts = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (severityFilter !== 'all') params.append('severity', severityFilter);

            const res = await fetch(`/api/alerts?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setAlerts(data.data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts(true);
        const interval = setInterval(() => fetchAlerts(false), 5000); // 5s Poll
        return () => clearInterval(interval);
    }, [statusFilter, severityFilter]);

    // Demo: Simulate Breach
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
                fetchAlerts(); // Refresh immediately
                // Force open the new alert details
                setSelectedAlert(data.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Simulation failed:', error);
        } finally {
            setIsSimulating(false);
        }
    };

    // Action: Dispatch Security
    const handleDispatchSecurity = async (alert: Alert) => {
        try {
            await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: alert.id, status: 'INVESTIGATING', resolutionNotes: 'DISPATCHED_SECURITY' }),
            });
            // Optimistic update
            setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: 'INVESTIGATING' } : a));

            // Show toast or dispatch feedback (could add state for visual feedback)
            if (selectedAlert?.id === alert.id) {
                setShowDetailModal(false);
            }
        } catch (error) {
            console.error('Dispatch failed:', error);
        }
    };

    const handleEscalate = async (alert: Alert) => {
        try {
            await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: alert.id, status: 'ESCALATED', resolutionNotes: 'Escalated to Supervisor' }),
            });
            setAlerts(alerts.map(a => a.id === alert.id ? { ...a, status: 'ESCALATED' } : a));
            if (selectedAlert?.id === alert.id) setShowDetailModal(false);
        } catch (error) {
            console.error('Escalation failed:', error);
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
            if (selectedAlert?.id === alert.id) setShowDetailModal(false);
        } catch (error) {
            console.error('Error resolving alert:', error);
        }
    };

    const formatTime = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 1) return 'Baru saja';
        if (diff < 60) return `${diff} menit lalu`;
        if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
        return `${Math.floor(diff / 1440)} hari lalu`;
    };

    const stats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'CRITICAL').length,
        open: alerts.filter(a => a.status === 'OPEN').length,
        investigating: alerts.filter(a => a.status === 'INVESTIGATING').length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Intelligent Alert Feed" subtitle="Loading...">
                <div className={styles.loadingContainer}>Initializing Surveillance Feed...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Intelligent Alert Feed" subtitle="AI-Powered Threat Detection & Response">
            <div className={styles.container}>
                {/* Stats Row */}
                <section className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Logs</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.critical}`}>
                        <div className={styles.pulseDot}></div>
                        <span className={styles.statValue}>{stats.critical}</span>
                        <span className={styles.statLabel}>Critical Threats</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{stats.open}</span>
                        <span className={styles.statLabel}>Action Required</span>
                    </div>

                    {/* DEMO TRIGGER - Invisible but clickable area or explicit button */}
                    <div className={styles.demoControls}>
                        <button
                            className={styles.simulateBtn}
                            onClick={handleSimulateBreach}
                            disabled={isSimulating}
                        >
                            {isSimulating ? 'SIMULATING...' : '⚡ SIMULATE BREACH'}
                        </button>
                        <span className={styles.lastUpdated}>Updated: {lastUpdated.toLocaleTimeString()}</span>
                    </div>
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
                    </select>
                </section>

                {/* Alerts List */}
                <div className={styles.alertsList}>
                    {alerts.length === 0 ? (
                        <Card><div className={styles.noAlerts}>✅ System Secure. No active anomalies detected.</div></Card>
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
                                        <span className={`${styles.statusBadge} ${styles[alert.status.toLowerCase()]}`}>{alert.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div className={styles.alertBody}>
                                    <div className={styles.alertDocument}>
                                        <strong>{alert.document?.title || 'Unknown Document'}</strong>
                                        <code>{alert.document?.rfidTag || 'N/A'}</code>
                                        <span className={`${styles.docClass} ${styles[alert.document?.classification || 'Standard']}`}>
                                            {alert.document?.classification}
                                        </span>
                                    </div>
                                    <div className={styles.alertExplanation}>
                                        <span className={styles.xaiLabel}>🤖 AI Prediction</span>
                                        <p>{alert.explanation}</p>
                                    </div>
                                    <div className={styles.alertMetrics}>
                                        <div className={styles.metric}>
                                            <span className={styles.metricLabel}>Risk</span>
                                            <div className={styles.progressBar}>
                                                <div className={styles.progressFill} style={{ width: `${alert.riskScore * 100}%`, background: alert.riskScore > 0.7 ? '#ef4444' : '#eab308' }}></div>
                                            </div>
                                            <span>{Math.round(alert.riskScore * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.alertActions}>
                                    <Button variant="secondary" size="sm" onClick={() => { setSelectedAlert(alert); setShowDetailModal(true); }}>
                                        Analyze Details
                                    </Button>
                                    {alert.status === 'OPEN' && (
                                        <>
                                            <Button variant="primary" size="sm" onClick={() => handleDispatchSecurity(alert)}>
                                                👮 Dispatch Security
                                            </Button>
                                            {(alert.severity === 'HIGH' || alert.severity === 'CRITICAL') && (
                                                <Button variant="danger" size="sm" onClick={() => handleEscalate(alert)} style={{ marginLeft: '8px' }}>
                                                    📢 Escalate
                                                </Button>
                                            )}
                                        </>
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
                        <div className={`${styles.modalHeader} ${styles[selectedAlert.severity]}`}>
                            <div>
                                <h2 className={styles.modalTitle}>THREAT ANALYSIS: {selectedAlert.alertType}</h2>
                                <span className={styles.modalSubtitle}>ID: {selectedAlert.id}</span>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>×</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.xaiCard}>
                                <div className={styles.xaiHeader}>
                                    <h4>🤖 Explainable AI Reasoning</h4>
                                    <span className={styles.confidenceBadge}>{Math.round(selectedAlert.confidence * 100)}% Confidence</span>
                                </div>
                                <p className={styles.xaiText}>{selectedAlert.explanation}</p>
                                <div className={styles.factorGrid}>
                                    {selectedAlert.contributingFactors?.map((f, i) => (
                                        <div key={i} className={styles.factorItem}>
                                            <div className={styles.factorLabel}>{f.factor}</div>
                                            <div className={styles.factorBarBg}>
                                                <div className={styles.factorBarFill} style={{ width: `${f.weight * 100}%` }}></div>
                                            </div>
                                            <div className={styles.factorValue}>{Math.round(f.weight * 100)}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}><label>Document</label>{selectedAlert.document?.title}</div>
                                <div className={styles.detailItem}><label>Classification</label>{selectedAlert.document?.classification}</div>
                                <div className={styles.detailItem}><label>Location</label>{selectedAlert.movement?.toZone?.name || 'Unknown'}</div>
                                <div className={styles.detailItem}><label>Detected</label>{new Date(selectedAlert.createdAt).toLocaleString()}</div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            {selectedAlert.status === 'OPEN' ? (
                                <Button variant="primary" size="lg" className={styles.dispatchBtn} onClick={() => handleDispatchSecurity(selectedAlert)}>
                                    👮 DISPATCH SECURITY TEAM
                                </Button>
                            ) : (
                                <div className={styles.statusMessage}>
                                    Status: {selectedAlert.status}
                                </div>
                            )}
                            <Button variant="secondary" onClick={() => router.push(`/documents/timeline?doc=${selectedAlert.document?.rfidTag}`)}>
                                View Timeline Evidence
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
