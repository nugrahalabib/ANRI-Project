'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Button } from '@/components/ui';
import styles from './page.module.css';

interface Alert {
    id: string;
    alertType: string;
    severity: string;
    riskScore: number;
    confidence: number;
    explanation: string;
    status: string;
    createdAt: string;
    document: {
        title: string;
        rfidTag: string;
        classification: string;
    };
    movement?: {
        fromZone?: { name: string };
        toZone?: { name: string };
    };
}

interface RFIDReader {
    id: string;
    readerId: string;
    name: string;
    type: string;
    isOnline: boolean;
    lastPing: string;
    zone: { name: string };
}

const alertTypeLabels: Record<string, string> = {
    UNAUTHORIZED_ZONE: 'Unauthorized Zone Entry',
    AFTER_HOURS_ACCESS: 'After-Hours Access',
    UNUSUAL_FREQUENCY: 'Unusual Movement Frequency',
    RAPID_MOVEMENT: 'Rapid Zone Transit',
    PATTERN_DEVIATION: 'Behavioral Pattern Deviation',
    CLASSIFICATION_VIOLATION: 'Classification Violation',
    TAILGATING: 'Tailgating Detected',
};

export default function NSOCTacticalTerminal() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [readers, setReaders] = useState<RFIDReader[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
    const [showProtocolModal, setShowProtocolModal] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [alertsRes, readersRes] = await Promise.all([
                    fetch('/api/alerts?limit=10'),
                    fetch('/api/rfid-readers'),
                ]);

                const alertsData = await alertsRes.json();
                const readersData = await readersRes.json();

                if (alertsData.success) setAlerts(alertsData.data);
                if (readersData.success) setReaders(readersData.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return date.toLocaleDateString('id-ID');
    };

    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
    const openAlerts = alerts.filter(a => a.status === 'OPEN').length;
    const onlineReaders = readers.filter(r => r.isOnline).length;

    const getRiskColor = (score: number) => {
        const pct = score * 100;
        if (pct >= 70) return 'critical';
        if (pct >= 40) return 'warning';
        return 'normal';
    };

    // Generate activity data from current hour
    const activityData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        value: Math.floor(Math.random() * 100) + 10,
        isAnomaly: i >= 14 && i <= 16,
    }));
    const maxActivity = Math.max(...activityData.map(d => d.value));

    if (loading) {
        return (
            <DashboardLayout title="NSOC Tactical Terminal" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Loading security data...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="NSOC Tactical Terminal"
            subtitle="National Security Operations Center - AI-Driven Defense System"
        >
            <div className={styles.container}>
                {/* Blueprint Grid Overlay */}
                <div className={styles.blueprintGrid} />

                {/* Integrity Header */}
                <header className={styles.integrityHeader}>
                    <div className={styles.headerLeft}>
                        <div className={styles.nsocBadge}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>NSOC</span>
                        </div>
                        <div className={styles.headerTitle}>
                            <h1>National Security Operations Center</h1>
                            <p>AI-Powered Threat Detection & Document Movement Monitoring</p>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.cryptoBadge}>
                            <div className={styles.cryptoPulse} />
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <span>Cryptographically Verified</span>
                        </div>
                        <div className={styles.headerStats}>
                            <div className={`${styles.statCard} ${styles.critical}`}>
                                <span className={styles.statValue}>{criticalAlerts}</span>
                                <span className={styles.statLabel}>Critical</span>
                            </div>
                            <div className={`${styles.statCard} ${styles.warning}`}>
                                <span className={styles.statValue}>{openAlerts}</span>
                                <span className={styles.statLabel}>Open</span>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statValue}>{onlineReaders}/{readers.length}</span>
                                <span className={styles.statLabel}>Readers</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Intelligence Alert Matrix */}
                <section className={styles.alertMatrix}>
                    <div className={styles.sectionHeader}>
                        <h2>Intelligence Alert Matrix</h2>
                        <div className={styles.liveIndicator}>
                            <span className={styles.liveDot} />
                            LIVE FEED
                        </div>
                    </div>

                    <div className={styles.alertGrid}>
                        {alerts.length === 0 ? (
                            <div className={styles.noAlerts}>✅ No active alerts - System secure</div>
                        ) : (
                            alerts.slice(0, 4).map((alert) => {
                                const riskColor = getRiskColor(alert.riskScore);
                                const isSelected = selectedAlert === alert.id;
                                const isCritical = alert.severity === 'CRITICAL';

                                return (
                                    <div
                                        key={alert.id}
                                        className={`${styles.alertCard} ${styles[alert.severity.toLowerCase()]} ${isCritical ? styles.scanning : ''} ${isSelected ? styles.selected : ''}`}
                                        onClick={() => setSelectedAlert(isSelected ? null : alert.id)}
                                    >
                                        <div className={styles.alertHeader}>
                                            <div className={styles.alertMeta}>
                                                <code className={styles.alertId}>ALT-{alert.id.slice(0, 6)}</code>
                                                <span className={`${styles.severityBadge} ${styles[alert.severity.toLowerCase()]}`}>
                                                    {alert.severity}
                                                </span>
                                            </div>

                                            {/* Risk Gauge */}
                                            <div className={`${styles.riskGauge} ${styles[riskColor]}`}>
                                                <svg viewBox="0 0 50 50">
                                                    <circle cx="25" cy="25" r="20" className={styles.gaugeBg} />
                                                    <circle
                                                        cx="25" cy="25" r="20"
                                                        className={styles.gaugeFill}
                                                        strokeDasharray={`${alert.riskScore * 100 * 1.26} 126`}
                                                        transform="rotate(-90 25 25)"
                                                    />
                                                </svg>
                                                <span className={styles.gaugeValue}>{Math.round(alert.riskScore * 100)}</span>
                                            </div>
                                        </div>

                                        <div className={styles.alertBody}>
                                            <h3 className={styles.alertType}>{alertTypeLabels[alert.alertType] || alert.alertType}</h3>

                                            <div className={styles.documentInfo}>
                                                <span className={styles.docName}>{alert.document?.title || 'Unknown Document'}</span>
                                                <code className={styles.rfidTag}>{alert.document?.rfidTag || 'N/A'}</code>
                                            </div>

                                            <div className={styles.movementPath}>
                                                <span>{alert.movement?.fromZone?.name || 'Unknown'}</span>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                    <polyline points="12 5 19 12 12 19" />
                                                </svg>
                                                <span>{alert.movement?.toZone?.name || 'Unknown'}</span>
                                            </div>

                                            <div className={styles.alertFooter}>
                                                <span className={styles.timeStamp}>{formatTime(alert.createdAt)}</span>
                                                <span className={`${styles.statusBadge} ${styles[alert.status.toLowerCase()]}`}>
                                                    {alert.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* XAI Reasoning Panel */}
                                        {isSelected && (
                                            <div className={styles.xaiPanel}>
                                                <div className={styles.xaiHeader}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <path d="M12 16v-4" />
                                                        <path d="M12 8h.01" />
                                                    </svg>
                                                    AI Reasoning Fragment
                                                </div>
                                                <p className={styles.xaiContent}>{alert.explanation}</p>
                                                <div className={styles.threatIndicator}>
                                                    <span className={styles.threatLabel}>Confidence:</span>
                                                    <span className={styles.threatValue}>{Math.round(alert.confidence)}%</span>
                                                </div>
                                                <div className={styles.xaiActions}>
                                                    <Button size="sm" variant="primary" onClick={() => setShowProtocolModal(true)}>
                                                        Initiate Protocol
                                                    </Button>
                                                    <Button size="sm" variant="secondary">
                                                        Open Incident Replay
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Analytics Row */}
                <div className={styles.analyticsRow}>
                    {/* Activity Timeline with Anomaly Highlighting */}
                    <section className={styles.timelineSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Tactical Activity Analytics (24H)</h2>
                            <span className={styles.anomalyLegend}>
                                <span className={styles.anomalyDot} />
                                Anomaly Windows Detected
                            </span>
                        </div>
                        <div className={styles.timelineChart}>
                            <div className={styles.chartArea}>
                                {activityData.map((point, i) => (
                                    <div key={i} className={styles.chartColumn}>
                                        <div
                                            className={`${styles.chartBar} ${point.isAnomaly ? styles.anomalyBar : ''}`}
                                            style={{ height: `${(point.value / maxActivity) * 100}%` }}
                                            title={`${point.hour}:00 - ${point.value} movements`}
                                        />
                                        {point.isAnomaly && <div className={styles.anomalyMarker} />}
                                    </div>
                                ))}
                            </div>
                            <div className={styles.chartLabels}>
                                {[0, 6, 12, 18, 23].map(h => (
                                    <span key={h}>{h}:00</span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* RFID Infrastructure Intelligence */}
                    <section className={styles.rfidSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Infrastructure Intelligence</h2>
                            <span className={styles.onlineCount}>{onlineReaders} Online</span>
                        </div>
                        <div className={styles.readerGrid}>
                            {readers.slice(0, 6).map((reader) => (
                                <div
                                    key={reader.id}
                                    className={`${styles.readerCard} ${!reader.isOnline ? styles.offline : ''}`}
                                >
                                    <div className={styles.readerHeader}>
                                        <div className={`${styles.signalPulse} ${reader.isOnline ? styles.active : ''}`}>
                                            <div className={styles.pulseRing} />
                                            <div className={styles.pulseCore} />
                                        </div>
                                        <div className={styles.readerInfo}>
                                            <span className={styles.readerName}>{reader.name}</span>
                                            <code className={styles.readerId}>{reader.readerId}</code>
                                        </div>
                                    </div>
                                    <div className={styles.readerZone}>{reader.zone?.name || 'Unknown Zone'}</div>
                                    <div className={styles.readerMetrics}>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>Status</span>
                                            <span className={styles.metricValue}>{reader.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>Type</span>
                                            <span className={styles.metricValue}>{reader.type}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Command Strip */}
                <footer className={styles.commandStrip}>
                    <div className={styles.commandTitle}>MISSION CONTROL</div>
                    <div className={styles.commandActions}>
                        <button className={styles.commandBtn}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <span>Search Document</span>
                        </button>
                        <button className={styles.commandBtn}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="9" y1="21" x2="9" y2="9" />
                            </svg>
                            <span>Zone Map</span>
                        </button>
                        <button className={styles.commandBtn}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>Policy Rules</span>
                        </button>
                        <button className={`${styles.commandBtn} ${styles.emergency}`} onClick={() => setShowProtocolModal(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <span>Zone Lockdown</span>
                        </button>
                        <button className={styles.commandBtn}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Export Report</span>
                        </button>
                    </div>
                </footer>

                {/* Protocol Modal */}
                {showProtocolModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.protocolModal}>
                            <div className={styles.modalHeader}>
                                <h2>Initiate Security Protocol</h2>
                                <button className={styles.closeBtn} onClick={() => setShowProtocolModal(false)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                <p className={styles.modalWarning}>
                                    ⚠️ This action will trigger automated enforcement protocols.
                                </p>
                                <div className={styles.protocolOptions}>
                                    <button className={styles.protocolBtn}>
                                        <span className={styles.protocolIcon}>🔒</span>
                                        <span className={styles.protocolName}>Device Isolation</span>
                                        <span className={styles.protocolDesc}>Disable RFID tag temporarily</span>
                                    </button>
                                    <button className={styles.protocolBtn}>
                                        <span className={styles.protocolIcon}>🚫</span>
                                        <span className={styles.protocolName}>Zone Lockdown</span>
                                        <span className={styles.protocolDesc}>Lock all entry points to zone</span>
                                    </button>
                                    <button className={styles.protocolBtn}>
                                        <span className={styles.protocolIcon}>📧</span>
                                        <span className={styles.protocolName}>Alert Security Team</span>
                                        <span className={styles.protocolDesc}>Send immediate notification</span>
                                    </button>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <Button variant="secondary" onClick={() => setShowProtocolModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary">
                                    Execute Protocol
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
