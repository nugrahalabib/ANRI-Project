'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layouts';
import { KPICard } from '@/components/dashboard';
import { RiskGauge, TimelineChart } from '@/components/charts';
import { Card } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import styles from './page.module.css';

// Sample data for demonstration
const kpiData = {
    mttd: {
        value: 12,
        unit: 'min',
        trend: { direction: 'down' as const, value: '18%', period: 'vs last month' },
        description: 'Mean Time to Detection',
        sparkline: [24, 21, 19, 18, 15, 14, 12],
    },
    compliance: {
        value: 94.2,
        unit: '%',
        trend: { direction: 'up' as const, value: '2.1%', period: 'vs last month' },
        description: 'Policy Compliance Rate',
        sparkline: [88, 89, 91, 92, 93, 94, 94.2],
    },
    anomalyAccuracy: {
        value: 87.5,
        unit: '%',
        trend: { direction: 'up' as const, value: '5%', period: 'vs last month' },
        description: 'AI Detection Accuracy',
        sparkline: [78, 80, 82, 84, 85, 86, 87.5],
    },
    activeAlerts: {
        value: 7,
        unit: '',
        trend: { direction: 'stable' as const, value: '0', period: 'no change' },
        description: 'Open Alerts Requiring Review',
        sparkline: [12, 9, 8, 7, 9, 8, 7],
    },
};

const riskTrendData = [
    { x: new Date('2024-01-01'), y: 35 },
    { x: new Date('2024-01-08'), y: 42 },
    { x: new Date('2024-01-15'), y: 38 },
    { x: new Date('2024-01-22'), y: 45 },
    { x: new Date('2024-01-29'), y: 40 },
    { x: new Date('2024-02-05'), y: 32 },
    { x: new Date('2024-02-12'), y: 28 },
    { x: new Date('2024-02-19'), y: 35 },
    { x: new Date('2024-02-26'), y: 30 },
    { x: new Date('2024-03-04'), y: 25 },
];

const recentAlerts = [
    {
        id: '1',
        type: 'UNAUTHORIZED_ZONE',
        severity: 'critical' as const,
        document: 'Arsip Rahasia 2024-001',
        time: '10 menit yang lalu',
        explanation: 'Dokumen berklasifikasi RAHASIA terdeteksi di zona publik.',
    },
    {
        id: '2',
        type: 'AFTER_HOURS_ACCESS',
        severity: 'high' as const,
        document: 'SK Pengangkatan 2024-015',
        time: '1 jam yang lalu',
        explanation: 'Akses dokumen di luar jam kerja (23:45 WIB).',
    },
    {
        id: '3',
        type: 'UNUSUAL_FREQUENCY',
        severity: 'warning' as const,
        document: 'Laporan Keuangan Q4',
        time: '3 jam yang lalu',
        explanation: '15 pergerakan dalam 24 jam, normal: 2 per hari.',
    },
];

export default function ExecutiveDashboard() {
    return (
        <DashboardLayout
            title="Executive Overview"
            subtitle="Ringkasan Postur Risiko Organisasi"
        >
            <div className={styles.container}>
                {/* KPI Cards Row */}
                <section className={styles.kpiGrid}>
                    <KPICard
                        title="MTTD"
                        value={kpiData.mttd.value}
                        unit={kpiData.mttd.unit}
                        description={kpiData.mttd.description}
                        trend={kpiData.mttd.trend}
                        status="normal"
                        sparkline={kpiData.mttd.sparkline}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        }
                    />
                    <KPICard
                        title="Compliance"
                        value={kpiData.compliance.value}
                        unit={kpiData.compliance.unit}
                        description={kpiData.compliance.description}
                        trend={kpiData.compliance.trend}
                        status="normal"
                        sparkline={kpiData.compliance.sparkline}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12l2 2 4-4" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        }
                    />
                    <KPICard
                        title="AI Accuracy"
                        value={kpiData.anomalyAccuracy.value}
                        unit={kpiData.anomalyAccuracy.unit}
                        description={kpiData.anomalyAccuracy.description}
                        trend={kpiData.anomalyAccuracy.trend}
                        status="normal"
                        sparkline={kpiData.anomalyAccuracy.sparkline}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        }
                    />
                    <KPICard
                        title="Active Alerts"
                        value={kpiData.activeAlerts.value}
                        description={kpiData.activeAlerts.description}
                        trend={kpiData.activeAlerts.trend}
                        status={kpiData.activeAlerts.value > 10 ? 'critical' : kpiData.activeAlerts.value > 5 ? 'warning' : 'normal'}
                        sparkline={kpiData.activeAlerts.sparkline}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        }
                    />
                </section>

                {/* Main Content Grid */}
                <section className={styles.mainGrid}>
                    {/* Risk Posture */}
                    <Card header="Postur Risiko Organisasi">
                        <div className={styles.riskPosture}>
                            <div className={styles.gaugeSection}>
                                <RiskGauge
                                    value={42}
                                    title="Overall Risk"
                                    subtitle="Level risiko keseluruhan"
                                    size="lg"
                                />
                            </div>
                            <div className={styles.riskBreakdown}>
                                <div className={styles.riskItem}>
                                    <span className={styles.riskLabel}>Document Risk</span>
                                    <div className={styles.riskBar}>
                                        <div className={styles.riskProgress} style={{ width: '35%', background: 'var(--status-normal)' }} />
                                    </div>
                                    <span className={styles.riskValue}>35%</span>
                                </div>
                                <div className={styles.riskItem}>
                                    <span className={styles.riskLabel}>Digital Activity Risk</span>
                                    <div className={styles.riskBar}>
                                        <div className={styles.riskProgress} style={{ width: '52%', background: 'var(--status-warning)' }} />
                                    </div>
                                    <span className={styles.riskValue}>52%</span>
                                </div>
                                <div className={styles.riskItem}>
                                    <span className={styles.riskLabel}>Compliance Risk</span>
                                    <div className={styles.riskBar}>
                                        <div className={styles.riskProgress} style={{ width: '18%', background: 'var(--status-normal)' }} />
                                    </div>
                                    <span className={styles.riskValue}>18%</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Risk Trend */}
                    <Card header="Tren Risiko (3 Bulan Terakhir)">
                        <TimelineChart
                            data={riskTrendData}
                            color="#3d7ab8"
                            height={280}
                            yAxisLabel="Risk Score"
                        />
                    </Card>
                </section>

                {/* Recent Alerts Section */}
                <section className={styles.alertsSection}>
                    <Card header="Alert Terbaru Membutuhkan Perhatian">
                        <div className={styles.alertsList}>
                            {recentAlerts.map((alert) => (
                                <div key={alert.id} className={styles.alertItem}>
                                    <div className={styles.alertHeader}>
                                        <StatusBadge
                                            status={alert.severity}
                                            animate={alert.severity === 'critical'}
                                        />
                                        <span className={styles.alertTime}>{alert.time}</span>
                                    </div>
                                    <div className={styles.alertContent}>
                                        <span className={styles.alertDocument}>{alert.document}</span>
                                        <p className={styles.alertExplanation}>
                                            <strong>AI Explanation:</strong> {alert.explanation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>

                {/* XAI Info Banner */}
                <section className={styles.xaiBanner}>
                    <div className={styles.xaiIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </div>
                    <div className={styles.xaiContent}>
                        <h4>Explainable AI (XAI)</h4>
                        <p>
                            Setiap alert yang dihasilkan oleh sistem AI dilengkapi dengan penjelasan
                            yang mudah dipahami tentang mengapa alert tersebut dipicu. Ini memastikan
                            transparansi dan auditabilitas dalam pengambilan keputusan.
                        </p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
