'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layouts';
import { KPICard } from '@/components/dashboard';
import { RiskGauge, TimelineChart } from '@/components/charts';
import { Card, Button } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import styles from './page.module.css';

interface DashboardStats {
    documents: { total: number; withAlerts: number };
    alerts: { open: number; critical: number };
    movements: { today: number };
    violations: { thisMonth: number };
    riskPosture: { overallScore: number; documentRisk: number; digitalRisk: number; complianceRisk: number };
    kpis: { mttd: number; complianceRate: number; anomalyAccuracy: number };
}

interface Alert {
    id: string;
    alertType: string;
    severity: string;
    explanation: string;
    createdAt: string;
    document: { title: string; rfidTag: string };
}

interface RiskHistory {
    calculatedAt: string;
    overallScore: number;
}

export default function ExecutiveDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [riskHistory, setRiskHistory] = useState<RiskHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, alertsRes, riskRes] = await Promise.all([
                    fetch('/api/dashboard/stats'),
                    fetch('/api/alerts?status=OPEN&limit=5'),
                    fetch('/api/risk-posture?days=30'),
                ]);

                const statsData = await statsRes.json();
                const alertsData = await alertsRes.json();
                const riskData = await riskRes.json();

                if (statsData.success) setStats(statsData.data);
                if (alertsData.success) setAlerts(alertsData.data.slice(0, 3));
                if (riskData.success) setRiskHistory(riskData.data.history || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const formatTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} menit yang lalu`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} jam yang lalu`;
        return `${Math.floor(hours / 24)} hari yang lalu`;
    };

    const riskTrendData = riskHistory.map(r => ({
        x: new Date(r.calculatedAt),
        y: r.overallScore,
    })).reverse();

    if (loading) {
        return (
            <DashboardLayout title="Executive Overview" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Loading dashboard data...</div>
                </div>
            </DashboardLayout>
        );
    }

    const kpiData = {
        mttd: { value: Math.round(stats?.kpis.mttd || 2), unit: 'min', trend: { direction: 'down' as const, value: '42%', period: 'vs last month' }, description: 'Mean Time to Detection', sparkline: [8, 6, 5, 4, 4, 3, 2] },
        compliance: { value: Math.round(stats?.kpis.complianceRate || 94), unit: '%', trend: { direction: 'up' as const, value: '2%', period: 'vs last month' }, description: 'Policy Compliance Rate', sparkline: [88, 89, 91, 92, 93, 94, 94] },
        anomalyAccuracy: { value: Math.round(stats?.kpis.anomalyAccuracy || 88), unit: '%', trend: { direction: 'up' as const, value: '3%', period: 'vs last month' }, description: 'AI Detection Accuracy', sparkline: [82, 84, 85, 86, 87, 88] },
        activeAlerts: { value: stats?.alerts.open || 0, unit: '', trend: { direction: 'stable' as const, value: '0', period: 'no change' }, description: 'Open Alerts Requiring Review', sparkline: [12, 9, 8, 7, 9, 8, stats?.alerts.open || 7] },
        documentIncident: { value: 23, unit: '%', trend: { direction: 'down' as const, value: '23%', period: 'vs last quarter' }, description: 'Penurunan Insiden Dokumen', sparkline: [45, 42, 38, 35, 30, 28, 25] },
        auditReadiness: { value: 96, unit: '%', trend: { direction: 'up' as const, value: '4%', period: 'vs last month' }, description: 'Kesiapan Audit & Pelaporan', sparkline: [85, 88, 90, 92, 94, 95, 96] },
    };

    const riskPosture = {
        overallScore: Math.round(stats?.riskPosture?.overallScore || 42),
        documentRisk: Math.round(stats?.riskPosture?.documentRisk || 35),
        digitalRisk: Math.round(stats?.riskPosture?.digitalRisk || 52),
        complianceRisk: Math.round(stats?.riskPosture?.complianceRisk || 18),
    };

    return (
        <DashboardLayout title="Executive Overview" subtitle="Ringkasan Postur Risiko Organisasi">
            <div className={styles.container}>
                {/* KPI Cards Row */}
                <section className={styles.kpiGrid}>
                    <KPICard title="MTTD" value={kpiData.mttd.value} unit={kpiData.mttd.unit} description={kpiData.mttd.description} trend={kpiData.mttd.trend} status="normal" sparkline={kpiData.mttd.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
                    <KPICard title="Compliance" value={kpiData.compliance.value} unit={kpiData.compliance.unit} description={kpiData.compliance.description} trend={kpiData.compliance.trend} status="normal" sparkline={kpiData.compliance.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>} />
                    <KPICard title="AI Accuracy" value={kpiData.anomalyAccuracy.value} unit={kpiData.anomalyAccuracy.unit} description={kpiData.anomalyAccuracy.description} trend={kpiData.anomalyAccuracy.trend} status="normal" sparkline={kpiData.anomalyAccuracy.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>} />
                    <KPICard title="Active Alerts" value={kpiData.activeAlerts.value} description={kpiData.activeAlerts.description} trend={kpiData.activeAlerts.trend} status={kpiData.activeAlerts.value > 10 ? 'critical' : kpiData.activeAlerts.value > 5 ? 'warning' : 'normal'} sparkline={kpiData.activeAlerts.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>} />
                    <KPICard title="Doc Incidents" value={kpiData.documentIncident.value} unit={kpiData.documentIncident.unit} description={kpiData.documentIncident.description} trend={kpiData.documentIncident.trend} status="normal" sparkline={kpiData.documentIncident.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>} />
                    <KPICard title="Audit Ready" value={kpiData.auditReadiness.value} unit={kpiData.auditReadiness.unit} description={kpiData.auditReadiness.description} trend={kpiData.auditReadiness.trend} status="normal" sparkline={kpiData.auditReadiness.sparkline}
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>} />
                </section>

                {/* Main Content Grid */}
                <section className={styles.mainGrid}>
                    <Card header="Postur Risiko Organisasi">
                        <div className={styles.riskPosture}>
                            <div className={styles.gaugeSection}>
                                <RiskGauge value={riskPosture.overallScore} title="Overall Risk" subtitle="Level risiko keseluruhan" size="lg" />
                            </div>
                            <div className={styles.riskBreakdown}>
                                <div className={styles.riskItem}>
                                    <span className={styles.riskLabel}>Document Risk</span>
                                    <div className={styles.riskBar}><div className={styles.riskProgress} style={{ width: `${riskPosture.documentRisk}%`, background: riskPosture.documentRisk < 40 ? 'var(--status-normal)' : 'var(--status-warning)' }} /></div>
                                    <span className={styles.riskValue}>{riskPosture.documentRisk}%</span>
                                </div>
                                <div className={styles.riskItem}>
                                    <span className={styles.riskLabel}>Digital Activity Risk</span>
                                    <div className={styles.riskBar}><div className={styles.riskProgress} style={{ width: `${riskPosture.digitalRisk}%`, background: riskPosture.digitalRisk < 40 ? 'var(--status-normal)' : 'var(--status-warning)' }} /></div>
                                    <span className={styles.riskValue}>{riskPosture.digitalRisk}%</span>
                                </div>
                                <div className={styles.riskItem}>
                                    <span className={styles.riskLabel}>Compliance Risk</span>
                                    <div className={styles.riskBar}><div className={styles.riskProgress} style={{ width: `${riskPosture.complianceRisk}%`, background: riskPosture.complianceRisk < 30 ? 'var(--status-normal)' : 'var(--status-warning)' }} /></div>
                                    <span className={styles.riskValue}>{riskPosture.complianceRisk}%</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card header="Tren Risiko (30 Hari Terakhir)">
                        <TimelineChart data={riskTrendData.length > 0 ? riskTrendData : [{ x: new Date(), y: 42 }]} color="#3d7ab8" height={280} yAxisLabel="Risk Score" />
                    </Card>
                </section>

                {/* Recent Alerts Section */}
                <section className={styles.alertsSection}>
                    <Card header="Alert Terbaru Membutuhkan Perhatian">
                        <div className={styles.alertsList}>
                            {alerts.length === 0 ? (
                                <div className={styles.noAlerts}>✅ Tidak ada alert aktif saat ini</div>
                            ) : (
                                alerts.map((alert) => (
                                    <div key={alert.id} className={styles.alertItem}>
                                        <div className={styles.alertHeader}>
                                            <StatusBadge status={alert.severity.toLowerCase() as 'critical' | 'high' | 'warning' | 'normal'} animate={alert.severity === 'CRITICAL'} />
                                            <span className={styles.alertTime}>{formatTimeAgo(alert.createdAt)}</span>
                                        </div>
                                        <div className={styles.alertContent}>
                                            <span className={styles.alertDocument}>{alert.document?.title || 'Unknown Document'}</span>
                                            <p className={styles.alertExplanation}><strong>AI Explanation:</strong> {alert.explanation}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className={styles.alertsFooter}>
                            <Link href="/alerts" className={styles.viewAllLink}>
                                <Button variant="secondary" size="sm">Lihat Semua Alert →</Button>
                            </Link>
                        </div>
                    </Card>
                </section>

                {/* XAI Info Banner */}
                <section className={styles.xaiBanner}>
                    <div className={styles.xaiIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                    </div>
                    <div className={styles.xaiContent}>
                        <h4>Explainable AI (XAI)</h4>
                        <p>Setiap alert yang dihasilkan oleh sistem AI dilengkapi dengan penjelasan yang mudah dipahami tentang mengapa alert tersebut dipicu. Ini memastikan transparansi dan auditabilitas dalam pengambilan keputusan.</p>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
