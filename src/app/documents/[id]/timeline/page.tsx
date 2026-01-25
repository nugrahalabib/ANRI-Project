'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts';
import { Card, StatusBadge, Button } from '@/components/ui';
import { TimelineChart } from '@/components/charts';
import styles from './page.module.css';

// Demo data structure
interface TimelineEntry {
    id: string;
    timestamp: Date;
    fromZone: { id: string; name: string } | null;
    toZone: { id: string; name: string };
    reader: { name: string; readerId: string };
    isAuthorized: boolean;
    riskScore: number;
    anomaly: {
        id: string;
        alertType: string;
        severity: string;
        riskScore: number;
        explanation: string;
        status: string;
    } | null;
}

// Demo data
const demoDocument = {
    id: '1',
    rfidTag: 'ANRI-X8K9M2',
    title: 'Arsip Rahasia Kepegawaian 2024-001',
    classification: 'SECRET',
    currentZone: { id: 'z1', name: 'Ruang Arsip Rahasia' },
    baseline: {
        normalHoursStart: 8,
        normalHoursEnd: 17,
        typicalMovementFreq: 2.5,
        confidenceScore: 0.85,
    },
};

const demoTimeline: TimelineEntry[] = [
    {
        id: 't1',
        timestamp: new Date(Date.now() - 10 * 60000),
        fromZone: { id: 'z1', name: 'Ruang Arsip Rahasia' },
        toZone: { id: 'z8', name: 'Lobby Utama' },
        reader: { name: 'Portal Utama A', readerId: 'RDR-1001' },
        isAuthorized: false,
        riskScore: 0.85,
        anomaly: {
            id: 'a1',
            alertType: 'UNAUTHORIZED_ZONE',
            severity: 'CRITICAL',
            riskScore: 0.85,
            explanation: 'Dokumen RAHASIA terdeteksi di zona publik tanpa otorisasi.',
            status: 'OPEN',
        },
    },
    {
        id: 't2',
        timestamp: new Date(Date.now() - 2 * 3600000),
        fromZone: { id: 'z4', name: 'Kantor Kearsipan' },
        toZone: { id: 'z1', name: 'Ruang Arsip Rahasia' },
        reader: { name: 'Fixed Reader B1', readerId: 'RDR-1002' },
        isAuthorized: true,
        riskScore: 0.12,
        anomaly: null,
    },
    {
        id: 't3',
        timestamp: new Date(Date.now() - 5 * 3600000),
        fromZone: { id: 'z1', name: 'Ruang Arsip Rahasia' },
        toZone: { id: 'z4', name: 'Kantor Kearsipan' },
        reader: { name: 'Portal Utama B', readerId: 'RDR-1004' },
        isAuthorized: true,
        riskScore: 0.08,
        anomaly: null,
    },
    {
        id: 't4',
        timestamp: new Date(Date.now() - 24 * 3600000),
        fromZone: { id: 'z5', name: 'Ruang Digitalisasi' },
        toZone: { id: 'z1', name: 'Ruang Arsip Rahasia' },
        reader: { name: 'Fixed Reader B1', readerId: 'RDR-1002' },
        isAuthorized: true,
        riskScore: 0.15,
        anomaly: null,
    },
    {
        id: 't5',
        timestamp: new Date(Date.now() - 26 * 3600000),
        fromZone: { id: 'z1', name: 'Ruang Arsip Rahasia' },
        toZone: { id: 'z5', name: 'Ruang Digitalisasi' },
        reader: { name: 'Mobile Reader M1', readerId: 'RDR-1003' },
        isAuthorized: true,
        riskScore: 0.22,
        anomaly: null,
    },
    {
        id: 't6',
        timestamp: new Date(Date.now() - 48 * 3600000),
        fromZone: null,
        toZone: { id: 'z1', name: 'Ruang Arsip Rahasia' },
        reader: { name: 'Fixed Reader B1', readerId: 'RDR-1002' },
        isAuthorized: true,
        riskScore: 0.05,
        anomaly: null,
    },
];

const demoStats = {
    totalMovements: 6,
    authorizedMovements: 5,
    anomalies: 1,
    avgRiskScore: 0.25,
};

const alertTypeLabels: Record<string, string> = {
    UNAUTHORIZED_ZONE: 'Zona Tidak Terotorisasi',
    AFTER_HOURS_ACCESS: 'Akses Luar Jam Kerja',
    UNUSUAL_FREQUENCY: 'Frekuensi Tidak Normal',
    RAPID_MOVEMENT: 'Pergerakan Cepat',
};

export default function DocumentTimelinePage() {
    const params = useParams();
    const router = useRouter();
    const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
    const [playbackPosition, setPlaybackPosition] = useState<number | null>(null);

    // Generate chart data from timeline
    const chartData = demoTimeline.map((entry, index) => ({
        x: entry.timestamp,
        y: entry.riskScore * 100,
    })).reverse();

    const formatTime = (date: Date) => {
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        if (hours > 24) return `${Math.floor(hours / 24)} hari`;
        if (hours > 0) return `${hours} jam ${minutes} menit`;
        return `${minutes} menit`;
    };

    return (
        <DashboardLayout
            title="Document Timeline"
            subtitle={demoDocument.title}
            actions={
                <Button variant="secondary" size="sm" onClick={() => router.back()}>
                    ← Kembali
                </Button>
            }
        >
            <div className={styles.container}>
                {/* Document Info Header */}
                <section className={styles.docHeader}>
                    <div className={styles.docInfo}>
                        <div className={styles.rfidBadge}>{demoDocument.rfidTag}</div>
                        <div className={styles.docMeta}>
                            <StatusBadge
                                status={demoDocument.classification === 'SECRET' ? 'critical' : 'warning'}
                                label={demoDocument.classification}
                            />
                            <span className={styles.currentZone}>
                                📍 {demoDocument.currentZone.name}
                            </span>
                        </div>
                    </div>
                    <div className={styles.docStats}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{demoStats.totalMovements}</span>
                            <span className={styles.statLabel}>Total Movements</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{demoStats.anomalies}</span>
                            <span className={styles.statLabel}>Anomalies</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{Math.round(demoStats.avgRiskScore * 100)}%</span>
                            <span className={styles.statLabel}>Avg Risk</span>
                        </div>
                    </div>
                </section>

                {/* Risk Chart */}
                <Card header="Risk Score Over Time">
                    <TimelineChart
                        data={chartData}
                        color={demoStats.avgRiskScore > 0.5 ? '#ef4444' : '#3d7ab8'}
                        height={200}
                        yAxisLabel="Risk %"
                    />
                </Card>

                {/* Timeline */}
                <Card header="Movement Timeline">
                    <div className={styles.timeline}>
                        {demoTimeline.map((entry, index) => (
                            <div
                                key={entry.id}
                                className={`${styles.timelineEntry} ${entry.anomaly ? styles.anomaly : ''} ${selectedEntry === entry.id ? styles.selected : ''}`}
                                onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                            >
                                <div className={styles.timelineMarker}>
                                    <div className={`${styles.markerDot} ${entry.anomaly ? styles.alert : ''}`} />
                                    {index < demoTimeline.length - 1 && (
                                        <div className={styles.markerLine}>
                                            <span className={styles.duration}>
                                                {formatDuration(demoTimeline[index].timestamp.getTime() - demoTimeline[index + 1].timestamp.getTime())}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.entryContent}>
                                    <div className={styles.entryHeader}>
                                        <span className={styles.entryTime}>{formatTime(entry.timestamp)}</span>
                                        {entry.anomaly && (
                                            <StatusBadge
                                                status={entry.anomaly.severity.toLowerCase() as any}
                                                label={alertTypeLabels[entry.anomaly.alertType] || entry.anomaly.alertType}
                                                size="sm"
                                                animate
                                            />
                                        )}
                                    </div>

                                    <div className={styles.movement}>
                                        <div className={styles.zone}>
                                            <span className={styles.zoneLabel}>Dari</span>
                                            <span className={styles.zoneName}>{entry.fromZone?.name || 'Titik Awal'}</span>
                                        </div>
                                        <div className={styles.arrow}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </div>
                                        <div className={styles.zone}>
                                            <span className={styles.zoneLabel}>Ke</span>
                                            <span className={styles.zoneName}>{entry.toZone.name}</span>
                                        </div>
                                    </div>

                                    <div className={styles.entryMeta}>
                                        <span className={styles.reader}>
                                            📡 {entry.reader.name} ({entry.reader.readerId})
                                        </span>
                                        <div className={styles.riskIndicator}>
                                            <span>Risk:</span>
                                            <div className={styles.riskBar}>
                                                <div
                                                    className={styles.riskFill}
                                                    style={{
                                                        width: `${entry.riskScore * 100}%`,
                                                        background: entry.riskScore > 0.7 ? 'var(--status-critical)' :
                                                            entry.riskScore > 0.4 ? 'var(--status-warning)' : 'var(--status-normal)'
                                                    }}
                                                />
                                            </div>
                                            <span>{Math.round(entry.riskScore * 100)}%</span>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {selectedEntry === entry.id && entry.anomaly && (
                                        <div className={styles.expandedDetails}>
                                            <div className={styles.aiExplanation}>
                                                <strong>🤖 AI Explanation:</strong>
                                                <p>{entry.anomaly.explanation}</p>
                                            </div>
                                            <div className={styles.expandedActions}>
                                                <Button size="sm" variant="primary">Investigate</Button>
                                                <Button size="sm" variant="secondary">Mark Resolved</Button>
                                                <Button size="sm" variant="ghost">False Positive</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Baseline Info */}
                <Card header="AI Behavioral Profile">
                    <div className={styles.baselineGrid}>
                        <div className={styles.baselineItem}>
                            <span className={styles.baselineLabel}>Normal Operating Hours</span>
                            <span className={styles.baselineValue}>
                                {demoDocument.baseline.normalHoursStart}:00 - {demoDocument.baseline.normalHoursEnd}:00 WIB
                            </span>
                        </div>
                        <div className={styles.baselineItem}>
                            <span className={styles.baselineLabel}>Typical Movement Frequency</span>
                            <span className={styles.baselineValue}>
                                {demoDocument.baseline.typicalMovementFreq.toFixed(1)} movements/day
                            </span>
                        </div>
                        <div className={styles.baselineItem}>
                            <span className={styles.baselineLabel}>Model Confidence</span>
                            <span className={styles.baselineValue}>
                                {Math.round(demoDocument.baseline.confidenceScore * 100)}%
                            </span>
                        </div>
                        <div className={styles.baselineItem}>
                            <span className={styles.baselineLabel}>Anomaly Rate</span>
                            <span className={styles.baselineValue}>
                                {Math.round((demoStats.anomalies / demoStats.totalMovements) * 100)}%
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
