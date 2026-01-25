'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Button } from '@/components/ui';
import styles from './page.module.css';

// Enhanced security alerts with AI reasoning
const securityAlerts = [
    {
        id: 'ALT-001',
        type: 'UNAUTHORIZED_ZONE',
        severity: 'critical' as const,
        document: 'Arsip Rahasia 2024-001',
        rfidTag: 'ANRI-X8K9M2',
        fromZone: 'Ruang Arsip Rahasia',
        toZone: 'Lobby Utama',
        timestamp: new Date(Date.now() - 10 * 60000),
        status: 'OPEN',
        riskScore: 85,
        aiReasoning: 'Anomaly Detected: Document with RAHASIA classification detected in PUBLIC zone. Movement pattern deviates from baseline behavioral profile by 72%. Unauthorized exit attempt flagged.',
        threatType: 'Insider Threat',
        threatProbability: 78,
    },
    {
        id: 'ALT-002',
        type: 'AFTER_HOURS_ACCESS',
        severity: 'high' as const,
        document: 'SK Pengangkatan 2024-015',
        rfidTag: 'ANRI-P3Q7R1',
        fromZone: 'Gudang Penyimpanan',
        toZone: 'Kantor Kearsipan',
        timestamp: new Date(Date.now() - 65 * 60000),
        status: 'INVESTIGATING',
        riskScore: 72,
        aiReasoning: 'After-Hours Access: Document accessed at 23:45 WIB without scheduled overtime authorization. User access pattern shows 3 similar incidents in last 30 days.',
        threatType: 'Policy Violation',
        threatProbability: 65,
    },
    {
        id: 'ALT-003',
        type: 'UNUSUAL_FREQUENCY',
        severity: 'warning' as const,
        document: 'Laporan Keuangan Q4',
        rfidTag: 'ANRI-M5N8V4',
        fromZone: 'Ruang Digitalisasi',
        toZone: 'Ruang Rapat',
        timestamp: new Date(Date.now() - 180 * 60000),
        status: 'OPEN',
        riskScore: 45,
        aiReasoning: 'Frequency Anomaly: 15 movements recorded in 24H vs baseline average of 2. Document dwell time in non-designated zones exceeds threshold by 340%.',
        threatType: 'Data Exfiltration Risk',
        threatProbability: 42,
    },
    {
        id: 'ALT-004',
        type: 'RAPID_MOVEMENT',
        severity: 'medium' as const,
        document: 'Perjanjian Kerjasama 2024-008',
        rfidTag: 'ANRI-K2L4W9',
        fromZone: 'Ruang Baca Publik',
        toZone: 'Kantor Kearsipan',
        timestamp: new Date(Date.now() - 240 * 60000),
        status: 'RESOLVED',
        riskScore: 38,
        aiReasoning: 'Rapid Transit: 4 zone transitions in 5 minutes. Analysis suggests batch document transfer. Low anomaly score, pattern consistent with authorized operations.',
        threatType: 'Normal Activity',
        threatProbability: 15,
    },
];

// RFID readers with enhanced health metrics
const readerStatus = [
    { id: 'RDR-1001', name: 'Portal Utama A', zone: 'Lobby Utama', status: 'online', latency: 12, health: 98, lastPing: 2 },
    { id: 'RDR-1002', name: 'Fixed Reader B1', zone: 'Ruang Arsip Rahasia', status: 'online', latency: 8, health: 95, lastPing: 5 },
    { id: 'RDR-1003', name: 'Mobile Reader M1', zone: 'Ruang Digitalisasi', status: 'online', latency: 24, health: 87, lastPing: 8 },
    { id: 'RDR-1004', name: 'Portal Utama B', zone: 'Gudang Penyimpanan', status: 'offline', latency: 0, health: 0, lastPing: 900 },
    { id: 'RDR-1005', name: 'Fixed Reader B2', zone: 'Kantor Kearsipan', status: 'online', latency: 15, health: 92, lastPing: 3 },
];

// Activity data with anomaly highlighting
const activityData = [
    { hour: 0, value: 12, isAnomaly: false },
    { hour: 1, value: 8, isAnomaly: false },
    { hour: 2, value: 5, isAnomaly: false },
    { hour: 3, value: 3, isAnomaly: false },
    { hour: 4, value: 4, isAnomaly: false },
    { hour: 5, value: 15, isAnomaly: false },
    { hour: 6, value: 28, isAnomaly: false },
    { hour: 7, value: 45, isAnomaly: false },
    { hour: 8, value: 62, isAnomaly: false },
    { hour: 9, value: 78, isAnomaly: false },
    { hour: 10, value: 85, isAnomaly: false },
    { hour: 11, value: 72, isAnomaly: false },
    { hour: 12, value: 45, isAnomaly: false },
    { hour: 13, value: 68, isAnomaly: false },
    { hour: 14, value: 95, isAnomaly: true }, // Anomaly window
    { hour: 15, value: 120, isAnomaly: true }, // Anomaly window
    { hour: 16, value: 88, isAnomaly: true }, // Anomaly window
    { hour: 17, value: 65, isAnomaly: false },
    { hour: 18, value: 42, isAnomaly: false },
    { hour: 19, value: 28, isAnomaly: false },
    { hour: 20, value: 18, isAnomaly: false },
    { hour: 21, value: 15, isAnomaly: false },
    { hour: 22, value: 22, isAnomaly: true }, // Late night anomaly
    { hour: 23, value: 35, isAnomaly: true }, // Late night anomaly
];

const alertTypeLabels: Record<string, string> = {
    UNAUTHORIZED_ZONE: 'Unauthorized Zone Entry',
    AFTER_HOURS_ACCESS: 'After-Hours Access',
    UNUSUAL_FREQUENCY: 'Unusual Movement Frequency',
    RAPID_MOVEMENT: 'Rapid Zone Transit',
    PATTERN_DEVIATION: 'Behavioral Pattern Deviation',
};

export default function NSOCTacticalTerminal() {
    const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
    const [showProtocolModal, setShowProtocolModal] = useState(false);

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return date.toLocaleDateString('id-ID');
    };

    const criticalAlerts = securityAlerts.filter(a => a.severity === 'critical').length;
    const openAlerts = securityAlerts.filter(a => a.status === 'OPEN').length;
    const onlineReaders = readerStatus.filter(r => r.status === 'online').length;
    const maxActivity = Math.max(...activityData.map(d => d.value));

    const getRiskColor = (score: number) => {
        if (score >= 70) return 'critical';
        if (score >= 40) return 'warning';
        return 'normal';
    };

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
                                <span className={styles.statValue}>{onlineReaders}/{readerStatus.length}</span>
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
                        {securityAlerts.map((alert) => {
                            const riskColor = getRiskColor(alert.riskScore);
                            const isSelected = selectedAlert === alert.id;
                            const isCritical = alert.severity === 'critical';

                            return (
                                <div
                                    key={alert.id}
                                    className={`${styles.alertCard} ${styles[alert.severity]} ${isCritical ? styles.scanning : ''} ${isSelected ? styles.selected : ''}`}
                                    onClick={() => setSelectedAlert(isSelected ? null : alert.id)}
                                >
                                    <div className={styles.alertHeader}>
                                        <div className={styles.alertMeta}>
                                            <code className={styles.alertId}>{alert.id}</code>
                                            <span className={`${styles.severityBadge} ${styles[alert.severity]}`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Risk Gauge */}
                                        <div className={`${styles.riskGauge} ${styles[riskColor]}`}>
                                            <svg viewBox="0 0 50 50">
                                                <circle cx="25" cy="25" r="20" className={styles.gaugeBg} />
                                                <circle
                                                    cx="25" cy="25" r="20"
                                                    className={styles.gaugeFill}
                                                    strokeDasharray={`${alert.riskScore * 1.26} 126`}
                                                    transform="rotate(-90 25 25)"
                                                />
                                            </svg>
                                            <span className={styles.gaugeValue}>{alert.riskScore}</span>
                                        </div>
                                    </div>

                                    <div className={styles.alertBody}>
                                        <h3 className={styles.alertType}>{alertTypeLabels[alert.type]}</h3>

                                        <div className={styles.documentInfo}>
                                            <span className={styles.docName}>{alert.document}</span>
                                            <code className={styles.rfidTag}>{alert.rfidTag}</code>
                                        </div>

                                        <div className={styles.movementPath}>
                                            <span>{alert.fromZone}</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                            <span>{alert.toZone}</span>
                                        </div>

                                        <div className={styles.alertFooter}>
                                            <span className={styles.timeStamp}>{formatTime(alert.timestamp)}</span>
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
                                            <p className={styles.xaiContent}>{alert.aiReasoning}</p>
                                            <div className={styles.threatIndicator}>
                                                <span className={styles.threatLabel}>Threat Type:</span>
                                                <span className={styles.threatValue}>{alert.threatType}</span>
                                                <span className={styles.threatProb}>{alert.threatProbability}% probability</span>
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
                        })}
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
                            {readerStatus.map((reader) => (
                                <div
                                    key={reader.id}
                                    className={`${styles.readerCard} ${reader.status === 'offline' ? styles.offline : ''}`}
                                >
                                    <div className={styles.readerHeader}>
                                        <div className={`${styles.signalPulse} ${reader.status === 'online' ? styles.active : ''}`}>
                                            <div className={styles.pulseRing} />
                                            <div className={styles.pulseCore} />
                                        </div>
                                        <div className={styles.readerInfo}>
                                            <span className={styles.readerName}>{reader.name}</span>
                                            <code className={styles.readerId}>{reader.id}</code>
                                        </div>
                                    </div>
                                    <div className={styles.readerZone}>{reader.zone}</div>
                                    <div className={styles.readerMetrics}>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>Health</span>
                                            <span className={styles.metricValue}>{reader.health}%</span>
                                        </div>
                                        <div className={styles.metricItem}>
                                            <span className={styles.metricLabel}>Latency</span>
                                            <span className={styles.metricValue}>{reader.latency}ms</span>
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
