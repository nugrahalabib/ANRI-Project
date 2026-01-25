'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Button } from '@/components/ui';
import styles from './page.module.css';

interface Alert {
    id: string;
    alertType: string;
    severity: string;
    explanation: string;
    createdAt: string;
    document: { title: string; rfidTag: string } | null;
    movement: { fromZone: { name: string } | null; toZone: { name: string } | null } | null;
}

interface Device {
    deviceId: string;
    status: string;
    lastSeen: string;
    violationCount: number;
}

const alertTypeLabels: Record<string, string> = {
    UNAUTHORIZED_ZONE: 'Unauthorized Zone Entry',
    AFTER_HOURS_ACCESS: 'After-Hours Access',
    UNUSUAL_FREQUENCY: 'Unusual Movement Frequency',
    RAPID_MOVEMENT: 'Rapid Zone Transit',
    PATTERN_DEVIATION: 'Behavioral Pattern Deviation',
};

const severityColors: Record<string, string> = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'warning',
    LOW: 'normal',
};

export default function SecurityDashboard() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [alertsRes, devicesRes] = await Promise.all([
                    fetch('/api/alerts?status=OPEN&limit=10'),
                    fetch('/api/devices'),
                ]);
                const alertsData = await alertsRes.json();
                const devicesData = await devicesRes.json();

                if (alertsData.success) setAlerts(alertsData.data);
                if (devicesData.success) setDevices(devicesData.data.slice(0, 6));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const formatTime = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    const getRiskColor = (score: number) => {
        if (score > 70) return 'var(--status-critical)';
        if (score > 40) return 'var(--status-warning)';
        return 'var(--status-normal)';
    };

    const deviceStats = {
        total: devices.length,
        active: devices.filter(d => d.status === 'ACTIVE').length,
        suspended: devices.filter(d => d.status === 'SUSPENDED').length,
        isolated: devices.filter(d => d.status === 'ISOLATED').length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Security Operations" subtitle="Loading...">
                <div className={styles.container}><div className={styles.loading}>Loading security data...</div></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="NSOC Tactical Terminal" subtitle="Real-time Security Operations Center">
            <div className={styles.container}>
                {/* Threat Summary */}
                <section className={styles.threatSummary}>
                    <div className={styles.threatCard}>
                        <span className={styles.threatValue}>{alerts.filter(a => a.severity === 'CRITICAL').length}</span>
                        <span className={styles.threatLabel}>Critical Threats</span>
                    </div>
                    <div className={styles.threatCard}>
                        <span className={styles.threatValue}>{alerts.length}</span>
                        <span className={styles.threatLabel}>Open Alerts</span>
                    </div>
                    <div className={styles.threatCard}>
                        <span className={styles.threatValue}>{deviceStats.active}</span>
                        <span className={styles.threatLabel}>Active Devices</span>
                    </div>
                    <div className={styles.threatCard}>
                        <span className={styles.threatValue}>{deviceStats.suspended + deviceStats.isolated}</span>
                        <span className={styles.threatLabel}>Quarantined</span>
                    </div>
                </section>

                {/* Active Alerts Panel */}
                <section className={styles.alertsPanel}>
                    <div className={styles.panelHeader}>
                        <h2>🚨 Active Security Alerts</h2>
                        <Button variant="secondary" size="sm" onClick={() => window.location.href = '/alerts'}>View All</Button>
                    </div>
                    <div className={styles.alertsList}>
                        {alerts.slice(0, 5).map((alert) => (
                            <div key={alert.id} className={`${styles.alertItem} ${styles[severityColors[alert.severity] || 'normal']}`} onClick={() => setSelectedAlert(alert)}>
                                <div className={styles.alertSeverity}>
                                    <span className={`${styles.severityDot} ${styles[severityColors[alert.severity]]}`}></span>
                                    <span>{alert.severity}</span>
                                </div>
                                <div className={styles.alertInfo}>
                                    <span className={styles.alertType}>{alertTypeLabels[alert.alertType] || alert.alertType}</span>
                                    <span className={styles.alertDoc}>{alert.document?.title || 'Unknown'}</span>
                                </div>
                                <div className={styles.alertTime}>{formatTime(alert.createdAt)}</div>
                            </div>
                        ))}
                        {alerts.length === 0 && (
                            <div className={styles.noAlerts}>✅ No active security alerts</div>
                        )}
                    </div>
                </section>

                {/* Device Status Panel */}
                <section className={styles.devicesPanel}>
                    <div className={styles.panelHeader}>
                        <h2>📡 Device Status</h2>
                    </div>
                    <div className={styles.deviceGrid}>
                        {devices.map((device) => (
                            <div key={device.deviceId} className={`${styles.deviceCard} ${styles[device.status.toLowerCase()]}`}>
                                <div className={styles.deviceHeader}>
                                    <span className={styles.deviceId}>{device.deviceId}</span>
                                    <span className={`${styles.statusBadge} ${styles[device.status.toLowerCase()]}`}>{device.status}</span>
                                </div>
                                <div className={styles.deviceStats}>
                                    <span>Last seen: {formatTime(device.lastSeen)}</span>
                                    <span>Violations: {device.violationCount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* XAI Detail Modal */}
                {selectedAlert && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedAlert(null)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Alert Analysis</h2>
                                <button className={styles.closeBtn} onClick={() => setSelectedAlert(null)}>×</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.alertDetail}>
                                    <span className={`${styles.severityBadge} ${styles[severityColors[selectedAlert.severity]]}`}>
                                        {selectedAlert.severity}
                                    </span>
                                    <h3>{alertTypeLabels[selectedAlert.alertType] || selectedAlert.alertType}</h3>
                                </div>
                                <div className={styles.xaiSection}>
                                    <h4>🤖 AI Analysis</h4>
                                    <p>{selectedAlert.explanation}</p>
                                </div>
                                <div className={styles.movementInfo}>
                                    <span><strong>Document:</strong> {selectedAlert.document?.title || 'Unknown'}</span>
                                    <span><strong>RFID:</strong> {selectedAlert.document?.rfidTag || 'N/A'}</span>
                                    {selectedAlert.movement && (
                                        <span><strong>Movement:</strong> {selectedAlert.movement.fromZone?.name} → {selectedAlert.movement.toZone?.name}</span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <Button variant="secondary" onClick={() => setSelectedAlert(null)}>Close</Button>
                                <Button variant="primary" onClick={() => window.location.href = `/alerts`}>Investigate</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
