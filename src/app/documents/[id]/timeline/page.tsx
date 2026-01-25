'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import styles from './page.module.css';

interface Movement {
    id: string;
    timestamp: string;
    fromZone: { id: string; name: string; code: string } | null;
    toZone: { id: string; name: string; code: string } | null;
    reader: { id: string; name: string; type: string } | null;
    isAuthorized: boolean;
    riskScore: number;
}

interface DocumentData {
    id: string;
    rfidTag: string;
    title: string;
    classification: 'PUBLIC' | 'RESTRICTED' | 'SECRET';
    organizationUnit: string;
    currentZone: { id: string; name: string; code: string } | null;
}

interface Alert {
    id: string;
    alertType: string;
    severity: string;
    explanation: string;
    createdAt: string;
}

const classificationColors: Record<string, 'normal' | 'warning' | 'critical'> = {
    PUBLIC: 'normal',
    RESTRICTED: 'warning',
    SECRET: 'critical',
};

const icons = {
    back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    location: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    movement: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
    clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    alert: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    warning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    file: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
};

export default function DocumentTimelinePage() {
    const params = useParams();
    const router = useRouter();
    const documentId = params.id as string;

    const [document, setDocument] = useState<DocumentData | null>(null);
    const [movements, setMovements] = useState<Movement[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!documentId) return;

        async function fetchData() {
            try {
                const res = await fetch(`/api/documents/${documentId}/movements`);
                const data = await res.json();

                if (data.success) {
                    setDocument(data.data.document);
                    setMovements(data.data.movements);
                    setAlerts(data.data.alerts || []);
                } else {
                    setError(data.error || 'Failed to load data');
                }
            } catch (err) {
                console.error('Error fetching timeline:', err);
                setError('Failed to connect to server');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [documentId]);

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 60) return `${diff} menit lalu`;
        if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
        return `${Math.floor(diff / 1440)} hari lalu`;
    };

    // Calculate summary
    const summary = {
        total: movements.length,
        unauthorized: movements.filter(m => !m.isAuthorized).length,
        alerts: alerts.length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Document Timeline" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Loading document timeline...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !document) {
        return (
            <DashboardLayout title="Document Timeline" subtitle="Error">
                <div className={styles.container}>
                    <Card>
                        <div className={styles.errorState}>
                            <div className={styles.errorIcon}>{icons.alert}</div>
                            <h3>Dokumen Tidak Ditemukan</h3>
                            <p>{error || 'Document ID tidak valid'}</p>
                            <Button variant="primary" onClick={() => router.push('/documents')}>
                                Kembali ke Daftar Dokumen
                            </Button>
                        </div>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Document Movement History"
            subtitle="Riwayat pergerakan fisik dokumen berdasarkan RFID"
        >
            <div className={styles.container}>
                {/* Back Button */}
                <button className={styles.backBtn} onClick={() => router.push('/documents')}>
                    {icons.back}
                    <span>Kembali ke Documents</span>
                </button>

                {/* Document Info Card */}
                <Card className={styles.docCard}>
                    <div className={styles.docCardInner}>
                        <div className={styles.docIcon}>{icons.file}</div>
                        <div className={styles.docDetails}>
                            <div className={styles.docHeader}>
                                <h1>{document.title}</h1>
                                <StatusBadge
                                    status={classificationColors[document.classification]}
                                    label={document.classification}
                                />
                            </div>
                            <div className={styles.docMeta}>
                                <span className={styles.rfidTag}>{document.rfidTag}</span>
                                <span className={styles.separator}>•</span>
                                <span>{document.organizationUnit}</span>
                            </div>
                        </div>
                        <div className={styles.currentLocation}>
                            <span className={styles.locationLabel}>Lokasi Saat Ini</span>
                            <div className={styles.locationValue}>
                                <span className={styles.locationIcon}>{icons.location}</span>
                                <span>{document.currentZone?.name || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Summary Stats */}
                <div className={styles.summaryRow}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryIcon}>{icons.movement}</div>
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{summary.total}</span>
                            <span className={styles.summaryLabel}>Total Pergerakan</span>
                        </div>
                    </div>
                    <div className={`${styles.summaryCard} ${summary.unauthorized > 0 ? styles.warning : ''}`}>
                        <div className={styles.summaryIcon}>{icons.warning}</div>
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{summary.unauthorized}</span>
                            <span className={styles.summaryLabel}>Tidak Terotorisasi</span>
                        </div>
                    </div>
                    <div className={`${styles.summaryCard} ${summary.alerts > 0 ? styles.danger : ''}`}>
                        <div className={styles.summaryIcon}>{icons.alert}</div>
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{summary.alerts}</span>
                            <span className={styles.summaryLabel}>Alert Tercatat</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className={styles.mainGrid}>
                    {/* Timeline */}
                    <section className={styles.timelineSection}>
                        <h2 className={styles.sectionTitle}>Riwayat Pergerakan</h2>

                        {movements.length === 0 ? (
                            <Card className={styles.emptyCard}>
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>{icons.clock}</div>
                                    <h3>Belum Ada Pergerakan</h3>
                                    <p>Dokumen ini belum memiliki riwayat pergerakan yang tercatat.</p>
                                </div>
                            </Card>
                        ) : (
                            <div className={styles.timeline}>
                                {movements.map((movement, idx) => {
                                    const { date, time } = formatDateTime(movement.timestamp);
                                    const isUnauthorized = !movement.isAuthorized;

                                    return (
                                        <div key={movement.id} className={styles.timelineItem}>
                                            {/* Timeline Line */}
                                            <div className={styles.timelineLine}>
                                                <div className={`${styles.dot} ${isUnauthorized ? styles.alertDot : ''}`}>
                                                    {isUnauthorized ? icons.warning : icons.check}
                                                </div>
                                                {idx < movements.length - 1 && <div className={styles.connector} />}
                                            </div>

                                            {/* Content */}
                                            <div className={`${styles.timelineCard} ${isUnauthorized ? styles.alertCard : ''}`}>
                                                <div className={styles.timelineCardHeader}>
                                                    <div className={styles.movementRoute}>
                                                        <span className={styles.zoneName}>{movement.fromZone?.name || 'Unknown'}</span>
                                                        <span className={styles.arrow}>→</span>
                                                        <span className={styles.zoneName}>{movement.toZone?.name || 'Unknown'}</span>
                                                    </div>
                                                    {isUnauthorized && (
                                                        <span className={styles.alertBadge}>Tidak Terotorisasi</span>
                                                    )}
                                                </div>
                                                <div className={styles.timelineCardBody}>
                                                    <div className={styles.timeInfo}>
                                                        <span className={styles.date}>{date}</span>
                                                        <span className={styles.time}>{time}</span>
                                                        <span className={styles.ago}>({getTimeAgo(movement.timestamp)})</span>
                                                    </div>
                                                    <div className={styles.readerInfo}>
                                                        Reader: <strong>{movement.reader?.name || 'Unknown'}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Alerts Sidebar */}
                    <aside className={styles.alertsSidebar}>
                        <h2 className={styles.sectionTitle}>Alert Log</h2>

                        {alerts.length === 0 ? (
                            <Card className={styles.noAlerts}>
                                <div className={styles.noAlertsContent}>
                                    <div className={styles.checkIcon}>{icons.check}</div>
                                    <p>Tidak ada alert untuk dokumen ini</p>
                                </div>
                            </Card>
                        ) : (
                            <div className={styles.alertsList}>
                                {alerts.map(alert => {
                                    const { date, time } = formatDateTime(alert.createdAt);
                                    return (
                                        <Card key={alert.id} className={styles.alertItem}>
                                            <div className={styles.alertItemHeader}>
                                                <span className={`${styles.severityBadge} ${styles[alert.severity.toLowerCase()]}`}>
                                                    {alert.severity}
                                                </span>
                                                <span className={styles.alertDate}>{date} {time}</span>
                                            </div>
                                            <div className={styles.alertType}>
                                                {alert.alertType.replace(/_/g, ' ')}
                                            </div>
                                            <p className={styles.alertDesc}>{alert.explanation}</p>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
}
